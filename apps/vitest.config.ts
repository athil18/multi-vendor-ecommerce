import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    fileParallelism: false,
    include: ['test/unit/**/*.test.ts', 'test/component/**/*.test.tsx', 'src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'e2e', 'test/scripts/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/**/index.ts', 'e2e/**'],
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
