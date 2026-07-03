/** Estimate reading time in minutes from markdown/plain text (~200 wpm). */
export function readingTimeMinutes(content) {
    if (!content) return 1;
    const words = String(content)
        .replace(/```[\s\S]*?```/g, ' code ')
        .replace(/[#*_>`[\]()!-]/g, ' ')
        .split(/\s+/)
        .filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}
