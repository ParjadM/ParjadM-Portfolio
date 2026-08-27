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

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function localCalendarDayNumber(date) {
    return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY);
}

export function getDailyDefaultThemeId(now = new Date()) {
    const count = THEME_IDS.length;
    const index = ((localCalendarDayNumber(now) % count) + count) % count;
    return THEME_IDS[index];
}

export function getNextDailyDefaultThemeId(now = new Date()) {
    const currentId = getDailyDefaultThemeId(now);
    const currentIndex = THEME_IDS.indexOf(currentId);
    return THEME_IDS[(currentIndex + 1) % THEME_IDS.length];
}

export function getNextLocalMidnight(now = new Date()) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
}

export function msUntilNextLocalMidnight(now = new Date()) {
    return Math.max(1, getNextLocalMidnight(now).getTime() - now.getTime());
}

/** Formats a duration as HH:MM (hours can exceed 24 if needed). */
export function formatDurationHoursMinutes(ms) {
    const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function readSavedThemeId() {
    if (typeof localStorage === 'undefined') return null;
    try {
        const saved = localStorage.getItem(USER_THEME_STORAGE_KEY);
        return THEMES[saved] ? saved : null;
    } catch {
        return null;
    }
}

export function resolveThemeId(savedThemeId, now = new Date()) {
    if (savedThemeId && THEMES[savedThemeId]) return savedThemeId;
    return getDailyDefaultThemeId(now);
}

export const getThemeConfig = (themeId) => THEMES[themeId] || THEMES[DEFAULT_THEME_ID];
