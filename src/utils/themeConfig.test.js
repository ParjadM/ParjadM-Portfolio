import { describe, expect, it } from 'vitest';
import {
  DEFAULT_THEME_ID,
  THEME_IDS,
  THEME_TIME_ZONE_LABEL,
  THEMES,
  formatDurationHoursMinutes,
  getDailyDefaultThemeId,
  getNextDailyDefaultThemeId,
  getNextEstMidnight,
  getThemeConfig,
  msUntilNextEstMidnight,
  resolveThemeId,
  zonedTimeToUtc,
} from './themeConfig.js';

describe('themeConfig', () => {
  it('falls back to the default theme for unknown ids', () => {
    expect(getThemeConfig('unknown').id).toBe(DEFAULT_THEME_ID);
  });

  it('uses the same default theme for an entire EST calendar day', () => {
    // 2026-08-27 08:00 EDT and 23:00 EDT
    const morning = new Date('2026-08-27T12:00:00.000Z');
    const night = new Date('2026-08-28T03:00:00.000Z');
    expect(getDailyDefaultThemeId(morning)).toBe(getDailyDefaultThemeId(night));
  });

  it('advances to the next theme at midnight EST', () => {
    // Just before / after 2026-08-28 00:00 EDT (UTC-4)
    const beforeMidnight = new Date('2026-08-28T03:59:00.000Z');
    const afterMidnight = new Date('2026-08-28T04:00:00.000Z');
    const todayId = getDailyDefaultThemeId(beforeMidnight);
    const expected = THEME_IDS[(THEME_IDS.indexOf(todayId) + 1) % THEME_IDS.length];
    expect(getDailyDefaultThemeId(afterMidnight)).toBe(expected);
    expect(getNextDailyDefaultThemeId(beforeMidnight)).toBe(expected);
  });

  it('cycles through every selectable theme across EST days', () => {
    const start = zonedTimeToUtc({ year: 2026, month: 8, day: 27, hour: 12 });
    const seen = THEME_IDS.map((_, offset) => {
      const date = new Date(start.getTime() + offset * 24 * 60 * 60 * 1000);
      return getDailyDefaultThemeId(date);
    });
    expect(new Set(seen).size).toBe(THEME_IDS.length);
    expect(seen.every((id) => THEMES[id])).toBe(true);
  });

  it('keeps an explicit user choice and otherwise uses the daily EST default', () => {
    const now = new Date('2026-08-27T16:00:00.000Z');
    expect(resolveThemeId('ocean-dark', now)).toBe('ocean-dark');
    expect(resolveThemeId(null, now)).toBe(getDailyDefaultThemeId(now));
    expect(resolveThemeId('not-a-theme', now)).toBe(getDailyDefaultThemeId(now));
  });

  it('schedules the next switch for midnight EST', () => {
    const now = new Date('2026-08-27T22:30:00.000Z'); // 18:30 EDT
    const nextMidnight = getNextEstMidnight(now);
    expect(nextMidnight.toISOString()).toBe('2026-08-28T04:00:00.000Z');
    expect(msUntilNextEstMidnight(now)).toBe(nextMidnight.getTime() - now.getTime());
  });

  it('formats remaining time as HH:MM and labels Eastern Time as EST', () => {
    expect(THEME_TIME_ZONE_LABEL).toBe('EST');
    expect(formatDurationHoursMinutes(0)).toBe('00:00');
    expect(formatDurationHoursMinutes(59_000)).toBe('00:01');
    expect(formatDurationHoursMinutes((11 * 60 + 42) * 60_000)).toBe('11:42');
    expect(formatDurationHoursMinutes((23 * 60 + 5) * 60_000 + 1)).toBe('23:06');
  });
});
