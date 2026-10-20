/**
 * The one home for talking to the network (ADR-0001). Every request gets the same timeout, the same error shape and
 * the same base URL — so when one of those has to change, it changes once. ESLint refuses `fetch(` anywhere else.
 */
import type { Config } from './config';

/** A failed request, said the same way everywhere. */
export class HttpError extends Error {
  constructor(readonly status: number, readonly path: string) { super(`HTTP ${status} on ${path}`); }
}

/** GET a JSON resource under the configured base URL, with the configured timeout. */
export async function getJson<T>(config: Config, path: string, fetchImpl: typeof fetch = fetch): Promise<T> {
  const res = await fetchImpl(new URL(path, config.apiBaseUrl), { signal: AbortSignal.timeout(config.requestTimeoutMs) });
  if (!res.ok) throw new HttpError(res.status, path);
  return (await res.json()) as T;
}
