const monthYear = new Intl.DateTimeFormat('en', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const longDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Splits prose from the API into paragraphs on blank lines. */
export function toParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** "Mar 2024" for an ISO date (yyyy-mm-dd). */
export function formatMonthYear(isoDate: string): string {
  return monthYear.format(new Date(`${isoDate}T00:00:00Z`));
}

/** "14 November 2026" for an ISO timestamp. */
export function formatLongDate(isoTimestamp: string): string {
  return longDate.format(new Date(isoTimestamp));
}

/**
 * A human period such as "Mar 2024 – Present". Missing ends are simply left out, so content
 * that is still being filled in never shows an invented date.
 */
export function formatPeriod(start: string | null, end: string | null, current: boolean): string {
  const from = start ? formatMonthYear(start) : null;
  const to = current ? 'Present' : end ? formatMonthYear(end) : null;
  return [from, to].filter(Boolean).join(' – ');
}

/** "2022 – 2026", "2026", or an empty string when neither year is known. */
export function formatYears(start: number | null, end: number | null): string {
  return [start, end].filter((year) => year !== null).join(' – ');
}
