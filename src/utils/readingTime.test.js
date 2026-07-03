import { describe, it, expect } from 'vitest';
import { readingTimeMinutes } from './readingTime.js';

describe('readingTimeMinutes', () => {
    it('returns at least 1 minute', () => {
        expect(readingTimeMinutes('')).toBe(1);
        expect(readingTimeMinutes(null)).toBe(1);
        expect(readingTimeMinutes('short post')).toBe(1);
    });

    it('estimates ~200 words per minute', () => {
        const words = Array.from({ length: 600 }, (_, i) => `word${i}`).join(' ');
        expect(readingTimeMinutes(words)).toBe(3);
    });

    it('does not count fenced code blocks word by word', () => {
        const code = '```\n' + Array.from({ length: 400 }, () => 'x = 1;').join('\n') + '\n```';
        expect(readingTimeMinutes(`intro text ${code}`)).toBe(1);
    });
});
