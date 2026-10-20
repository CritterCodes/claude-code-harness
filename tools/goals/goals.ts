/**
 * `pnpm goals` — where the goal queue stands: how many items are done, and the next one up.
 *
 * Reads docs/plan/GOAL.md, whose queue items look like `12. [x] **Name** — …` (ticked with the commit that built them).
 * The SessionStart hook runs it with `--hook session`, so every session — and every autonomous run — opens knowing which
 * item is next, instead of re-deriving it (or rebuilding one that is already done).
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface GoalItem { readonly n: string; readonly name: string; readonly done: boolean }

/** The queue items of a goal file, in the order written. Template placeholders (`<Item>`) are left out. */
export function parseGoalQueue(md: string): GoalItem[] {
  const out: GoalItem[] = [];
  for (const line of md.replace(/\r\n/g, '\n').split('\n')) {
    const m = /^\s*(\d+[a-z]?)\.\s+\[( |x|X)\]\s+\*\*(.+?)\*\*/.exec(line);
    if (m && !m[3]!.startsWith('<')) out.push({ n: m[1]!, name: m[3]!, done: m[2] !== ' ' });
  }
  return out;
}

/** One line: progress and the next item, or nothing when there is no real queue. */
export function progressLine(items: readonly GoalItem[]): string | null {
  if (!items.length) return null;
  const done = items.filter((i) => i.done).length;
  const next = items.find((i) => !i.done);
  return `Goal: ${done}/${items.length} done — ${next ? `next: item ${next.n}, ${next.name}` : 'the queue is empty; see "Never idle"'} (docs/plan/GOAL.md).`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const file = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'docs', 'plan', 'GOAL.md');
  const line = progressLine(existsSync(file) ? parseGoalQueue(readFileSync(file, 'utf8')) : []);
  if (line) console.log(line);
  else if (!process.argv.includes('--hook')) console.log('goals: no queue in docs/plan/GOAL.md yet.');
}
