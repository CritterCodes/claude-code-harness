// The rules a lint selector can say. Each one names the HOME of the thing it forbids, so the error message tells
// Claude where to go instead. tools/guardrails/guardrails.test.ts proves each fires on a planted violation —
// a rule that cannot fail is not a rule.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

// One home per kind of thing (docs/decisions/ADR-0001). These are examples — replace them with your own homes.
const ONE_HOME = {
  'no-restricted-syntax': ['error',
    { selector: "NewExpression[callee.object.name='Intl'][callee.property.name='DateTimeFormat']", message: 'Dates are shown only through src/core/time.ts (formatDay) — ADR-0001.' },
    { selector: "CallExpression[callee.property.name=/^toLocale(Date|Time)?String$/]", message: 'Dates are shown only through src/core/time.ts (formatDay): the server clock is not the user’s — ADR-0001.' },
    { selector: "CallExpression[callee.name='fetch']", message: 'The network is reached only through src/core/http.ts (getJson) — ADR-0001.' },
  ],
};

export default tseslint.config(
  { ignores: ['node_modules/**', '.claude/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['src/**/*.ts'], ignores: ['src/core/time.ts', 'src/core/http.ts', '**/*.test.ts'], rules: ONE_HOME },
  // Shipped code never console.logs: a stray log is noise in production and sometimes a leak. warn/error stay.
  { files: ['src/**/*.ts'], ignores: ['**/*.test.ts'], rules: { 'no-console': ['error', { allow: ['warn', 'error'] }] } },
);
