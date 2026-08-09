import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import { SEO } from './SEO.jsx';

const testI18n = i18n.createInstance();
testI18n.use(initReactI18next).init({
  lng: 'fr',
  resources: {
    fr: {
      translation: {
        seo: {
          defaultTitle: 'Par défaut',
          defaultDesc: 'Desc',
          aboutTitle: 'À propos — Parjad Minooei',
          aboutDesc: 'Description FR',
        },
      },
    },
    en: {
      translation: {
        seo: {
          defaultTitle: 'Default',
          defaultDesc: 'Desc',
          aboutTitle: 'About — Parjad Minooei',
          aboutDesc: 'Description EN',
        },
      },
    },
  },
});

function getMeta(attr, value) {
  return document.head.querySelector(`meta[${attr}="${value}"]`);
}

describe('SEO', () => {
  it('emits French canonical and localized metadata for /fr routes', async () => {
    await testI18n.changeLanguage('fr');
    render(
      <HelmetProvider>
        <I18nextProvider i18n={testI18n}>
          <MemoryRouter initialEntries={['/fr/about']}>
            <SEO titleKey="seo.aboutTitle" descriptionKey="seo.aboutDesc" />
          </MemoryRouter>
        </I18nextProvider>
      </HelmetProvider>,
    );

    // react-helmet-async writes into the document asynchronously in tests;
    // read after a microtask.
    await Promise.resolve();
    const canonical = document.head.querySelector('link[rel="canonical"]');
    expect(canonical?.getAttribute('href')).toBe('https://parjadm.ca/fr/about');
    expect(document.title).toContain('À propos');
    expect(getMeta('name', 'description')?.getAttribute('content')).toContain('Description FR');
    expect(document.head.querySelector('link[hreflang="fr-CA"]')).toBeTruthy();
  });

  it('marks pages noindex when requested', async () => {
    render(
      <HelmetProvider>
        <I18nextProvider i18n={testI18n}>
          <MemoryRouter initialEntries={['/missing']}>
            <SEO title="Missing" description="Nope" noindex />
          </MemoryRouter>
        </I18nextProvider>
      </HelmetProvider>,
    );
    await Promise.resolve();
    expect(getMeta('name', 'robots')?.getAttribute('content')).toContain('noindex');
  });
});
