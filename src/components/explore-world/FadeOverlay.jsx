import React from 'react';

/**
 * Fullscreen fade for outdoor ↔ interior transitions.
 */
export function FadeOverlay({ visible }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-40 bg-black transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden={!visible}
    />
  );
}
