/** Conversions between what a form holds (strings) and what the API expects. */

/** One item per line in a textarea becomes a list, with blank lines dropped. */
export function linesToList(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function listToLines(items: string[]): string {
  return items.join('\n');
}

/** An empty input means "not set", which the API represents as null. */
export function blankToNull(text: string): string | null {
  const trimmed = text.trim();
  return trimmed === '' ? null : trimmed;
}

export function nullToBlank(value: string | number | null): string {
  return value === null ? '' : String(value);
}

/** "2026" becomes 2026; an empty input becomes null. */
export function yearToNumber(text: string): number | null {
  const trimmed = text.trim();
  return trimmed === '' ? null : Number(trimmed);
}

/** A URL-safe slug from a title: "M-Pesa TMS (LAN)" becomes "m-pesa-tms-lan". */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
