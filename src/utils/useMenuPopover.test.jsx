import React, { useRef, useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { useMenuPopover } from './useMenuPopover.js';

function MenuDemo() {
  const [open, setOpen] = useState(true);
  const triggerRef = useRef(null);
  const { menuId, menuRef } = useMenuPopover({
    open,
    onClose: () => setOpen(false),
    triggerRefs: [triggerRef],
  });

  return (
    <div>
      <button ref={triggerRef} type="button" aria-controls={menuId}>
        Trigger
      </button>
      {open && (
        <div ref={menuRef} id={menuId} role="menu">
          <button type="button" role="menuitem">One</button>
          <button type="button" role="menuitem">Two</button>
          <button type="button" role="menuitem">Three</button>
        </div>
      )}
      {!open && <span data-testid="closed">closed</span>}
    </div>
  );
}

describe('useMenuPopover', () => {
  it('focuses the first menuitem when opened', async () => {
    const { getByText } = render(<MenuDemo />);
    await waitFor(() => expect(document.activeElement).toBe(getByText('One')));
  });

  it('moves with ArrowDown / ArrowUp / Home / End', async () => {
    const { getByText } = render(<MenuDemo />);
    await waitFor(() => expect(document.activeElement).toBe(getByText('One')));

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(getByText('Two'));

    fireEvent.keyDown(document, { key: 'End' });
    expect(document.activeElement).toBe(getByText('Three'));

    fireEvent.keyDown(document, { key: 'Home' });
    expect(document.activeElement).toBe(getByText('One'));

    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(getByText('Three'));
  });

  it('closes on Escape and restores trigger focus', async () => {
    const { getByText, getByTestId } = render(<MenuDemo />);
    await waitFor(() => expect(document.activeElement).toBe(getByText('One')));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(getByTestId('closed')).toBeTruthy();
    await waitFor(() => expect(document.activeElement).toBe(getByText('Trigger')));
  });

  it('closes on Tab without forcing focus back to the trigger', async () => {
    const { getByText, getByTestId } = render(<MenuDemo />);
    await waitFor(() => expect(document.activeElement).toBe(getByText('One')));
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(getByTestId('closed')).toBeTruthy();
  });
});
