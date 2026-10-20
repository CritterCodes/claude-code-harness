/**
 * An example caller: the app uses the homes and never re-implements them. Delete `src/` when you adopt the harness —
 * it is here so the guardrails have real code to scan on day one.
 */
import { loadConfig } from '../core/config';
import { getJson } from '../core/http';
import { formatDay } from '../core/time';

/** One line saying when a service last deployed. */
export async function statusLine(): Promise<string> {
  const config = loadConfig();
  const { name, deployedAt } = await getJson<{ name: string; deployedAt: string }>(config, '/status');
  return `${name} — last deployed ${formatDay(new Date(deployedAt), config.timeZone)}`;
}
