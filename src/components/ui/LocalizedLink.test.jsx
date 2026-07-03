import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n.js';
import { LocalizedLink } from './LocalizedLink.jsx';

function renderLink(path, lang, to) {
    i18n.changeLanguage(lang);
    return render(
        <MemoryRouter initialEntries={[path]}>
            <I18nextProvider i18n={i18n}>
                <LocalizedLink to={to}>Go</LocalizedLink>
            </I18nextProvider>
        </MemoryRouter>
    );
}

describe('LocalizedLink', () => {
    it('prefixes paths with /fr when language is french', () => {
        renderLink('/fr/projects', 'fr', '/blog');
        expect(screen.getByRole('link')).toHaveAttribute('href', '/fr/blog');
    });

    it('leaves paths unprefixed for english', () => {
        renderLink('/projects', 'en', '/blog');
        expect(screen.getByRole('link')).toHaveAttribute('href', '/blog');
    });
});
