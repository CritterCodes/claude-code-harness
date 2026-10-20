# Definition of done — the gate

**Kind:** decided (method). **As of:** <YYYY-MM-DD>.

A unit of work is done when **all** of these hold. Not most. "It works on my machine" is not on the list.

1. **The tests were written first and failed first** — the red run is quoted in the commit body.
2. **`pnpm check` exits 0** — typecheck, lint, every test, the guardrails. Gated on the **exit code**:

   ```bash
   pnpm check && git commit -F msg.txt
   ```

   Never `;`, and never `pnpm check | grep -q passed && …` — a pipe reports grep's exit code, not the check's, and a red
   test gets committed. (It happened.)
3. **A change anyone can see is looked at** — every page it touches, signed in, on a phone width and a desktop width,
   with realistic data. In the project this came from, it is one command that screenshots every route of every app against a
   throwaway seeded database, and a new page that is not in the route list fails it. Start smaller if you must, but
   start: types and unit tests do not see a broken layout.
4. **The docs moved with the code** — a ruling recorded with its date and words, the register updated, GUARDRAILS
   updated if a rule changed, `pnpm codemap` run if an export changed.
5. **The commit says what and why** — the owner's words where a ruling landed, the new exports and why none duplicates
   one, the red run, the gate result.
6. **"Deployed" means verified deployed.** If a push is a deploy, check the deploy finished for *that* commit and look
   at the live page before saying it is live. A pushed fix that never built is not a fix.
