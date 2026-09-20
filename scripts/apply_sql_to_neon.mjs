import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('No DATABASE_URL found!');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

async function main() {
  const sqlPath = path.resolve('scripts/init_db.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Connecting to Neon PostgreSQL...');
  const client = await pool.connect();
  console.log('Connected! Executing DDL migration script (636 lines)...');

  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('SUCCESS: All tables, enums, and indexes successfully created on Neon!');
    
    // Query table count
    const res = await client.query(`
      SELECT count(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log('Total public tables created in Neon:', res.rows[0].table_count);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
