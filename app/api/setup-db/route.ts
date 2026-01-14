import { NextResponse } from 'next/server';
import pool from '../../lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Create orders table
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

      // Create order_items table
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
      
      return NextResponse.json({ message: 'Database tables created successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error setting up database:', error);
    return NextResponse.json(
      { error: `Database setup failed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
