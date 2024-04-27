import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      reportsDirectory: './coverage',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{js,ts}', '!src/index.ts'],
      exclude: ['**/*.test.{js,ts}', '**/node_modules/**']
    }
  }
});
