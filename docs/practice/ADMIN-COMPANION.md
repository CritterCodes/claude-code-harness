# The admin companion — the docs, shown where people already are

**Kind:** practice (how the owner works the harness). Optional, and the biggest quality-of-life upgrade once you have a
web app with an admin area.

## The idea

The harness keeps everything that matters in markdown in the repo: the register, the goal queue, the run reports, the
docs themselves. That's right for Claude, and wrong for people. A co-founder won't open GitHub to answer a question, and
you won't read a diff on your phone at 11 pm to check last night's run.

So the project's own admin app gets a few pages that **show the repo's files and take input back**. They follow two rules:

1. **The repo stays the truth; the admin mirrors it.** A script turns the markdown into data the app can ship (a
   generated file, or a build step). A guardrail test fails the build when the generated copy is stale, so the admin can
   never quietly disagree with the docs.
2. **Input flows back through the inbox, and the hooks enforce it.** What a person types in the admin is stored as
   *input*, never as an edit to the docs. The next session reads it (SessionStart hook), writes it into the document that
   owns it with the person's words and the date, and can't commit anything else until it has (PreToolUse hook). That's
   the same rule as [`docs/INBOX.md`](../INBOX.md), with a web page instead of a markdown file.

A deployed app usually can't read the repository, so the mirror is code or a build artifact, never a live read of the
repo.

## The four pages

### 1. Questions — the register, for the people who answer it

Shows [`OPEN-QUESTIONS.md`](../OPEN-QUESTIONS.md) in three tabs: *questions for you*, *all open*, *decided*. Each
question takes input: **Agree · Disagree · Let's talk · a note**.

- **Generated:** a script parses the register (and a plain-language page for non-technical partners, if you keep one;
  each of its sections is tagged `<!-- q:ID -->` to its register row) into a committed list. The test fails when the list
  is stale, a section is untagged, or an id repeats.
- **Back:** each input gets an id. A session records it in the owning doc and puts `<!-- input:ID -->` on the question.
  An input is "recorded" exactly when its marker is in the docs, so the hook can check it with no extra state.
- **Notifications** (optional): an email when a new question is for someone, and a daily digest only on days something
  changed. Who and when are **settings**, never literals.

**Why it works:** the person who has to decide sees the open questions without asking, and their answer can't get lost
between a phone tap and the next session.

### 2. Docs — every document, readable on a phone

Renders the whole `docs/` folder with working links between documents, built from the repo at deploy time so it's
always current. One markdown renderer, shared with the other pages (a guardrail can enforce that, too).

**Why:** you can check a decision, a plan or a run report anywhere, and so can anyone you give admin access to. Nobody
needs a GitHub account.

### 3. Goals — the queue and the latest run

Shows the goal file ([`GOAL.md`](../plan/GOAL.md); how it's used: [`AUTONOMOUS-RUNS.md`](AUTONOMOUS-RUNS.md)) as progress: items done (with their commits) and the
next one up. Also shows the company's goals, if you keep them, and the newest run report. Generated from the files, with
a staleness test.

**Why:** "how far did it get overnight?" becomes a glance, not a read through `git log`.

### 4. Screens — a contact sheet you pass or fail

Every screen a session changed shows up with its **phone and desktop screenshots** and a line saying what changed. You
press **Pass** or **Fail** (with a note).

- A session publishes screenshots after a green gate, queueing only the screens it changed. A passed screen stays passed
  until a session changes it again.
- **A screen is done only when a person passes it.** Tests pass a lot of ugly screens.
- **A fail becomes a fix.** It's stored as input. The SessionStart hook prints open fixes with the tester's note, and
  the session reproduces each in a failing test, fixes it, ships it, then marks it fixed, which puts the screen back in
  the queue and tells the tester.
- The bar a screen meets *before* it reaches the sheet is [`SCREEN-STANDARD.md`](../plan/SCREEN-STANDARD.md).

**Why:** UI quality was the weakest part of AI-built screens. Unit tests pass, the page technically works, and it still
looks wrong on a phone with real data. Screenshots you can pass or fail in a minute closed that gap. Per-screen judging
(rather than "looks fine overall") makes the bar specific.

## Building it

There's no code for this in the harness, because it's whatever your stack is. The pieces are small:

| Piece | Shape |
|---|---|
| A parser per file | `markdown → data` (register rows, goal items with `[x]`, report bullets) — pure, tested |
| A generator | writes the data where the app can read it; `pnpm questions`, `pnpm goals`… |
| A staleness test | `expect(committedCopy).toBe(generate(root))` in the guardrails suite |
| An input table | `{ id, about, who, stance, note, at }` — the admin writes it, sessions only read it |
| The hooks | the SessionStart and commit hooks in [`.claude/settings.json`](../../.claude/settings.json), reading that table instead of `INBOX.md` |
| A screenshot step | after the views/screenshot check, upload the changed screens' images and queue them |

Start with **Questions**. It's the one that changes how decisions get made.
