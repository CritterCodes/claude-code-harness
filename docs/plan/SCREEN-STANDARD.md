# The screen standard

**Kind:** decided (method), if your project has a UI. **As of:** <YYYY-MM-DD>.

The bar a screen meets **before** a person is asked to look at it. A screen is done only when a person passes its phone
and desktop screenshots (see [the admin companion](../practice/ADMIN-COMPANION.md), *Screens*). Tests passing is
necessary, not sufficient.

**Why this exists:** AI-built screens pass their tests and still look wrong. They're judged from code and a tiny seeded
world, a section at a time, never as a whole page on a phone with real data. Adjust the list to your product; keep it
short enough to check by eye.

## The bar — every screen, phone first

1. **It leads with what to do now.** The first thing under the title says where things stand and the one next action,
   as a button.
2. **Nothing says what isn't built.** No "coming soon" or "being built". *(Mechanical: the `not-built-copy` check.)*
3. **Nothing collides.** No text over text, nothing cut off, no sideways scroll, at phone and desktop widths.
   *(Mechanical: a screenshot check of every route.)*
4. **Content before controls.** On a phone, the first item of the list or the first fact of the record is on the first
   screen.
5. **Words read as sentences.** A value is never pasted into a phrase that no longer reads. Empty values are left out,
   not shown as "—".
6. **One look per thing.** A status, a date, a name reads the same everywhere, from its one home.
7. **Real data.** Judged with long names, old records and missing fields, not only the seeded world.
8. **Forms are closed until asked.** A record opens read-only; editing is a deliberate tap.
9. **Destructive actions are away from the next step** and ask once.

## The loop

1. Build the screen against the bar; the gate passes.
2. Its screenshots go to the review queue, with a line on what changed.
3. A person passes or fails it. A fail is a fix the next session starts with.
