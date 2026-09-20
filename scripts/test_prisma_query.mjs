import 'dotenv/config';
import { prisma } from '../src/lib/prisma.js';

async function test() {
  console.log('Testing prisma query...');
  try {
    const users = await prisma.user.findMany();
    console.log('Users found:', users.length);
    process.exit(0);
  } catch (err) {
    console.error('Prisma query error:', err);
    process.exit(1);
  }
}

test();
