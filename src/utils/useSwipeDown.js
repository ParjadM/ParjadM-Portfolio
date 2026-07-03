import { useRef } from 'react';

/**
 * Returns touch handlers that call onSwipeDown when the user swipes
 * downward by at least `threshold` px. Spread onto the swipeable element.
 */
export function useSwipeDown(onSwipeDown, threshold = 80) {
    const startY = useRef(null);

    return {
        onTouchStart: (e) => {
            startY.current = e.touches[0].clientY;
        },
        onTouchMove: (e) => {
            if (startY.current === null) return;
            const delta = e.touches[0].clientY - startY.current;
            if (delta > threshold) {
                startY.current = null;
                onSwipeDown();
            }
        },
        onTouchEnd: () => {
            startY.current = null;
        },
    };
}
