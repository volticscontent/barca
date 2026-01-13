import { Pool } from 'pg';

const pool = global.pool || new Pool(process.env.POSTGRES_URL 
    ? { connectionString: process.env.POSTGRES_URL }
    : {
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
      });

if (process.env.NODE_ENV !== 'production') {
  global.pool = pool;
}

export default pool;

// Helper type for global pool to prevent multiple connections in dev
declare global {
  var pool: Pool | undefined;
}
