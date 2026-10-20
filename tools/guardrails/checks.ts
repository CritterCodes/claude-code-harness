/**
 * Architecture checks — the rules a lint selector cannot say. Each check is a pure function over (path, source), so its
 * test can PLANT a violation and watch it fire; `scan` runs every check over the real source.
 *
 * How to add one (ADR-0001): when you find a second copy of something, fold it into its home, then add a check here
 * whose `pattern` matches the copy you just removed, and a planted test in guardrails.test.ts. The duplicate you found
 * is the exact shape the next one will take.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

export interface Finding { readonly file: string; readonly line: number; readonly rule: string; readonly text: string }
export interface Check {
  /** A short name, used in the failure and in docs/GUARDRAILS.md. */
  readonly rule: string;
  /** Where the thing lives instead — printed in the failure, so the fix is obvious. */
  readonly home: string;
  /** Files where the pattern is allowed (the home itself, migrations, seeds…). */
  readonly allowed: (path: string) => boolean;
  /** One line that matches is one finding. */
  readonly pattern: RegExp;
}

const norm = (p: string) => p.split(sep).join('/');
const isTest = (p: string) => /\.test\.tsx?$/.test(p);

export const CHECKS: readonly Check[] = [
  {
    rule: 'env-read',
    home: 'src/core/config.ts (loadConfig) — the environment is read in one place (ADR-0001)',
    allowed: (p) => p === 'src/core/config.ts',
    pattern: /\bprocess\.env\b|\bimport\.meta\.env\b/,
  },
  {
    rule: 'config-literal',
    home: 'src/core/config.ts (DEFAULTS) — a URL, timeout, limit or retry count is configuration, never a literal where it is used',
    allowed: (p) => p === 'src/core/config.ts',
    // a URL in a string, or a timeout / limit / retry count set to a number
    pattern: /['"`]https?:\/\/|\b\w*(?:timeout|Timeout|limit|Limit|retries|Retries)\w*\s*[:=]\s*\d/,
  },
  {
    rule: 'not-built-copy',
    home: 'nowhere — a screen never promises work that is not built',
    allowed: (p) => !p.startsWith('src/app/'),
    pattern: /['"`>][^'"`<]*\b(coming soon|being built)\b/i,
  },
];

/** Findings for one file. Tests are never scanned: they plant violations on purpose. */
export function check(path: string, source: string, checks: readonly Check[] = CHECKS): Finding[] {
  const p = norm(path);
  if (isTest(p)) return [];
  const out: Finding[] = [];
  for (const c of checks) {
    if (c.allowed(p)) continue;
    source.split('\n').forEach((text, i) => {
      if (c.pattern.test(text)) out.push({ file: p, line: i + 1, rule: c.rule, text: text.trim().slice(0, 140) });
    });
  }
  return out;
}

const SKIP = new Set(['node_modules', 'dist', '.next']);
function walk(dir: string, root: string, acc: string[]): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, root, acc);
    else if (/\.tsx?$/.test(name)) acc.push(norm(relative(root, full)));
  }
  return acc;
}

/** Every finding in the shipped source. */
export function scan(root: string): Finding[] {
  return walk(join(root, 'src'), root, []).flatMap((f) => check(f, readFileSync(join(root, f), 'utf8')));
}

/** A finding as a line a person (or Claude) can act on. */
export const explain = (f: Finding): string => `${f.file}:${f.line} [${f.rule}] ${f.text}\n    → lives in: ${CHECKS.find((c) => c.rule === f.rule)?.home}`;
