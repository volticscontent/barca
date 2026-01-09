import { Pool } from 'pg';

let pool: Pool;

if (!global.pool) {
  const config = process.env.POSTGRES_URL 
    ? { connectionString: process.env.POSTGRES_URL }
    : {
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
      };

  global.pool = new Pool(config);
}

pool = global.pool;

export default pool;

// Helper type for global pool to prevent multiple connections in dev
declare global {
  var pool: Pool | undefined;
}
