import { describe, expect, it } from 'vitest';
import { DEFAULTS, loadConfig } from './config';
import { getJson, HttpError } from './http';
import { formatDay } from './time';

describe('config — read in one place, defaults named', () => {
  it('takes the environment over the defaults, and ignores a nonsense timeout', () => {
    expect(loadConfig({ API_BASE_URL: 'https://staging.example.com', REQUEST_TIMEOUT_MS: 'soon' })).toEqual({ ...DEFAULTS, apiBaseUrl: 'https://staging.example.com' });
  });
});

describe('http — one way to call out, one way to fail', () => {
  const ok = (async () => new Response('{"id":1}')) as unknown as typeof fetch;
  const notFound = (async () => new Response('', { status: 404 })) as unknown as typeof fetch;
  it('returns the JSON', async () => {
    expect(await getJson(DEFAULTS, '/items/1', ok)).toEqual({ id: 1 });
  });
  it('throws an HttpError that names the status and the path', async () => {
    await expect(getJson(DEFAULTS, '/items/2', notFound)).rejects.toThrow(HttpError);
    await expect(getJson(DEFAULTS, '/items/2', notFound)).rejects.toThrow('HTTP 404 on /items/2');
  });
});

describe('time — a day is said in a zone, never the server clock', () => {
  it('the same moment is a different day in different zones', () => {
    const lateEvening = new Date('2026-10-19T03:30:00Z');
    expect(formatDay(lateEvening, 'UTC')).toBe('Oct 19, 2026');
    expect(formatDay(lateEvening, 'America/Chicago')).toBe('Oct 18, 2026');
  });
});
