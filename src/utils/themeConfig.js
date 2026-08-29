export const THEMES = {
    'emerald-dark': {
        id: 'emerald-dark',
        name: 'System Default',
        isDark: true,
        backgroundClass: 'bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900',
        blobClasses: { blob1: "bg-emerald-500/30", blob2: "bg-teal-500/30", blob3: "bg-cyan-500/20" },
        accentPrefix: 'emerald', // Used for old `theme === green` fallback if needed
        isTerminal: false,
    },
    'emerald-light': {
        id: 'emerald-light',
        name: 'High Contrast Light',
        isDark: false,
        backgroundClass: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50',
        blobClasses: { blob1: "bg-emerald-400/25", blob2: "bg-teal-400/25", blob3: "bg-cyan-400/20" },
        accentPrefix: 'emerald',
        isTerminal: false,
    },
    'crimson-dark': {
        id: 'crimson-dark',
        name: 'Crimson / Rose',
        isDark: true,
        backgroundClass: 'bg-gradient-to-br from-rose-900 via-pink-900 to-red-900',
        blobClasses: { blob1: "bg-pink-500/30", blob2: "bg-red-500/30", blob3: "bg-purple-500/20" },
        accentPrefix: 'pink',
        isTerminal: false,
    },
    'ocean-dark': {
        id: 'ocean-dark',
        name: 'Ocean Blue',
        isDark: true,
        backgroundClass: 'bg-gradient-to-br from-blue-900 via-indigo-900 to-violet-900',
        blobClasses: { blob1: 'bg-blue-500/30', blob2: 'bg-indigo-500/30', blob3: 'bg-violet-500/20' },
        accentPrefix: 'blue',
        isTerminal: false,
    },
    'terminal': {
        id: 'terminal',
        name: 'Terminal Hacker',
        isDark: true,
        backgroundClass: 'bg-black',
        blobClasses: { blob1: "bg-green-500/10", blob2: "bg-green-400/10", blob3: "bg-lime-500/10" },
        accentPrefix: 'green',
        isTerminal: true,
    }
};

export const THEME_IDS = Object.keys(THEMES);
export const DEFAULT_THEME_ID = 'emerald-dark';
export const USER_THEME_STORAGE_KEY = 'portfolio_theme_id';
/** Only set when the visitor explicitly picks a theme in the palette. */
export const USER_THEME_MANUAL_STORAGE_KEY = 'portfolio_theme_manual';
/** EST calendar day stamp for the manual pick (expires at the next EST midnight). */
export const USER_THEME_MANUAL_DAY_KEY = 'portfolio_theme_manual_est_day';
/** Eastern Time calendar used for the daily default theme rotation. */
export const THEME_TIME_ZONE = 'America/New_York';
/** Display label for the rotation clock (Eastern Time). */
export const THEME_TIME_ZONE_LABEL = 'EST';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getTimeZoneParts(date, timeZone = THEME_TIME_ZONE) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(date);

    const values = Object.fromEntries(
        parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]),
    );

    return {
        year: Number(values.year),
        month: Number(values.month),
        day: Number(values.day),
        hour: Number(values.hour),
        minute: Number(values.minute),
        second: Number(values.second),
    };
}

/** Convert an Eastern Time wall-clock stamp to a UTC Date. */
export function zonedTimeToUtc(
    { year, month, day, hour = 0, minute = 0, second = 0 },
    timeZone = THEME_TIME_ZONE,
) {
    const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
    const asZone = getTimeZoneParts(new Date(utcGuess), timeZone);
    const asUtc = Date.UTC(
        asZone.year,
        asZone.month - 1,
        asZone.day,
        asZone.hour,
        asZone.minute,
        asZone.second,
    );
    return new Date(utcGuess - (asUtc - utcGuess));
}

function estCalendarDayNumber(date) {
    const { year, month, day } = getTimeZoneParts(date, THEME_TIME_ZONE);
    return Math.floor(Date.UTC(year, month - 1, day) / MS_PER_DAY);
}

export function getDailyDefaultThemeId(now = new Date()) {
    const count = THEME_IDS.length;
    const index = ((estCalendarDayNumber(now) % count) + count) % count;
    return THEME_IDS[index];
}

export function getNextDailyDefaultThemeId(now = new Date()) {
    const currentId = getDailyDefaultThemeId(now);
    const currentIndex = THEME_IDS.indexOf(currentId);
    return THEME_IDS[(currentIndex + 1) % THEME_IDS.length];
}

export function getNextEstMidnight(now = new Date()) {
    const { year, month, day } = getTimeZoneParts(now, THEME_TIME_ZONE);
    const nextCivilDay = new Date(Date.UTC(year, month - 1, day + 1));
    return zonedTimeToUtc({
        year: nextCivilDay.getUTCFullYear(),
        month: nextCivilDay.getUTCMonth() + 1,
        day: nextCivilDay.getUTCDate(),
        hour: 0,
        minute: 0,
        second: 0,
    }, THEME_TIME_ZONE);
}

export function msUntilNextEstMidnight(now = new Date()) {
    return Math.max(1, getNextEstMidnight(now).getTime() - now.getTime());
}

/** Formats a duration as HH:MM (hours can exceed 24 if needed). */
export function formatDurationHoursMinutes(ms) {
    const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function hasManualThemePreference() {
    if (typeof localStorage === 'undefined') return false;
    try {
        return localStorage.getItem(USER_THEME_MANUAL_STORAGE_KEY) === '1';
    } catch {
        return false;
    }
}

/** Returns the EST calendar day index used for daily theme rotation. */
export function getEstCalendarDayNumber(now = new Date()) {
    return estCalendarDayNumber(now);
}

export function readManualThemeIdForToday(now = new Date()) {
    if (typeof localStorage === 'undefined') return null;
    try {
        if (!hasManualThemePreference()) return null;
        const savedDay = localStorage.getItem(USER_THEME_MANUAL_DAY_KEY);
        const today = String(estCalendarDayNumber(now));
        if (!savedDay || savedDay !== today) {
            clearManualThemePreference();
            return null;
        }
        const saved = localStorage.getItem(USER_THEME_STORAGE_KEY);
        return THEMES[saved] ? saved : null;
    } catch {
        return null;
    }
}

export function saveManualThemeId(themeId, now = new Date()) {
    if (typeof localStorage === 'undefined' || !THEMES[themeId]) return;
    try {
        localStorage.setItem(USER_THEME_STORAGE_KEY, themeId);
        localStorage.setItem(USER_THEME_MANUAL_STORAGE_KEY, '1');
        localStorage.setItem(USER_THEME_MANUAL_DAY_KEY, String(estCalendarDayNumber(now)));
    } catch {
        // Ignore quota / private-mode failures; in-memory choice still applies.
    }
}

export function clearManualThemePreference() {
    if (typeof localStorage === 'undefined') return;
    try {
        localStorage.removeItem(USER_THEME_STORAGE_KEY);
        localStorage.removeItem(USER_THEME_MANUAL_STORAGE_KEY);
        localStorage.removeItem(USER_THEME_MANUAL_DAY_KEY);
    } catch {
        // Ignore storage failures.
    }
}

export function resolveActiveThemeId(now = new Date()) {
    const manual = readManualThemeIdForToday(now);
    if (manual) return manual;
    return getDailyDefaultThemeId(now);
}

export function resolveThemeId(savedThemeId, now = new Date()) {
    if (savedThemeId && THEMES[savedThemeId]) return savedThemeId;
    return getDailyDefaultThemeId(now);
}

export const getThemeConfig = (themeId) => THEMES[themeId] || THEMES[DEFAULT_THEME_ID];
