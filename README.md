# claude-code-harness

A harness for building real software with Claude Code over weeks, not minutes. Any language, any domain: a web app, an
API, a game, a data pipeline, a CLI.

It came out of a large rewrite done almost entirely with Claude Code: ~700 commits in four weeks, with the codebase
getting *stricter* as it grew instead of looser. This repo is the scaffolding around that work, with the project taken
out.

**The idea in one line:** nothing important depends on Claude remembering it. Every rule that matters is either in a
document Claude is routed to, or in code that fails the build.

---

## The problem it solves

Claude Code is very good inside one session. The failures happen *between* sessions:

| What goes wrong | Why |
|---|---|
| The same helper gets written five times, slightly differently | Each session solves its problem locally and doesn't know the last one did |
| A proposal hardens into "the decision" | A session reads a confident paragraph and builds on it; nobody ruled |
| Open questions get quietly answered | The model fills gaps with reasonable defaults, and three weeks later it's load-bearing |
| The instruction file rots | Rules pile up in `CLAUDE.md`, contradict each other, and nobody knows which wins |
| "Done" means "the tests I wrote pass" | No shared definition, so each session picks one |
| Feedback said in chat is gone next session | The conversation was the only record |

Each piece of this harness exists because one of those happened.

---

## The pieces, and why each exists

### 1. `CLAUDE.md` is a router, not a rulebook
[`CLAUDE.md`](CLAUDE.md)

It points at documents; it does not restate them. If it disagrees with `docs/`, the doc wins and `CLAUDE.md` is stale.

**Why:** the codebase being replaced had five overlapping rulebooks (a "constitution", "development standards", AI
instructions…) that contradicted each other. A router can't contradict anything because it doesn't say anything. The
only rules that live in it are about *how a session behaves* (provenance, dates, gating) — things no other document owns.

### 2. Docs with kinds, and a rule for which one wins
[`docs/README.md`](docs/README.md)

Every doc says what kind it is (**decided** · **descriptive** · **planning** · **view** · **generated**) and *as of*
when. When two disagree: purpose → the foundational doc wins; mechanics → the latest owner ruling wins, and the older doc
is fixed in the same commit.

**Why:** "the older, more foundational doc wins" sounds right and broke in the first week. The vision docs were written
first, so they were the most out of date about mechanics.

### 3. Provenance on every claim
(rule 1 in `CLAUDE.md`)

An owner ruling (with date and quoted words) ≠ what the code does (with path and commit) ≠ what Claude inferred. A
proposal is never labelled "decided".

**Why:** an architecture doc once said "decided" over a section nobody had ruled on. An audit caught it, and unwinding it
cost a day. Quoting the owner's words with a date makes rulings checkable and makes inference visible as inference.

### 4. The open-questions register
[`docs/OPEN-QUESTIONS.md`](docs/OPEN-QUESTIONS.md)

One row per undecided thing: who can answer, where it's defined. **Claude never picks an answer to a question on this
list.** It may build with a default and say so in the row. Parked questions stay parked until the owner reopens them.

**Why:** this is probably the highest-leverage file here. Without it, the model quietly answers product questions
("can a guest see this?", "what happens to the data when an account is deleted?") because it has to write *something*.
With it, the gap becomes visible, the owner answers it in a sentence, and the answer is recorded where it belongs.

### 5. ADRs, append-only
[`docs/decisions/`](docs/decisions/)

Each architecture decision gets a numbered record: context, decision, **what enforces it**, consequences. Never edited;
superseded by a new one.

**Why:** "why is it built this way?" gets asked every session. An ADR answers it once. The *Enforced by* section forces
the question "how would a machine notice if this were broken?", which is where most rules turn into checks.

### 6. One home per function — mechanically enforced
[`docs/GUARDRAILS.md`](docs/GUARDRAILS.md) · [`tools/guardrails/`](tools/guardrails/) · [`eslint.config.js`](eslint.config.js)

Every kind of thing (formatting a date, calling an API, reading config, writing to a table) has exactly one home, listed
in a table. Something outside its home fails the build:

- **ESLint `no-restricted-syntax`** for what a selector can say (`fetch(` outside `core/http.ts`). The error message
  names the home, so the fix is obvious.
- **`checks.ts`** — pure `(path, source) → findings` regex checks for what a selector can't say (`process.env` outside
  `core/config.ts`, a timeout typed in as a number).
- **`duplicateExports`** — the same name *defined* in two files is a second home.

**The ratchet:** every duplicate found is folded into its home **and** gets a check whose pattern is the copy just
removed. That's the exact shape the next one will take. The original project went from 0 to more than 40 of these in four weeks,
each written the day a copy was found.

**Why:** "search before you write a helper" in a prompt doesn't hold. A session deep in a task doesn't stop to search.
A red build does hold.

### 7. Every rule is proven by a planted violation
[`tools/guardrails/guardrails.test.ts`](tools/guardrails/guardrails.test.ts)

Each rule has a test that plants the forbidden code and expects exactly one finding, the same line in the home and
expects none, then scans the real repo and expects zero. There is also a test that fails if a check has no planted test.

**Why:** *a rule that cannot fail is not a rule.* A regex with a typo passes forever and protects nothing. You only
find out when the duplicate it should have caught has shipped. (While drafting this repo, a planted test caught exactly
that: a pattern that missed its own example because of a pair of parentheses.)

### 8. A generated code map
[`tools/guardrails/codemap.ts`](tools/guardrails/codemap.ts) → `docs/CODEMAP.md`

Every export with the first sentence of its doc comment, generated from the source. A test fails if it's stale.

**Why:** it gives Claude one cheap file to search before writing anything ("does `getJson` exist?"), and it is always
true because a machine writes it. It also nudges every export to have a one-line doc comment, since that's what shows up.

### 9. The inbox, and hooks that enforce it
[`docs/INBOX.md`](docs/INBOX.md) · [`tools/inbox/inbox.ts`](tools/inbox/inbox.ts) · [`.claude/settings.json`](.claude/settings.json)

Human input that must outlive a chat (a co-founder's answer, a tester's note, a ruling) goes in the inbox. Two hooks:

- **SessionStart** prints unrecorded entries and the count of open questions, so every session starts with them.
- **PreToolUse** on Bash/PowerShell **blocks `git commit`** (exit code 2) while any entry is unrecorded.

**Why:** a ruling that lives only in chat is lost by the next session. Hooks are the only part of Claude Code that runs
whether or not the model remembers to. The original project used a web page where a non-technical partner answers the
open questions, read from a database; a markdown file is the same idea with no infrastructure.

### 10. A build method: judge, then tests first, and the first run is red
[`docs/plan/BUILD-METHOD.md`](docs/plan/BUILD-METHOD.md)

Trace what exists (UI → call → route → data, never a file name), judge each behaviour (**promise** / **artifact** /
**defect**; **keep** / **smooth** / **rethink**), write the tests, *watch them fail*, then build.

**Why:** the judgment step is where a rewrite or a new feature gets better instead of copying the old mess. The
red-first rule (quoted in the commit body) proves the tests can detect something. Tracing instead of guessing matters
too: a route whose name matched a core feature turned out to be dead code.

### 11. A definition of done, gated on exit codes
[`docs/plan/DEFINITION-OF-DONE.md`](docs/plan/DEFINITION-OF-DONE.md)

Red first, `pnpm check && git commit`, every visible page actually looked at (phone and desktop, realistic data), docs
moved in the same commit, and "deployed" means verified deployed.

**Why:** each line is a scar. `check | grep && commit` committed a red test, because the pipe returned grep's exit code.
A "deployed" fix had never built. Without a written bar, each session invents its own.

### 12. The friction log
[`docs/plan/FRICTION-LOG.md`](docs/plan/FRICTION-LOG.md)

The owner types `friction: the save button is below the fold on a phone` and it's filed against the right work, no
questions asked.

**Why:** making annoyance cost one sentence means it actually gets reported, and the bar becomes "better than what it
replaces" instead of "works".

### 13. Commits that explain themselves
(rule 7 in `CLAUDE.md`)

Message body: what changed and why, the owner's words where a ruling landed, **the new exports and why none duplicates
one**, the red first run, the gate result.

**Why:** the next session's best context is `git log`. Listing new exports forces the duplicate check at the moment it's
cheapest.

---

## How the owner works it

The pieces above are what Claude meets. These are the human side: how you steer it, review it and let it run unattended.

### 14. Goal files and autonomous runs
[`docs/practice/AUTONOMOUS-RUNS.md`](docs/practice/AUTONOMOUS-RUNS.md) · [`docs/plan/GOAL.md`](docs/plan/GOAL.md) · [`docs/plan/runs/`](docs/plan/runs/) · [`tools/goals/`](tools/goals/)

A run (overnight, or just "keep going") is a **goal file**, not a long prompt. It holds the queue in order, the loop,
what to do when idle, standing permissions with your words, and the hard "never" list. A short prompt starts it, and it
keeps a **run report** as it goes. Items are ticked with their commit in the same commit, and the SessionStart hook prints
`Goal: 3/8 done — next: item 4` so no session re-derives where things stand. The page includes the prompts we actually use
(start, pause, morning review, audit).

**Why:** the run can go for hours because nothing in it is a judgment call it shouldn't make. Questions get parked on the
register and the run moves on, permissions are written down, and the report is the one thing to read in the morning.
"If it's already built, record that and move on" is a rule because a run once rebuilt finished work.

### 15. The admin companion
[`docs/practice/ADMIN-COMPANION.md`](docs/practice/ADMIN-COMPANION.md) · [`docs/plan/SCREEN-STANDARD.md`](docs/plan/SCREEN-STANDARD.md)

If your project has a web admin, give it four pages that **mirror the repo's files and take input back**:

- **Questions:** the register, where a partner can agree, disagree or leave a note.
- **Docs:** every document, readable on a phone.
- **Goals:** queue progress and the latest run report.
- **Screens:** a contact sheet of phone and desktop screenshots for each changed screen, which you pass or fail.

The repo stays the truth (generated copies, staleness tests). What people type comes back as input the hooks make the
next session record. A failed screen becomes a fix the next session starts with.

**Why:** the people who decide shouldn't need GitHub. And AI-built screens pass their tests while still looking wrong on a
phone, so a screen is done only when a person passes its screenshots.

---

## What isn't in this repo but matters

- **A person is in the loop as the decider, not the typist.** The harness works because rulings come from a person and
  get recorded with their words. Claude proposes; the register makes the line visible.
- **Claude Code's auto-memory** (`~/.claude/projects/<project>/memory/`) holds lessons about *working with you*
  (e.g. "gate on exit codes, not grep", "verify the deploy, not the push"). Project facts go in the repo; behavioural
  lessons go in memory.
- **A screenshot check of every page**, if you have a UI. The original project has one command that signs in and
  screenshots every route at phone and desktop widths against a throwaway seeded database, and a new page not in the
  route list fails it. It's too stack-specific to ship here, but it's the item in the definition of done we'd least
  want to drop.

---

## Using it

The tooling here is TypeScript, because that's what it was built with. **The ideas are not.** In Python, Go or Rust the
same pieces are a lint rule (ruff, golangci-lint, clippy), a test that greps the source with planted violations, and the
same hooks calling your test runner.

```bash
pnpm install
pnpm check          # typecheck, lint, tests — including every guardrail's planted test
pnpm codemap        # regenerate docs/CODEMAP.md after changing an export
pnpm inbox          # what's unrecorded
pnpm goals          # where the goal queue stands
```

To adopt it:

1. Copy `CLAUDE.md`, `docs/`, `tools/`, `.claude/settings.json`, `eslint.config.js`.
2. Delete `src/` (it's an example so the checks have something to scan) and point `MAPPED` in `codemap.ts` and `scan`
   in `checks.ts` at your source.
3. Replace the example homes (dates, HTTP, config) in `GUARDRAILS.md`, `eslint.config.js` and `checks.ts` with yours.
   **Start with few checks** and add one each time you find a duplicate. A guardrail written from a real copy beats one
   imagined up front.
4. Fill in `docs/README.md` status and write your first ADRs. Put every undecided thing in the register.

The hooks call `pnpm`. Change the command if you use something else.

## License

[MIT](LICENSE).
