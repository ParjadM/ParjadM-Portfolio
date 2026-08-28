import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Layout } from './components/layout/Layout.jsx';
import { DEFAULT_CURSOR_THEME_ID } from './utils/cursorThemeConfig.js';
import {
    clearManualThemePreference,
    getDailyDefaultThemeId,
    msUntilNextEstMidnight,
    readManualThemeIdForToday,
    resolveActiveThemeId,
    saveManualThemeId,
} from './utils/themeConfig.js';

// --- Main App Component ---
function App() {
    const [currentThemeId, setCurrentThemeId] = useState(() => resolveActiveThemeId());
    const [cursorThemeId, setCursorThemeId] = useState(DEFAULT_CURSOR_THEME_ID);
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

    const syncThemeForToday = useCallback(() => {
        const manualTheme = readManualThemeIdForToday();
        if (manualTheme) {
            setCurrentThemeId(manualTheme);
            return;
        }
        setCurrentThemeId(getDailyDefaultThemeId());
    }, []);

    // Load preferences on mount — apply today's EST default unless user picked today
    useEffect(() => {
        syncThemeForToday();
        const savedCursorTheme = localStorage.getItem('portfolio_cursor_theme_id');
        if (savedCursorTheme) {
            setCursorThemeId(savedCursorTheme);
        }
    }, [syncThemeForToday]);

    // Force the new daily default at EST midnight and when the tab returns on a new day
    useEffect(() => {
        const applyDailyDefault = () => {
            clearManualThemePreference();
            setCurrentThemeId(getDailyDefaultThemeId());
        };

        let timeoutId;
        const scheduleNextSwitch = () => {
            clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
                applyDailyDefault();
                scheduleNextSwitch();
            }, msUntilNextEstMidnight());
        };

        scheduleNextSwitch();

        const onVisible = () => {
            if (document.visibilityState !== 'visible') return;
            syncThemeForToday();
        };

        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener('focus', syncThemeForToday);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('visibilitychange', onVisible);
            window.removeEventListener('focus', syncThemeForToday);
        };
    }, [syncThemeForToday]);

    const updateTheme = (newThemeId) => {
        setCurrentThemeId(newThemeId);
        saveManualThemeId(newThemeId);
    };

    const updateCursorTheme = (newCursorThemeId) => {
        setCursorThemeId(newCursorThemeId);
        localStorage.setItem('portfolio_cursor_theme_id', newCursorThemeId);
    };

    return (
        <HelmetProvider>
            <Router>
                <Layout 
                    themeId={currentThemeId}
                    setThemeId={updateTheme}
                    cursorThemeId={cursorThemeId}
                    setCursorThemeId={updateCursorTheme}
                    toast={toast}
                    setToast={setToast}
                />
            </Router>
        </HelmetProvider>
    );
}

export default App;
