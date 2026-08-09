import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import { NavigationEffects, __resetNavigationScrollMemory } from './NavigationEffects.jsx';

const testI18n = i18n.createInstance();
testI18n.use(initReactI18next).init({
  lng: 'en',
  resources: {
    en: {
      translation: {
        a11y: { routeAnnouncement: 'Navigated to {{title}}' },
        seo: { aboutTitle: 'About — Parjad Minooei', homeTitle: 'Home' },
      },
    },
  },
});

function PushHarness() {
  const navigate = useNavigate();
  return (
    <>
      <main id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/about" element={<div>About</div>} />
        </Routes>
      </main>
      <button type="button" onClick={() => navigate('/about')}>
        Go about
      </button>
      <NavigationEffects />
    </>
  );
}

function LocaleHarness() {
  const navigate = useNavigate();
  return (
    <>
      <main id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/about" element={<div>About</div>} />
          <Route path="/fr/about" element={<div>À propos</div>} />
        </Routes>
      </main>
      <button type="button" onClick={() => navigate('/fr/about')}>
        Switch
      </button>
      <NavigationEffects />
    </>
  );
}

describe('NavigationEffects', () => {
  beforeEach(() => {
    __resetNavigationScrollMemory();
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('focuses main content and resets scroll on push navigation', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <MemoryRouter initialEntries={['/']}>
          <PushHarness />
        </MemoryRouter>
      </I18nextProvider>,
    );
    screen.getByText('Go about').click();
    await waitFor(() => {
      expect(document.activeElement).toBe(document.getElementById('main-content'));
    });
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    expect(screen.getByText(/Navigated to About/i)).toBeTruthy();
  });

  it('does not steal focus on locale-only path changes', async () => {
    render(
      <I18nextProvider i18n={testI18n}>
        <MemoryRouter initialEntries={['/about']}>
          <LocaleHarness />
        </MemoryRouter>
      </I18nextProvider>,
    );
    const main = document.getElementById('main-content');
    main.focus();
    window.scrollTo.mockClear();
    screen.getByText('Switch').click();
    await waitFor(() => expect(screen.getByText('À propos')).toBeTruthy());
    expect(document.activeElement).toBe(main);
    expect(window.scrollTo).not.toHaveBeenCalledWith(0, 0);
  });
});
