import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps keyboard focus inside the element the returned ref is attached to
 * while `active` is true. Tab wraps around, Escape calls onEscape, and focus
 * is restored to the previously focused element when the trap deactivates.
 */
export function useFocusTrap(active, onEscape) {
    const containerRef = useRef(null);
    const onEscapeRef = useRef(onEscape);
    onEscapeRef.current = onEscape;

    useEffect(() => {
        if (!active) return;
        const container = containerRef.current;
        if (!container) return;

        const previouslyFocused = document.activeElement;

        // Focus the first focusable element (or the container itself)
        const focusables = container.querySelectorAll(FOCUSABLE);
        if (focusables.length > 0) {
            focusables[0].focus();
        } else {
            container.setAttribute('tabindex', '-1');
            container.focus();
        }

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                onEscapeRef.current?.();
                return;
            }
            if (e.key !== 'Tab') return;

            const items = Array.from(container.querySelectorAll(FOCUSABLE))
                .filter((el) => !el.disabled && el.getAttribute('aria-hidden') !== 'true');
            if (items.length === 0) return;

            const first = items[0];
            const last = items[items.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
            if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
                previouslyFocused.focus();
            }
        };
    }, [active]);

    return containerRef;
}
