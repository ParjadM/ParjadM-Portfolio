import React, { Profiler } from 'react';
import { render, fireEvent, act, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { GlassCard } from './GlassCard.jsx';

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
it('coalesces hover events into one paint without React commits', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true }));
  let paint;
  const raf = vi.fn(callback => { paint = callback; return 1; });
  vi.stubGlobal('requestAnimationFrame', raf);
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  const commits = vi.fn();
  const { container } = render(<Profiler id="card" onRender={commits}><GlassCard>Content</GlassCard></Profiler>);
  const card = container.firstChild;
  commits.mockClear();
  fireEvent.mouseMove(card, { clientX: 20, clientY: 30 });
  fireEvent.mouseMove(card, { clientX: 50, clientY: 60 });
  expect(raf).toHaveBeenCalledTimes(1);
  act(() => paint());
  expect(card.style.getPropertyValue('--glow-x')).toBe('50px');
  expect(commits).not.toHaveBeenCalled();
});
it('does not schedule hover painting on touch devices', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  const raf = vi.fn();
  vi.stubGlobal('requestAnimationFrame', raf);
  const { container } = render(<GlassCard>Content</GlassCard>);
  fireEvent.mouseMove(container.firstChild, { clientX: 20 });
  expect(raf).not.toHaveBeenCalled();
});
