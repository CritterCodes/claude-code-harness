/**
 * The guardrails, made mechanical — and PROVEN. Every rule is first shown firing on a planted violation, then the real
 * repository is shown clean. A rule that cannot fail is not a rule: a regex with a typo passes forever and protects
 * nothing, and nobody notices until the duplicate it should have caught has shipped.
 *
 * The pattern for every rule you add:
 *   1. plant — the exact shape of the copy you just folded away → expect ONE finding with this rule's name
 *   2. home  — the same line in the home file → expect NO finding
 *   3. repo  — scan() over the real source → expect nothing
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';
import { CHECKS, check, explain, scan } from './checks';
import { duplicateExports, generateCodemap } from './codemap';
import { findings as inboxFindings, isCommit, openQuestions } from '../inbox/inbox';
import { parseGoalQueue, progressLine } from '../goals/goals';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

describe('lint rules — one home for dates and the network, no stray logs', () => {
  const eslint = new ESLint({ cwd: ROOT });
  const lint = async (filePath: string, code: string) =>
    (await eslint.lintText(code, { filePath: join(ROOT, filePath) }))[0]!.messages.map((m) => m.message);

  it('refuses a second date formatter in the app, and names the home', async () => {
    expect((await lint('src/app/__planted.ts', "export const d = new Intl.DateTimeFormat('en-US').format(new Date());")).join(' ')).toMatch(/core\/time/);
    expect((await lint('src/app/__planted.ts', 'export const d = new Date().toLocaleDateString();')).join(' ')).toMatch(/core\/time/);
  });
  it('refuses a raw fetch in the app, and names the home', async () => {
    expect((await lint('src/app/__planted.ts', "export const r = fetch('/x');")).join(' ')).toMatch(/core\/http/);
  });
  it('refuses console.log in shipped code', async () => {
    expect((await lint('src/app/__planted.ts', "console.log('debug');")).join(' ')).toMatch(/console/);
  });
  it('allows them in their homes', async () => {
    expect(await lint('src/core/time.ts', "export const d = new Intl.DateTimeFormat('en-US').format(new Date());")).toEqual([]);
    expect(await lint('src/core/http.ts', "export const r = fetch('/x');")).toEqual([]);
  });
});

describe('architecture checks — each fires on a planted violation, and not in its home', () => {
  const planted: Record<string, [file: string, line: string]> = {
    'env-read': ['src/app/jobs.ts', 'const key = process.env.API_KEY;'],
    'config-literal': ['src/app/jobs.ts', 'const opts = { requestTimeoutMs: 5000 };'],
    'not-built-copy': ['src/app/page.ts', "const note = 'Exports are coming soon';"],
  };
  it('config-literal: a URL in a string is found too', () => {
    expect(check('src/app/jobs.ts', "const base = 'https://api.example.com';").map((f) => f.rule)).toEqual(['config-literal']);
  });

  it('every check has a planted test — a new rule without one fails here', () => {
    expect(CHECKS.map((c) => c.rule).filter((r) => !(r in planted))).toEqual([]);
  });
  for (const [rule, [file, line]] of Object.entries(planted)) {
    it(`${rule}: a planted copy is found`, () => {
      expect(check(file, line).map((f) => f.rule)).toEqual([rule]);
    });
  }
  it('env-read and config-literal: allowed in their home', () => {
    expect(check('src/core/config.ts', planted['env-read']![1])).toEqual([]);
    expect(check('src/core/config.ts', planted['config-literal']![1])).toEqual([]);
  });
  it('a test file is never scanned (tests plant violations on purpose)', () => {
    expect(check('src/app/jobs.test.ts', planted['env-read']![1])).toEqual([]);
  });
  it('the repository is clean', () => {
    expect(scan(ROOT).map(explain)).toEqual([]);
  });
});

describe('one name, one definition — an export defined twice is a second home', () => {
  // Known duplicates, each with why. Strike a line when it is folded. A new one fails; a fixed one left here fails too.
  const KNOWN: Readonly<Record<string, string>> = {};

  it('finds a planted second definition', () => {
    const root = mkdtempSync(join(tmpdir(), 'harness-dup-'));
    try {
      mkdirSync(join(root, 'src', 'core'), { recursive: true });
      writeFileSync(join(root, 'src', 'core', 'a.ts'), 'export const TIERS = 1;\n');
      writeFileSync(join(root, 'src', 'core', 'b.ts'), "export { TIERS } from './a';\n");
      expect(duplicateExports(root)).toEqual([]); // a re-export is not a second home
      writeFileSync(join(root, 'src', 'core', 'b.ts'), 'export const TIERS = 2;\n');
      expect(duplicateExports(root).map((d) => d.name)).toEqual(['TIERS']);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
  it('the repository defines each name once, apart from the known list — and the known list holds nothing fixed', () => {
    const found = duplicateExports(ROOT).map((d) => d.name);
    expect(found.filter((n) => !(n in KNOWN))).toEqual([]);
    expect(Object.keys(KNOWN).filter((n) => !found.includes(n))).toEqual([]);
  });
});

describe('generated files are never stale', () => {
  it('docs/CODEMAP.md is current — run `pnpm codemap`', () => {
    expect(readFileSync(join(ROOT, 'docs', 'CODEMAP.md'), 'utf8').replace(/\r\n/g, '\n')).toBe(generateCodemap(ROOT));
  });
});

describe('the inbox — human input is recorded before anything else is committed', () => {
  it('an entry without a recorded line is unrecorded', () => {
    const md = '## 2026-10-19 · partner\n> Should guests be able to export?\n\n## 2026-10-18 · owner\n> Ship it.\nrecorded: docs/decisions/ADR-0002.md\n';
    expect(inboxFindings(md).map((e) => e.heading)).toEqual(['2026-10-19 · partner']);
  });
  it('the template ships with nothing unrecorded', () => {
    expect(inboxFindings(readFileSync(join(ROOT, 'docs', 'INBOX.md'), 'utf8'))).toEqual([]);
  });
  it('the commit hook sees a commit anywhere in a chain, and nothing else', () => {
    expect(isCommit('git commit -m "x"')).toBe(true);
    expect(isCommit('git add . && git commit -F msg.txt')).toBe(true);
    expect(isCommit('pnpm check && git -C repo commit -m x')).toBe(true);
    expect(isCommit('git log --oneline')).toBe(false);
    expect(isCommit('git status; echo commit')).toBe(false);
  });
});

describe('the register — the session-start count is right', () => {
  it('counts open rows, not parked or closed ones', () => {
    const md = '| Q1 | **a** | open | x |\n| Q2 | **b** | **parked by the owner** | x |\n| Q3 | **c** | open — owner, later | x |\n| Q4 | answer | owner, 2026-01-01 |\n';
    expect(openQuestions(md)).toBe(2);
  });
  it('the template ships with no real open question', () => {
    expect(openQuestions(readFileSync(join(ROOT, 'docs', 'OPEN-QUESTIONS.md'), 'utf8'))).toBe(0);
  });
});

describe('the goal queue — every session opens knowing the next item', () => {
  it('reads done and open items in order, and names the next', () => {
    const md = '1. [x] **Sign-in** — built `abc123`.\n2. [ ] **Exports** — CSV.\n3a. [ ] **Audit log**\n- [ ] **not a queue item**\n';
    const items = parseGoalQueue(md);
    expect(items.map((i) => `${i.n}:${i.done}`)).toEqual(['1:true', '2:false', '3a:false']);
    expect(progressLine(items)).toBe('Goal: 1/3 done — next: item 2, Exports (docs/plan/GOAL.md).');
  });
  it('says the queue is empty when every item is ticked', () => {
    expect(progressLine(parseGoalQueue('1. [x] **A**\n2. [X] **B**\n'))).toMatch(/2\/2 done — the queue is empty/);
  });
  it('the template has no real queue, so the session hook stays quiet', () => {
    expect(progressLine(parseGoalQueue(readFileSync(join(ROOT, 'docs', 'plan', 'GOAL.md'), 'utf8')))).toBeNull();
  });
});
