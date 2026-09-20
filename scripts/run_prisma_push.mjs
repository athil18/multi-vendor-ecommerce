import 'dotenv/config';
import { spawn } from 'child_process';
import path from 'path';

const prismaCli = path.resolve('node_modules/prisma/build/index.js');
console.log('Starting prisma db push via node with DEBUG...');

const child = spawn(process.execPath, [prismaCli, 'db', 'push', '--accept-data-loss'], {
  env: {
    ...process.env,
    DEBUG: 'prisma:cli*,prisma:engine*',
    PRISMA_TELEMETRY_INFORMATION: '0',
    CHECKPOINT_DISABLE: '1',
  },
  stdio: ['pipe', 'pipe', 'pipe']
});

child.stdout.on('data', (d) => process.stdout.write(d));
child.stderr.on('data', (d) => process.stderr.write(d));

child.on('close', (code) => {
  console.log(`\nPrisma process exited with code ${code}`);
  process.exit(code || 0);
});
