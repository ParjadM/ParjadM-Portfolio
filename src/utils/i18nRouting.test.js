import { describe, it, expect } from 'vitest';
import {
    getLocaleFromPath,
    stripLocalePrefix,
    localizePath,
    isFullscreenPath,
} from './i18nRouting.js';

describe('getLocaleFromPath', () => {
    it('returns fr for /fr and /fr/* paths', () => {
        expect(getLocaleFromPath('/fr')).toBe('fr');
        expect(getLocaleFromPath('/fr/projects')).toBe('fr');
    });

    it('returns en for other paths', () => {
        expect(getLocaleFromPath('/')).toBe('en');
        expect(getLocaleFromPath('/projects')).toBe('en');
        // /fr must be a full segment, not a prefix of another word
        expect(getLocaleFromPath('/fresh')).toBe('en');
    });
});

describe('stripLocalePrefix', () => {
    it('strips the fr prefix', () => {
        expect(stripLocalePrefix('/fr')).toBe('/');
        expect(stripLocalePrefix('/fr/projects')).toBe('/projects');
    });

    it('leaves other paths untouched', () => {
        expect(stripLocalePrefix('/')).toBe('/');
        expect(stripLocalePrefix('/projects')).toBe('/projects');
        expect(stripLocalePrefix('/fresh')).toBe('/fresh');
    });
});

describe('localizePath', () => {
    it('adds the fr prefix for french', () => {
        expect(localizePath('/', 'fr')).toBe('/fr');
        expect(localizePath('/projects', 'fr')).toBe('/fr/projects');
    });

    it('does not double the prefix', () => {
        expect(localizePath('/fr/projects', 'fr')).toBe('/fr/projects');
    });

    it('strips the prefix for english', () => {
        expect(localizePath('/fr/projects', 'en')).toBe('/projects');
        expect(localizePath('/projects', 'en')).toBe('/projects');
    });

    it('normalizes missing leading slash', () => {
        expect(localizePath('projects', 'fr')).toBe('/fr/projects');
    });
});

describe('isFullscreenPath', () => {
    it('detects fullscreen routes in both locales', () => {
        expect(isFullscreenPath('/os')).toBe(true);
        expect(isFullscreenPath('/fr/os')).toBe(true);
        expect(isFullscreenPath('/cli')).toBe(true);
        expect(isFullscreenPath('/intro')).toBe(true);
    });

    it('returns false for regular routes', () => {
        expect(isFullscreenPath('/')).toBe(false);
        expect(isFullscreenPath('/projects')).toBe(false);
    });
});
