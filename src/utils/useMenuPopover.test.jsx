import React, { useRef, useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { useMenuPopover } from './useMenuPopover.js';

function MenuDemo() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const { menuId, menuRef } = useMenuPopover({
    open,
    onClose: () => setOpen(false),
    triggerRefs: [triggerRef],
  });

  return (
    <div>
      <button
        ref={triggerRef}
        type="button"
        aria-controls={menuId}
        onClick={() => setOpen(true)}
      >
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

async function openMenu(utils) {
  const trigger = utils.getByText('Trigger');
  trigger.focus();
  fireEvent.click(trigger);
  await waitFor(() => expect(document.activeElement).toBe(utils.getByText('One')));
}

describe('useMenuPopover', () => {
  it('focuses the first menuitem when opened', async () => {
    const utils = render(<MenuDemo />);
    await openMenu(utils);
  });

  it('moves with ArrowDown / ArrowUp / Home / End', async () => {
    const utils = render(<MenuDemo />);
    await openMenu(utils);

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(utils.getByText('Two'));

    fireEvent.keyDown(document, { key: 'End' });
    expect(document.activeElement).toBe(utils.getByText('Three'));

    fireEvent.keyDown(document, { key: 'Home' });
    expect(document.activeElement).toBe(utils.getByText('One'));

    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(utils.getByText('Three'));
  });

  it('closes on Escape and restores trigger focus', async () => {
    const utils = render(<MenuDemo />);
    await openMenu(utils);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(utils.getByTestId('closed')).toBeTruthy();
    await waitFor(() => expect(document.activeElement).toBe(utils.getByText('Trigger')));
  });

  it('closes on Tab without forcing focus back to the trigger', async () => {
    const utils = render(<MenuDemo />);
    await openMenu(utils);
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(utils.getByTestId('closed')).toBeTruthy();
  });
});
