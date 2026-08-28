import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_THEME_ID,
  THEME_IDS,
  THEME_TIME_ZONE_LABEL,
  THEMES,
  USER_THEME_MANUAL_DAY_KEY,
  USER_THEME_MANUAL_STORAGE_KEY,
  USER_THEME_STORAGE_KEY,
  clearManualThemePreference,
  formatDurationHoursMinutes,
  getDailyDefaultThemeId,
  getNextDailyDefaultThemeId,
  getNextEstMidnight,
  getThemeConfig,
  msUntilNextEstMidnight,
  readManualThemeIdForToday,
  resolveActiveThemeId,
  resolveThemeId,
  saveManualThemeId,
  zonedTimeToUtc,
} from './themeConfig.js';

describe('themeConfig', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('falls back to the default theme for unknown ids', () => {
    expect(getThemeConfig('unknown').id).toBe(DEFAULT_THEME_ID);
  });

  it('uses the same default theme for an entire EST calendar day', () => {
    const morning = new Date('2026-08-27T12:00:00.000Z');
    const night = new Date('2026-08-28T03:00:00.000Z');
    expect(getDailyDefaultThemeId(morning)).toBe(getDailyDefaultThemeId(night));
  });

  it('advances to the next theme at midnight EST', () => {
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

  it('ignores leftover theme ids unless the visitor explicitly picked one today', () => {
    localStorage.setItem(USER_THEME_STORAGE_KEY, 'emerald-dark');
    expect(readManualThemeIdForToday()).toBeNull();

    const now = new Date('2026-08-28T12:00:00.000Z');
    saveManualThemeId('ocean-dark', now);
    expect(localStorage.getItem(USER_THEME_MANUAL_STORAGE_KEY)).toBe('1');
    expect(localStorage.getItem(USER_THEME_MANUAL_DAY_KEY)).toBeTruthy();
    expect(readManualThemeIdForToday(now)).toBe('ocean-dark');
    expect(resolveActiveThemeId(now)).toBe('ocean-dark');

    clearManualThemePreference();
    expect(readManualThemeIdForToday(now)).toBeNull();
  });

  it('expires manual picks from a previous EST day and applies the new default', () => {
    const yesterday = new Date('2026-08-27T16:00:00.000Z');
    const today = new Date('2026-08-28T12:00:00.000Z');
    saveManualThemeId('ocean-dark', yesterday);
    expect(readManualThemeIdForToday(today)).toBeNull();
    expect(resolveActiveThemeId(today)).toBe(getDailyDefaultThemeId(today));
    expect(localStorage.getItem(USER_THEME_STORAGE_KEY)).toBeNull();
  });

  it('clears legacy manual flags that have no EST day stamp', () => {
    localStorage.setItem(USER_THEME_STORAGE_KEY, 'crimson-dark');
    localStorage.setItem(USER_THEME_MANUAL_STORAGE_KEY, '1');
    expect(readManualThemeIdForToday()).toBeNull();
    expect(localStorage.getItem(USER_THEME_STORAGE_KEY)).toBeNull();
  });

  it('schedules the next switch for midnight EST', () => {
    const now = new Date('2026-08-27T22:30:00.000Z');
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
