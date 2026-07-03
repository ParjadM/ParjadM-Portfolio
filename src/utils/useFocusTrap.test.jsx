import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { useFocusTrap } from './useFocusTrap.js';

const TrapPanel = ({ active, onEscape }) => {
    const trapRef = useFocusTrap(active, onEscape);
    return (
        <div ref={trapRef} data-testid="panel">
            <button type="button">First</button>
            <button type="button">Second</button>
        </div>
    );
};

describe('useFocusTrap', () => {
    it('focuses the first focusable element when activated', () => {
        const { getByText } = render(<TrapPanel active onEscape={() => {}} />);
        expect(document.activeElement).toBe(getByText('First'));
    });

    it('calls onEscape when Escape is pressed', () => {
        const onEscape = vi.fn();
        render(<TrapPanel active onEscape={onEscape} />);
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(onEscape).toHaveBeenCalledTimes(1);
    });

    it('wraps Tab from last to first focusable', () => {
        const { getByText } = render(<TrapPanel active onEscape={() => {}} />);
        getByText('Second').focus();
        fireEvent.keyDown(document, { key: 'Tab' });
        expect(document.activeElement).toBe(getByText('First'));
    });

    it('wraps Shift+Tab from first to last focusable', () => {
        const { getByText } = render(<TrapPanel active onEscape={() => {}} />);
        getByText('First').focus();
        fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
        expect(document.activeElement).toBe(getByText('Second'));
    });
});
