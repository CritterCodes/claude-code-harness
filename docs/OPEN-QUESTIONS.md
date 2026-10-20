# Open questions — the register

**Kind:** view. **As of:** <YYYY-MM-DD>.

One line per open question, across every document, with **who can answer it** and **where it is defined in full**. This
file defines nothing itself — each row points at the owning document, which holds the context and, later, the answer.

**Claude never picks an answer to a question on this list.** It may recommend one, in the row, labelled as its
recommendation. When it meets something undecided that is not here, it adds a row in the same unit of work.

**Why this exists:** without one register, open questions spread across documents with overlapping numbering, and the
same question gets asked three times — or, worse, quietly answered by whichever session got there first.

Number questions `Q1`, `Q2`… and never reuse a number. The session-start hook counts the rows whose status is `open`.

---

## Owner can answer

| # | Question | Status | Defined in |
|---|---|---|---|
| Q# | **<The question, in one sentence.>** <Why it matters; what is built meanwhile, and the default it uses.> | open | [<doc>](<path>) |
| Q# | **<A question the owner deferred.>** | **parked by the owner, <YYYY-MM-DD>** — *"<their words>"*. Do not ask again until they reopen it | [<doc>](<path>) |

## Someone else can answer (accountant, lawyer, partner)

| # | Question | Status | Defined in |
|---|---|---|---|

## Recently closed

| # | Answer | Ruled |
|---|---|---|
| Q# | <The answer> — *"<the owner's words>"* | owner, <YYYY-MM-DD> → recorded in [<doc>](<path>) |
