import { Redis } from 'ioredis';

const testUrls = [
  'rediss://default:AawGAAIgcDExMTc2OGI0ODMzM2Q0Y2U2OWI4MmY1YWJhZTczMWZlOA@obliging-herring-44038.upstash.io:6379',
  'rediss://:AawGAAIgcDExMTc2OGI0ODMzM2Q0Y2U2OWI4MmY1YWJhZTczMWZlOA@obliging-herring-44038.upstash.io:6379'
];

async function tryConnect(url) {
  console.log('Testing url:', url.replace(/:[^:@]+@/, ':****@'));
  const client = new Redis(url, { connectTimeout: 5000, maxRetriesPerRequest: 1 });
  try {
    const pong = await client.ping();
    console.log('PING SUCCESS:', pong);
    await client.quit();
    return true;
  } catch (err) {
    console.log('PING FAILED:', err.message);
    try { client.disconnect(); } catch (e) {}
    return false;
  }
}

async function main() {
  for (const url of testUrls) {
    const ok = await tryConnect(url);
    if (ok) {
      console.log('Working URL found!');
      process.exit(0);
    }
  }
  process.exit(1);
}

main();
