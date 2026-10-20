/**
 * The one home for dates shown to a person (ADR-0001). A day is always said in a named time zone: the server's clock
 * is not the user's (on a host running in UTC, something done in the evening prints as tomorrow).
 * ESLint refuses `Intl.DateTimeFormat` anywhere else, and the error message points back here.
 */

/** A moment as the calendar day it is in `zone` ("Oct 19, 2026"). */
export function formatDay(at: Date, zone: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: zone, month: 'short', day: 'numeric', year: 'numeric' }).format(at);
}
