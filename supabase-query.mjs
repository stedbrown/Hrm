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

// Funzione per fare richieste a Supabase usando fetch
async function makeRequest(endpoint, method = 'GET') {
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
    
    req.end();
  });
}

// Funzioni di utility per le query
async function listTables() {
  try {
    console.log('Recupero lista tabelle...');
    const data = await makeRequest('/rest/v1/?select=*');
    
    console.log('Tabelle disponibili:');
    console.log(data);
    
    // Salva l'output in un file JSON
    fs.writeFileSync('tables.json', JSON.stringify(data, null, 2));
    console.log('Risultati salvati in tables.json');
    
    return data;
  } catch (error) {
    console.error('Errore durante il recupero delle tabelle:', error.message);
  }
}

async function getTableData(tableName, limit = 100) {
  try {
    console.log(`Recupero dati dalla tabella ${tableName}...`);
    const data = await makeRequest(`/rest/v1/${tableName}?select=*&limit=${limit}`);
    
    console.log(`Dati della tabella ${tableName}:`);
    console.log(data);
    
    // Salva l'output in un file JSON
    fs.writeFileSync(`${tableName}.json`, JSON.stringify(data, null, 2));
    console.log(`Risultati salvati in ${tableName}.json`);
    
    return data;
  } catch (error) {
    console.error(`Errore durante il recupero dei dati dalla tabella ${tableName}:`, error.message);
  }
}

async function getBookings() {
  try {
    console.log('Recupero prenotazioni...');
    const data = await makeRequest('/rest/v1/bookings?select=*,rooms:room_id(room_number,room_type)&order=created_at.desc');
    
    console.log('Prenotazioni:');
    console.log(data);
    
    // Salva l'output in un file JSON
    fs.writeFileSync('bookings.json', JSON.stringify(data, null, 2));
    console.log('Risultati salvati in bookings.json');
    
    return data;
  } catch (error) {
    console.error('Errore durante il recupero delle prenotazioni:', error.message);
  }
}

async function getRooms() {
  try {
    console.log('Recupero camere...');
    const data = await makeRequest('/rest/v1/rooms?select=*&order=room_number.asc');
    
    console.log('Camere:');
    console.log(data);
    
    // Salva l'output in un file JSON
    fs.writeFileSync('rooms.json', JSON.stringify(data, null, 2));
    console.log('Risultati salvati in rooms.json');
    
    return data;
  } catch (error) {
    console.error('Errore durante il recupero delle camere:', error.message);
  }
}

// Main
async function main() {
  // Mostra le informazioni di connessione
  console.log('Informazioni di connessione al database Supabase:');
  console.log('--------------------------------------------------');
  console.log(`URL: ${supabaseUrl}`);
  console.log(`API Key: ********${supabaseKey.slice(-6)}`);
  console.log('--------------------------------------------------');
  
  // Gestisci gli argomenti da riga di comando
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'tables':
      await listTables();
      break;
    case 'table':
      if (!args[0]) {
        console.error('Devi specificare il nome della tabella');
        process.exit(1);
      }
      await getTableData(args[0], args[1] || 100);
      break;
    case 'bookings':
      await getBookings();
      break;
    case 'rooms':
      await getRooms();
      break;
    default:
      console.log(`
Utilizzo:
  node supabase-query.mjs tables                    - Elenca tutte le tabelle
  node supabase-query.mjs table [nome_tabella] [limit] - Mostra i dati di una tabella
  node supabase-query.mjs bookings                  - Mostra tutte le prenotazioni
  node supabase-query.mjs rooms                     - Mostra tutte le camere
`);
  }
}

main(); 