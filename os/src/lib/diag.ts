/**
 * P1F diagnostic logger.
 *
 * Uses console.info so [P1F] events are visible by default in Chrome/Edge/Firefox
 * without enabling verbose/debug log levels (console.debug is hidden in Chrome
 * unless "Verbose" is checked in DevTools).
 *
 * Safety rules — NEVER pass:
 *  - Preview tokens or nonce hashes
 *  - Section content, titles, or any user-authored text
 *  - PII or authentication credentials
 *
 * Safe to log: leg, status, ids (pageId, sectionId), field keys, error strings,
 * seq numbers, timestamps.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function logP1F(event: Record<string, unknown>): void {
  // eslint-disable-next-line no-console
  console.info("[P1F]", event);
}
