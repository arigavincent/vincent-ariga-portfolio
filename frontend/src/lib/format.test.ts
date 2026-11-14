import { describe, expect, it } from 'vitest';

import { cn } from './cn';
import { formatMonthYear, formatPeriod, formatYears, toParagraphs } from './format';

describe('toParagraphs', () => {
  it('splits on blank lines and drops empty paragraphs', () => {
    expect(toParagraphs('One.\n\nTwo.\n \n\n Three. ')).toEqual(['One.', 'Two.', 'Three.']);
    expect(toParagraphs('')).toEqual([]);
  });
});

describe('date formatting', () => {
  it('formats an ISO date as month and year', () => {
    expect(formatMonthYear('2024-03-15')).toBe('Mar 2024');
  });

  it('builds a period and leaves unknown ends out instead of inventing them', () => {
    expect(formatPeriod('2024-03-01', '2025-06-01', false)).toBe('Mar 2024 – Jun 2025');
    expect(formatPeriod('2024-03-01', null, true)).toBe('Mar 2024 – Present');
    expect(formatPeriod(null, null, true)).toBe('Present');
    expect(formatPeriod(null, null, false)).toBe('');
  });

  it('formats year ranges', () => {
    expect(formatYears(2022, 2026)).toBe('2022 – 2026');
    expect(formatYears(null, 2026)).toBe('2026');
    expect(formatYears(null, null)).toBe('');
  });
});

describe('cn', () => {
  it('lets the last conflicting utility win', () => {
    expect(cn('px-4 py-2', 'px-8')).toBe('py-2 px-8');
    expect(cn('text-muted', false, undefined, 'text-white')).toBe('text-white');
  });

  it('keeps a custom font size alongside a text colour', () => {
    expect(cn('text-h2', 'text-white')).toBe('text-h2 text-white');
    expect(cn('text-h2', 'text-display')).toBe('text-display');
  });
});
