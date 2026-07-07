import { describe, it, expect } from 'vitest';
import { slugifyHeading, extractHeadings } from './extractHeadings.js';

describe('slugifyHeading', () => {
    it('lowercases and hyphenates', () => {
        expect(slugifyHeading('Hello World')).toBe('hello-world');
    });

    it('deduplicates special characters', () => {
        expect(slugifyHeading('Foo & Bar!')).toBe('foo-bar');
    });
});

describe('extractHeadings', () => {
    it('extracts h2 and h3 with unique ids', () => {
        const md = `# Title\n\n## First\n\n### Sub\n\n## First\n`;
        const headings = extractHeadings(md);
        expect(headings).toHaveLength(3);
        expect(headings[0]).toMatchObject({ level: 2, text: 'First', id: 'first' });
        expect(headings[2].id).toBe('first-2');
    });
});
