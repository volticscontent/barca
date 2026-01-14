/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
let envVars = {};

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            let value = parts.slice(1).join('=').trim();
            // Remove quotes if present
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            envVars[key] = value;
        }
    });
}

const connectionString = envVars.POSTGRES_URL || process.env.POSTGRES_URL;

if (!connectionString) {
    console.error('No POSTGRES_URL found in .env.local or environment');
    process.exit(1);
}

console.log('Connecting to DB...');

const pool = new Pool({
    connectionString,
    // Add SSL if needed based on URL or environment, defaulting to allow unauthorized for dev
    ssl: connectionString.includes('sslmode=require') || connectionString.includes('vercel') || connectionString.includes('neon') ? { rejectUnauthorized: false } : undefined
});

async function run() {
    const client = await pool.connect();
    try {
        console.log('Connected. Creating tables...');
        await client.query('BEGIN');

        await client.query(`
            CREATE TABLE IF NOT EXISTS orders (
              id SERIAL PRIMARY KEY,
              stripe_session_id TEXT UNIQUE,
              payment_intent_id TEXT,
              customer_email TEXT,
              customer_name TEXT,
              customer_phone TEXT,
              status TEXT DEFAULT 'pending',
              amount_total DECIMAL(10, 2),
              currency TEXT DEFAULT 'EUR',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              utm_source TEXT,
              utm_medium TEXT,
              utm_campaign TEXT,
              utm_term TEXT,
              utm_content TEXT
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS order_items (
              id SERIAL PRIMARY KEY,
              order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
              sku TEXT NOT NULL,
              product_name TEXT,
              quantity INTEGER DEFAULT 1,
              size TEXT,
              customization JSONB,
              price DECIMAL(10, 2),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query('COMMIT');
        console.log('Tables created successfully.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error:', e);
    } finally {
        client.release();
        pool.end();
    }
}

run();
