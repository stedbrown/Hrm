import { serve } from "http/server";
import { createClient } from "@supabase/supabase-js";

// Definizione dei tipi
interface QueryResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface QueryWithResult {
  query: string;
  result: QueryResult;
}

// Funzione per eseguire una query SQL
async function executeSQL(supabase: any, query: string): Promise<QueryResult> {
  try {
    // Prima proviamo a usare la funzione RPC 'sql' se esiste
    const { data, error: rpcError } = await supabase.rpc('sql', { query });
    
    if (!rpcError) {
      return { success: true, data };
    }
    
    // Se la funzione RPC non esiste, eseguiamo la query direttamente
    // Nota: questo richiede privilegi elevati e funziona solo con la chiave service_role
    const { data: directData, error: directError } = await supabase.auth.admin.executeRawSQL(query);
    
    if (directError) {
      throw directError;
    }
    
    return { success: true, data: directData };
  } catch (error) {
    console.error("Errore nell'esecuzione della query SQL:", error);
    return { success: false, error: error.message || "Errore sconosciuto" };
  }
}

// Funzione per eseguire un file SQL
async function executeSQLFile(supabase: any, sqlContent: string) {
  // Dividiamo il file in singole query (separate da ;)
  const queries = sqlContent
    .split(';')
    .map(q => q.trim())
    .filter(q => q.length > 0);
  
  const results: QueryWithResult[] = [];
  
  for (const query of queries) {
    const result = await executeSQL(supabase, query);
    results.push({ query, result });
    
    // Se una query fallisce, interrompiamo l'esecuzione
    if (!result.success) {
      return { success: false, results };
    }
  }
  
  return { success: true, results };
}

// Namespace Deno per TypeScript
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }
  export const env: Env;
}

serve(async (req) => {
  // Configurazione CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  };
  
  // Gestione delle richieste OPTIONS (preflight CORS)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }
  
  try {
    // Ottieni le variabili d'ambiente
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Variabili d'ambiente mancanti: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
    }
    
    // Crea il client Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Ottieni i dati dalla richiesta
    const { query, sqlFile, sqlContent } = await req.json();
    
    let result;
    
    if (query) {
      // Esegui una singola query
      result = await executeSQL(supabase, query);
    } else if (sqlContent) {
      // Esegui il contenuto SQL fornito
      result = await executeSQLFile(supabase, sqlContent);
    } else {
      throw new Error("Nessuna query o contenuto SQL fornito");
    }
    
    // Restituisci il risultato
    return new Response(JSON.stringify(result), { headers, status: result.success ? 200 : 400 });
  } catch (error) {
    console.error("Errore:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Errore sconosciuto" }),
      { headers, status: 400 }
    );
  }
}); 