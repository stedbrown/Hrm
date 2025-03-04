import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

// Ottieni la directory corrente per ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Funzione per leggere il file .env e ottenere le variabili d'ambiente
function loadEnv() {
  try {
    const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    const envVars = {};
    
    envFile.split('\n').forEach(line => {
      // Ignora le linee vuote o i commenti
      if (!line || line.startsWith('#')) return;
      
      // Divide la linea in chiave e valore
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Errore durante la lettura del file .env:', error.message);
    return {};
  }
}

// Carica le variabili d'ambiente
const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Errore: Le variabili VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY devono essere definite nel file .env');
  process.exit(1);
}

// Rimuovi eventuali barre finali dall'URL
const baseUrl = supabaseUrl.replace(/\/$/, '');

// Funzione per fare richieste a Supabase
async function makeRequest(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    };

    const url = `${baseUrl}${endpoint}`;
    
    console.log(`Esecuzione richiesta ${method} a ${url}`);
    
    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData);
        } catch (e) {
          console.error('Errore durante il parsing della risposta:', e.message);
          reject(e);
        }
      });
    });
    
    req.on('error', (e) => {
      console.error(`Errore nella richiesta: ${e.message}`);
      reject(e);
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// Funzione per verificare le relazioni del database
async function checkRelationships() {
  console.log('Verifica delle relazioni tra le tabelle del database...');
  
  try {
    // SQL per recuperare le informazioni sulle chiavi esterne
    const query = `
      SELECT
        tc.table_schema, 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name;
    `;
    
    // Esegui la query SQL usando l'API REST di Supabase
    const data = await makeRequest('/rest/v1/rpc/execute_sql', 'POST', {
      sql: query
    });
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('Relazioni trovate nel database:');
      console.log('----------------------------------------');
      
      const relationships = {};
      
      // Organizza le relazioni per tabella
      data.forEach(relation => {
        const tableName = relation.table_name;
        if (!relationships[tableName]) {
          relationships[tableName] = [];
        }
        relationships[tableName].push({
          constraint: relation.constraint_name,
          column: relation.column_name,
          references: {
            table: relation.foreign_table_name,
            column: relation.foreign_column_name
          }
        });
      });
      
      // Stampa le relazioni in modo leggibile
      for (const [table, relations] of Object.entries(relationships)) {
        console.log(`Tabella: ${table}`);
        relations.forEach(rel => {
          console.log(`  - Colonna ${rel.column} → Riferimento a ${rel.references.table}(${rel.references.column})`);
        });
        console.log('----------------------------------------');
      }
      
      // Salva le relazioni in un file JSON
      fs.writeFileSync('relationships.json', JSON.stringify(relationships, null, 2));
      console.log('Relazioni salvate in relationships.json');
      
      // Verifica specifiche relazioni attese
      checkExpectedRelationships(relationships);
    } else {
      console.log('Nessuna relazione trovata nel database o errore nella query.');
      if (data.error) {
        console.error('Errore:', data.error);
      }
    }
  } catch (error) {
    console.error('Errore durante la verifica delle relazioni:', error.message);
  }
}

// Funzione per verificare le relazioni attese
function checkExpectedRelationships(relationships) {
  console.log('\nVerifica delle relazioni attese:');
  console.log('----------------------------------------');
  
  // Lista delle relazioni attese
  const expectedRelations = [
    { table: 'bookings', column: 'room_id', refTable: 'rooms', refColumn: 'id' },
    { table: 'restaurant_orders', column: 'user_id', refTable: 'users', refColumn: 'id' },
    { table: 'order_items', column: 'order_id', refTable: 'restaurant_orders', refColumn: 'id' },
    { table: 'order_items', column: 'menu_item_id', refTable: 'restaurant_menu', refColumn: 'id' },
    { table: 'notifications', column: 'user_id', refTable: 'users', refColumn: 'id' }
  ];
  
  let missingRelations = [];
  
  // Controlla ogni relazione attesa
  expectedRelations.forEach(expected => {
    const tableRelations = relationships[expected.table] || [];
    const found = tableRelations.some(rel => 
      rel.column === expected.column && 
      rel.references.table === expected.refTable && 
      rel.references.column === expected.refColumn
    );
    
    if (found) {
      console.log(`✅ Trovata relazione: ${expected.table}.${expected.column} → ${expected.refTable}.${expected.refColumn}`);
    } else {
      console.log(`❌ Manca relazione: ${expected.table}.${expected.column} → ${expected.refTable}.${expected.refColumn}`);
      missingRelations.push(expected);
    }
  });
  
  // Suggerimenti per aggiungere relazioni mancanti
  if (missingRelations.length > 0) {
    console.log('\nPer aggiungere le relazioni mancanti, esegui queste query SQL:');
    console.log('----------------------------------------');
    
    missingRelations.forEach(rel => {
      console.log(`
ALTER TABLE public.${rel.table}
ADD CONSTRAINT fk_${rel.table}_${rel.column}_${rel.refTable}
FOREIGN KEY (${rel.column})
REFERENCES public.${rel.refTable}(${rel.refColumn})
ON DELETE CASCADE;
      `);
    });
  } else {
    console.log('\n✅ Tutte le relazioni attese sono presenti nel database!');
  }
}

// Esegui la verifica
checkRelationships(); 