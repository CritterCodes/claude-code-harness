import { defineConfig } from 'vitest/config';

// The lint-rule tests start ESLint (and typescript-eslint) cold; on a slow first run that can pass vitest's 5 s default.
export default defineConfig({ test: { include: ['src/**/*.test.ts', 'tools/**/*.test.ts'], testTimeout: 30_000 } });
