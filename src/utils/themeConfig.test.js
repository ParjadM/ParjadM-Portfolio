import { describe, expect, it } from 'vitest';
import {
  DEFAULT_THEME_ID,
  THEME_IDS,
  THEMES,
  getDailyDefaultThemeId,
  getNextLocalMidnight,
  getThemeConfig,
  msUntilNextLocalMidnight,
  resolveThemeId,
} from './themeConfig.js';

describe('themeConfig', () => {
  it('falls back to the default theme for unknown ids', () => {
    expect(getThemeConfig('unknown').id).toBe(DEFAULT_THEME_ID);
  });

  it('uses the same default theme for an entire local calendar day', () => {
    const morning = new Date(2026, 7, 27, 0, 5, 0);
    const night = new Date(2026, 7, 27, 23, 59, 59);
    expect(getDailyDefaultThemeId(morning)).toBe(getDailyDefaultThemeId(night));
  });

  it('advances to the next theme after local midnight', () => {
    const today = new Date(2026, 7, 27, 12, 0, 0);
    const tomorrow = new Date(2026, 7, 28, 0, 0, 0);
    const todayId = getDailyDefaultThemeId(today);
    const expected = THEME_IDS[(THEME_IDS.indexOf(todayId) + 1) % THEME_IDS.length];
    expect(getDailyDefaultThemeId(tomorrow)).toBe(expected);
  });

  it('cycles through every selectable theme', () => {
    const start = new Date(2026, 7, 27, 12, 0, 0);
    const seen = THEME_IDS.map((_, offset) => {
      const date = new Date(start);
      date.setDate(start.getDate() + offset);
      return getDailyDefaultThemeId(date);
    });
    expect(new Set(seen).size).toBe(THEME_IDS.length);
    expect(seen.every((id) => THEMES[id])).toBe(true);
  });

  it('keeps an explicit user choice and otherwise uses the daily default', () => {
    const now = new Date(2026, 7, 27, 12, 0, 0);
    expect(resolveThemeId('ocean-dark', now)).toBe('ocean-dark');
    expect(resolveThemeId(null, now)).toBe(getDailyDefaultThemeId(now));
    expect(resolveThemeId('not-a-theme', now)).toBe(getDailyDefaultThemeId(now));
  });

  it('schedules the next switch for local midnight', () => {
    const now = new Date(2026, 7, 27, 18, 30, 0);
    const nextMidnight = getNextLocalMidnight(now);
    expect(nextMidnight.getHours()).toBe(0);
    expect(nextMidnight.getDate()).toBe(28);
    expect(msUntilNextLocalMidnight(now)).toBe(nextMidnight.getTime() - now.getTime());
  });
});
