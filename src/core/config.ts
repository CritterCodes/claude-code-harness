/**
 * The one home for configuration (ADR-0001). Environment variables are read here and nowhere else, and every value a
 * person might want to change — a URL, a timeout, a limit — is named here with its default, never typed into the code
 * that uses it. The `env-read` and `config-literal` checks fail the build otherwise.
 */
export interface Config {
  readonly apiBaseUrl: string;
  readonly requestTimeoutMs: number;
  readonly timeZone: string;
}

/** The defaults, used when the environment does not say. */
export const DEFAULTS: Config = {
  apiBaseUrl: 'https://api.example.com',
  requestTimeoutMs: 10_000,
  timeZone: 'UTC',
};

/** The configuration, from an environment (`process.env` by default) over the defaults. */
export function loadConfig(env: Record<string, string | undefined> = process.env): Config {
  const timeout = Number(env.REQUEST_TIMEOUT_MS);
  return {
    apiBaseUrl: env.API_BASE_URL ?? DEFAULTS.apiBaseUrl,
    requestTimeoutMs: Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULTS.requestTimeoutMs,
    timeZone: env.TIME_ZONE ?? DEFAULTS.timeZone,
  };
}
