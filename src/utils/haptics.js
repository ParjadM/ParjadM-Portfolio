/** Tiny vibration on supported devices (Android); silently no-ops elsewhere. */
export const haptic = (ms = 10) => {
    try {
        if (navigator.vibrate) navigator.vibrate(ms);
    } catch {
        // unsupported
    }
};
