import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { useSwipeDown } from './useSwipeDown.js';

const Swipeable = ({ onSwipeDown, threshold }) => {
    const handlers = useSwipeDown(onSwipeDown, threshold);
    return <div data-testid="panel" {...handlers} />;
};

const touch = (y) => ({ touches: [{ clientY: y }] });

describe('useSwipeDown', () => {
    it('fires after swiping down past the threshold', () => {
        const onSwipeDown = vi.fn();
        const { getByTestId } = render(<Swipeable onSwipeDown={onSwipeDown} threshold={80} />);
        const panel = getByTestId('panel');

        fireEvent.touchStart(panel, touch(100));
        fireEvent.touchMove(panel, touch(150));
        expect(onSwipeDown).not.toHaveBeenCalled();

        fireEvent.touchMove(panel, touch(200));
        expect(onSwipeDown).toHaveBeenCalledTimes(1);
    });

    it('does not fire for upward swipes', () => {
        const onSwipeDown = vi.fn();
        const { getByTestId } = render(<Swipeable onSwipeDown={onSwipeDown} threshold={80} />);
        const panel = getByTestId('panel');

        fireEvent.touchStart(panel, touch(300));
        fireEvent.touchMove(panel, touch(100));
        expect(onSwipeDown).not.toHaveBeenCalled();
    });

    it('resets between gestures', () => {
        const onSwipeDown = vi.fn();
        const { getByTestId } = render(<Swipeable onSwipeDown={onSwipeDown} threshold={80} />);
        const panel = getByTestId('panel');

        fireEvent.touchStart(panel, touch(100));
        fireEvent.touchEnd(panel);
        // Move without a new touchStart must not fire
        fireEvent.touchMove(panel, touch(400));
        expect(onSwipeDown).not.toHaveBeenCalled();
    });
});
