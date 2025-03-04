import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Mostra le informazioni di connessione
console.log('Informazioni di connessione al database Supabase:');
console.log('--------------------------------------------------');
console.log(`URL: ${supabaseUrl || 'Non trovato'}`);
console.log(`API Key: ${supabaseKey ? '********' + supabaseKey.slice(-6) : 'Non trovata'}`);
console.log('--------------------------------------------------');

// Leggi tutti i file JS/TS nella directory src/lib
console.log('\nAnalisi dei file per trovare le query al database...');
console.log('--------------------------------------------------');

function scanDirectory(dir) {
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        scanDirectory(fullPath);
      } else if (file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
        analyzeFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`Errore durante la scansione della directory ${dir}:`, error.message);
  }
}

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Cerca le operazioni Supabase nel file
    const supabaseOperations = {
      select: (content.match(/\.select\(/g) || []).length,
      insert: (content.match(/\.insert\(/g) || []).length,
      update: (content.match(/\.update\(/g) || []).length,
      delete: (content.match(/\.delete\(/g) || []).length
    };
    
    const totalOperations = Object.values(supabaseOperations).reduce((a, b) => a + b, 0);
    
    if (totalOperations > 0) {
      console.log(`${filePath}:`);
      console.log(`  - Select: ${supabaseOperations.select}`);
      console.log(`  - Insert: ${supabaseOperations.insert}`);
      console.log(`  - Update: ${supabaseOperations.update}`);
      console.log(`  - Delete: ${supabaseOperations.delete}`);
      console.log(`  - Totale: ${totalOperations}`);
      console.log('--------------------------------------------------');
    }
  } catch (error) {
    console.error(`Errore durante l'analisi del file ${filePath}:`, error.message);
  }
}

// Analizza la directory src
try {
  scanDirectory(path.join(__dirname, 'src'));
} catch (error) {
  console.error('Errore durante la scansione della directory src:', error.message);
}

console.log('\nSuggerimenti per l\'accesso al database:');
console.log('--------------------------------------------------');
console.log('1. Per accedere alla dashboard di Supabase, visita:');
console.log('   https://supabase.com/dashboard/project/aycfuyxzdtbjbundqbhb');
console.log('\n2. Puoi eseguire query utilizzando il client Supabase in src/lib/supabase.ts');
console.log('\n3. Per eseguire query SQL direttamente, utilizza la console SQL di Supabase:');
console.log('   https://supabase.com/dashboard/project/aycfuyxzdtbjbundqbhb/sql/new');
console.log('--------------------------------------------------'); 