import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/marketplace_test?schema=public';
process.env.JWT_SECRET = 'supersecretkey123456789012345678901234567890';
process.env.JWT_REFRESH_SECRET = 'superrefreshsecret123456789012345678901234567890';
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_dummy';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['test/api/**/*.test.ts', 'test/integration/**/*.test.ts', 'src/app/api/**/*.test.ts'],
    exclude: ['test/scripts/**', 'test/unit/**', 'test/component/**'],
    hookTimeout: 60000,
    testTimeout: 60000,
    fileParallelism: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
