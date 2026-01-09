const { Client } = require('pg');

// Simple .env parser since we might not have dotenv installed globally
function loadEnv() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const envPath = require('path').join(__dirname, '../.env.local');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    if (require('fs').existsSync(envPath)) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const envContent = require('fs').readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
      console.log('Loaded .env.local');
    } else {
        console.log('.env.local not found, relying on system env vars');
    }
  } catch (e) {
    console.error('Error loading .env.local', e);
  }
}

async function setupDatabase() {
  loadEnv();

  const connectionString = process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.error('POSTGRES_URL not found in environment variables.');
    process.exit(1);
  }

  // Parse URL to get database name and create a maintenance connection
  let targetDbName = 'psg_leads';
  let maintenanceConnectionString = connectionString;

  try {
    const dbUrl = new URL(connectionString);
    targetDbName = dbUrl.pathname.slice(1); // remove leading /
    dbUrl.pathname = '/postgres'; // Connect to default postgres db to create new db
    maintenanceConnectionString = dbUrl.toString();
  } catch (e) {
    console.log('Could not parse URL, assuming default DB creation might fail if not exists.', e);
  }

  console.log(`Connecting to maintenance database to check/create "${targetDbName}"...`);
  
  const maintenanceClient = new Client({
    connectionString: maintenanceConnectionString,
    ssl: connectionString.includes('sslmode=disable') ? false : { rejectUnauthorized: false }
  });

  try {
    await maintenanceClient.connect();
    
    // Check if DB exists
    const res = await maintenanceClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [targetDbName]);
    
    if (res.rowCount === 0) {
        console.log(`Database "${targetDbName}" does not exist. Creating...`);
        await maintenanceClient.query(`CREATE DATABASE "${targetDbName}"`);
        console.log(`Database "${targetDbName}" created successfully.`);
    } else {
        console.log(`Database "${targetDbName}" already exists.`);
    }
  } catch (err) {
      console.error('Error checking/creating database:', err.message);
      // We continue, maybe the user doesn't have permission to create DB but it exists
  } finally {
      await maintenanceClient.end();
  }

  console.log(`Connecting to "${targetDbName}"...`);
  // Mask password for logging if needed
  
  const client = new Client({
    connectionString: connectionString,
    ssl: connectionString.includes('sslmode=disable') ? false : { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected successfully.');

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sqlPath = require('path').join(__dirname, 'init-db.sql');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sql = require('fs').readFileSync(sqlPath, 'utf8');

    console.log('Executing SQL script...');
    await client.query(sql);
    
    console.log('✅ Database initialized successfully!');
    console.log('Table "leads" created/verified.');
    
  } catch (err) {
    console.error('❌ Error executing script:', err);
  } finally {
    await client.end();
  }
}

setupDatabase();
