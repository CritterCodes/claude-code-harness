# CODEMAP — what already exists

**Generated — do not edit.** `pnpm codemap` rewrites it; the guardrails test fails when it is stale.
**Search this before writing any export** (ADR-0001). Where each *kind* of thing lives is [`GUARDRAILS.md`](GUARDRAILS.md).

## `src/core`

### `src/core/config.ts`

- `Config` *interface* — The one home for configuration (ADR-0001).
- `DEFAULTS` *const* — The defaults, used when the environment does not say.
- `loadConfig` *fn* — The configuration, from an environment (`process.env` by default) over the defaults.

### `src/core/http.ts`

- `HttpError` *class* — A failed request, said the same way everywhere.
- `getJson` *fn* — GET a JSON resource under the configured base URL, with the configured timeout.

### `src/core/time.ts`

- `formatDay` *fn* — A moment as the calendar day it is in `zone` ("Oct 19, 2026").
