import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT DISTINCT unnest(images) as img FROM products;');
    const allImages = res.rows.map(r => r.img);
    const localImgs = allImages.filter(img => !img.startsWith('http'));
    console.log('LOCAL_IMAGES_IN_DB:', localImgs);
    
    const remoteHosts = [...new Set(allImages.filter(img => img.startsWith('http')).map(img => {
      try { return new URL(img).hostname; } catch { return 'invalid-url'; }
    }))];
    console.log('REMOTE_HOSTS_IN_DB:', remoteHosts);
    console.log('TOTAL_UNIQUE_IMAGE_PATHS:', allImages.length);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
