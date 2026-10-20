/**
 * `pnpm inbox` — what a human said that no session has written into the docs yet.
 *
 * docs/INBOX.md is where input lands: a partner's answer, a tester's note, a ruling given in a chat that has to outlive
 * the chat. Each entry is a `## ` heading. An entry is RECORDED once a session has written it into the document that owns
 * it and added a line `recorded: <that document>` under it.
 *
 *   pnpm inbox                  the list
 *   pnpm inbox --hook session   for the SessionStart hook: the list (and the open-question count), or nothing
 *   pnpm inbox --hook commit    for the PreToolUse hook: exits 2 — blocking the tool call — on a `git commit`
 *                               while any entry is unrecorded
 *
 * The inbox can live anywhere people can reach — a web form, an issue label, a database. A markdown file is the same
 * idea with no infrastructure; swap the reader for yours.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Entry { readonly heading: string; readonly body: string }

/** The unrecorded entries in an inbox page. */
export function findings(md: string): Entry[] {
  return md.replace(/\r\n/g, '\n').split(/^## /m).slice(1)
    .map((chunk) => { const [heading = '', ...rest] = chunk.split('\n'); return { heading: heading.trim(), body: rest.join('\n').trim() }; })
    .filter((e) => !/^recorded:\s*\S/m.test(e.body));
}

/** How many questions the register lists as open. */
export function openQuestions(md: string): number {
  return md.split('\n').filter((l) => /^\|\s*Q\d+\s*\|/.test(l) && /\|\s*open\b/i.test(l)).length;
}

/** Whether a shell command makes a git commit — anywhere in a chain (`git add . && git commit -m x`). */
export function isCommit(command: string): boolean {
  return /\bgit\b[^|;&]*\bcommit\b/.test(command);
}

async function stdinCommand(): Promise<string> {
  if (process.stdin.isTTY) return '';
  const chunks: Buffer[] = [];
  for await (const c of process.stdin) chunks.push(c as Buffer);
  try { return String((JSON.parse(Buffer.concat(chunks).toString('utf8')) as { tool_input?: { command?: unknown } }).tool_input?.command ?? ''); } catch { return ''; }
}

async function main(): Promise<number> {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const hook = process.argv.includes('--hook') ? process.argv[process.argv.indexOf('--hook') + 1] : null;
  if (hook === 'commit' && !isCommit(await stdinCommand())) return 0;

  const read = (p: string) => (existsSync(join(root, p)) ? readFileSync(join(root, p), 'utf8') : '');
  const open = findings(read('docs/INBOX.md'));
  const how = 'Record each in the document that owns it, with the person\'s words and the date, then add `recorded: <document>` under the entry in docs/INBOX.md.';

  if (hook === 'session') {
    const q = openQuestions(read('docs/OPEN-QUESTIONS.md'));
    const parts = [];
    if (open.length) parts.push(`Inbox: ${open.length} unrecorded — this is the first job.\n${open.map((e) => `  - ${e.heading}: ${e.body.split('\n')[0]}`).join('\n')}\n${how}`);
    if (q) parts.push(`Register: ${q} open question${q === 1 ? '' : 's'} in docs/OPEN-QUESTIONS.md — never pick an answer to one of these.`);
    if (parts.length) console.log(parts.join('\n\n'));
    return 0;
  }
  if (!open.length) { if (!hook) console.log('inbox: everything is recorded.'); return 0; }
  const text = `${open.length} inbox entr${open.length === 1 ? 'y' : 'ies'} not yet in the docs:\n${open.map((e) => `  - ${e.heading}`).join('\n')}\n${how}`;
  if (hook === 'commit') { console.error(`Commit blocked — ${text}`); return 2; }
  console.log(text);
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().then((code) => process.exit(code), (err) => { console.error(err); process.exit(0); });
}
