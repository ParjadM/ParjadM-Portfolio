import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Layout } from './components/layout/Layout.jsx';
import { DEFAULT_CURSOR_THEME_ID } from './utils/cursorThemeConfig.js';
import {
    getDailyDefaultThemeId,
    msUntilNextEstMidnight,
    readSavedThemeId,
    resolveThemeId,
    saveManualThemeId,
} from './utils/themeConfig.js';

// --- Main App Component ---
function App() {
    const [currentThemeId, setCurrentThemeId] = useState(() => resolveThemeId(readSavedThemeId()));
    const [followsDailyDefault, setFollowsDailyDefault] = useState(() => !readSavedThemeId());
    const [cursorThemeId, setCursorThemeId] = useState(DEFAULT_CURSOR_THEME_ID);
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

    // Load preferences on mount — daily EST default unless user explicitly picked
    useEffect(() => {
        const savedTheme = readSavedThemeId();
        if (savedTheme) {
            setCurrentThemeId(savedTheme);
            setFollowsDailyDefault(false);
        } else {
            setCurrentThemeId(getDailyDefaultThemeId());
            setFollowsDailyDefault(true);
        }
        const savedCursorTheme = localStorage.getItem('portfolio_cursor_theme_id');
        if (savedCursorTheme) {
            setCursorThemeId(savedCursorTheme);
        }
    }, []);

    // Keep applying today's EST default until midnight unless the user picked one
    useEffect(() => {
        if (!followsDailyDefault) return undefined;

        const applyDailyDefault = () => {
            if (readSavedThemeId()) return;
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
        applyDailyDefault();

        const onVisible = () => {
            if (document.visibilityState === 'visible') applyDailyDefault();
        };
        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener('focus', applyDailyDefault);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('visibilitychange', onVisible);
            window.removeEventListener('focus', applyDailyDefault);
        };
    }, [followsDailyDefault]);

    const updateTheme = (newThemeId) => {
        setCurrentThemeId(newThemeId);
        setFollowsDailyDefault(false);
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
