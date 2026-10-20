# Inbox — human input not yet in the docs

**Kind:** inbox. A partner's answer, a tester's note, a ruling given in a chat: anything a person said that has to
outlive the conversation it was said in. Paste it here as a `## YYYY-MM-DD · who` entry with their words.

**A session records each entry before it commits anything else:** it writes the input into the document that owns it
(with the person's words and the date), updates the register if a question moved, then adds a line under the entry:

    recorded: docs/<the document>

The SessionStart hook lists unrecorded entries; the PreToolUse hook blocks `git commit` while any remain
(`tools/inbox/inbox.ts`). Recorded entries may be deleted at any time — the owning document holds the record.

---

## 2026-01-01 · example
> This is what an entry looks like.
recorded: docs/INBOX.md
