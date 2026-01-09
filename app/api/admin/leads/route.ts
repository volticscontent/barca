import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '../../../lib/db';

export async function GET() {
  const cookieStore = await cookies();
  const auth = cookieStore.get('admin_auth');

  if (!auth || auth.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await pool.query('SELECT * FROM leads ORDER BY created_at DESC LIMIT 100');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
