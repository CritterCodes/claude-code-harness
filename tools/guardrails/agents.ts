/**
 * Subagents stay narrow (ADR-0002): each `.claude/agents/*.md` reports and never writes, reads the shared docs instead of
 * holding rules of its own, and stays short enough that it cannot become a second rulebook. A pure check over
 * (file name, text, which paths exist) so its test can plant a bad agent and watch it fail.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, posix } from 'node:path';

/** The most lines an agent's body may have. Past this it is holding rules that belong in docs/. */
export const AGENT_MAX_BODY_LINES = 30;
/** Tools that change files. Only the main session writes. */
export const WRITE_TOOLS = ['Edit', 'Write', 'NotebookEdit', 'MultiEdit'] as const;
/**
 * Shells. A shell can write, commit and push, and no frontmatter field limits what it runs — so an agent with one must
 * say in its body that it never does. That sentence is the only limit; this check makes sure it is there, not that it is obeyed.
 */
export const SHELL_TOOLS = ['Bash', 'PowerShell'] as const;
const SAYS_READ_ONLY = /\bnever\b[^.]*\bwrite\b[^.]*\bcommit\b/i;

/** Every problem with one agent file; `exists` says whether a repo-relative path exists. */
export function agentProblems(fileName: string, text: string, exists: (repoPath: string) => boolean): string[] {
  const md = text.replace(/\r\n/g, '\n');
  const fm = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(md);
  if (!fm) return [`${fileName}: no frontmatter`];
  const [, head = '', body = ''] = fm;
  const field = (k: string) => new RegExp(`^${k}:\\s*(.+)$`, 'm').exec(head)?.[1]?.trim();
  const out: string[] = [];
  const name = field('name');
  if (name !== fileName.replace(/\.md$/, '')) out.push(`${fileName}: name "${name}" does not match the file name`);
  if (!field('description')) out.push(`${fileName}: no description (it is how the main session knows when to call it)`);
  const tools = (field('tools') ?? '').split(',').map((t) => t.trim()).filter(Boolean);
  if (!tools.length) out.push(`${fileName}: no tools list (omitting it grants every tool, including writes)`);
  const writes = tools.filter((t) => (WRITE_TOOLS as readonly string[]).includes(t));
  if (writes.length) out.push(`${fileName}: may write (${writes.join(', ')}) — agents report, the main session writes`);
  const shells = tools.filter((t) => (SHELL_TOOLS as readonly string[]).includes(t));
  if (shells.length && !SAYS_READ_ONLY.test(body)) out.push(`${fileName}: has a shell (${shells.join(', ')}) but does not say it never writes or commits`);
  const links = [...body.matchAll(/\]\(([^)#\s]+)/g)].map((m) => m[1]!).filter((l) => !/^https?:/.test(l));
  const repoPaths = links.map((l) => posix.normalize(posix.join('.claude/agents', l)));
  if (!repoPaths.includes('CLAUDE.md')) out.push(`${fileName}: does not link CLAUDE.md — an agent reads the shared docs`);
  for (const p of repoPaths) if (!exists(p)) out.push(`${fileName}: links ${p}, which does not exist`);
  const lines = body.trim().split('\n').length;
  if (lines > AGENT_MAX_BODY_LINES) out.push(`${fileName}: ${lines} lines (max ${AGENT_MAX_BODY_LINES}) — move the rules into docs/ and link them`);
  return out;
}

/** Every problem with every agent in the repository. */
export function scanAgents(root: string): string[] {
  const dir = join(root, '.claude', 'agents');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.md'))
    .flatMap((f) => agentProblems(f, readFileSync(join(dir, f), 'utf8'), (p) => existsSync(join(root, p))));
}
