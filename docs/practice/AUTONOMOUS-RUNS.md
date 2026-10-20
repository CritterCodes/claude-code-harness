# Autonomous and overnight runs — goal files and prompts

**Kind:** practice (how the owner works the harness).

The harness is what makes long unattended runs safe: Claude can work for hours because every rule is in a document or a
check, every decision that isn't its own is on the register, and "done" has one definition. This page is how a run is set
up, started, steered and reviewed.

## The shape

```
you + Claude write the goal file  →  a short prompt starts the run  →  Claude works the queue, keeps a report
        ↑                                                                          ↓
   next queue  ←  you answer questions, pass/fail screens, read the report  ←  morning
```

## 1. The goal file — standing instructions for a run

One file, [`docs/plan/GOAL.md`](../plan/GOAL.md) (template). It says **what to work on, in what order, and what never to
do**. Everything else ("how to build") is already in `CLAUDE.md` and the method docs, and the goal file says to read them
rather than repeating them.

Its sections, each there for a reason:

| Section | What it holds | Why |
|---|---|---|
| **Set by** | Your words that set the run, with the date | Provenance: the run's authority is quoted, not inferred |
| **The loop** | Pick the first unfinished item → build it the standard way → gate → commit → tick it `[x]` with the commit SHA *in the same commit* → next | The tick in the same commit makes the file a reliable progress record |
| **The queue** | Numbered items, in order, each a paragraph: what, why, your words, where the plan lives, what done looks like | Numbers never change once given; reports and docs refer to them |
| **Never idle** | What to do when the queue is empty or blocked: bug-hunt today's diffs, open fixes, docs vs code, close review-only guardrails | Without it, a run that finishes early stops early, or invents work |
| **Standing permissions** | What it may do without asking (run migrations, push to main when green…), each with your words and date | It never has to guess whether it may |
| **Never** | Stop and write it in the report instead: real money, real orders, production data, secrets, answering the register | The hard edges, in one place |
| **The report** | Where the run report goes and what it carries | So the morning review has one thing to read |

**Writing it is a conversation.** Ask Claude to propose the queue from the plan and the register. Correct it, rule on
whatever blocks an item, and have it write the file. Your rulings land in the docs *before* the run starts.

## 2. The prompts

The goal file is long; the prompt that starts a run is short and points at it. If your client limits the goal or prompt
box (the `/goal` box held 4,000 characters when this was written), the file is how you get past that.

**Start a run:**

```
Read docs/plan/GOAL.md and work it. Never stop to ask me: if a unit needs a decision
that is mine, put it on the register, build what doesn't depend on it, and go to the next.
Before starting any item, check git log and the docs for it — if it is already built,
record that and move on. Keep the report as you go.
```

**Write the next goal file with me:**

```
Propose the next queue for GOAL.md from the plan, the register and the friction log:
in order, each item with what done looks like and anything that blocks it on me. Don't
write the file until I've ruled on the blockers.
```

**Pause mid-run** (to talk something through without losing the run):

```
Pause the loop — I need a conversation about <thing>.
```

…then, once it's ruled and recorded: `You can continue.`

**Morning review:**

```
Summarize last night's report: what shipped (with commits), what you found and fixed,
what's blocked on me, and the questions you added. Shortest version first.
```

**Keep it honest:**

```
Audit your work from the run: re-read the diffs with fresh eyes, check each claim in
the report against the code, and fix what doesn't hold.
```

## 3. The run report

[`docs/plan/runs/RUN-TEMPLATE.md`](../plan/runs/RUN-TEMPLATE.md). One file per run, named for the date it ends, kept
**as it goes**, not written at the end. Each entry: what shipped (with its commit), what was found and fixed, what's
blocked and on whom, anything run against a real system, and questions added to the register. Plain words, because it's
written for you, not for Claude.

## 4. The morning review

1. Read the report (or the Goals page, if you built [the admin companion](ADMIN-COMPANION.md)).
2. Answer the new questions on the register. Each answer becomes input that the next session must record.
3. Pass or fail the changed screens. A fail becomes a fix the next session starts with.
4. `friction:` anything that annoyed you.
5. Re-rule the queue if priorities moved, then start the next run.

## Lessons that are now rules

- **"If it's already built, record that and move on."** A run once rebuilt work that was already done, because the queue
  was older than the code. Every item now starts with a search of `git log` and the docs.
- **Never stop to ask; park and move on.** A run that waits for an answer at 2 am wastes the night. A run that guesses
  answers a question that wasn't its own. Putting the question on the register and moving to the next item does neither.
- **Permissions are written, never assumed.** If the goal file doesn't say it may, it may not, and it says so in the
  report.
- **The queue is ticked in the same commit as the work.** Then the file, the commits and the dashboard can't disagree.
- **Never idle has an order.** Bug-hunt first (fresh eyes on today's diffs), then fixes, then docs vs code, then
  guardrail debt. A run that "keeps going" without an order drifts into churn.
