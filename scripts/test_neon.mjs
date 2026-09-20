import pg from 'pg';

const connectionString = "postgresql://neondb_owner:npg_nR2Tf1ympHDX@ep-red-violet-b4cqhqy5-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";

const pool = new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
});

async function main() {
  try {
    console.log('Connecting to Neon...');
    const client = await pool.connect();
    console.log('Connected! Querying...');
    const res = await client.query('SELECT current_database(), current_user, version();');
    console.log('SUCCESS:', res.rows[0]);
    client.release();
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('CONNECTION_ERROR:', err.message);
    await pool.end();
    process.exit(1);
  }
}

main();
