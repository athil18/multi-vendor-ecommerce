import { defineConfig } from 'vitest/config';
import path from 'path';

import 'dotenv/config';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:123@localhost:5432/marketplace?schema=public';
process.env.JWT_SECRET = 'supersecretkey123456789012345678901234567890';
process.env.JWT_REFRESH_SECRET = 'superrefreshsecret123456789012345678901234567890';
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_dummy';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.ts', 'src/app/api/**/*.test.ts'],
    exclude: ['test/scripts/**'],
    hookTimeout: 900000,
    testTimeout: 900000,
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/app/api/**/*.ts', 'src/lib/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/**/index.ts', 'e2e/**', 'test/**'],
      thresholds: {
        statements: 80,
        functions: 80,
        branches: 70,
        lines: 80
      }
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
