import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Layout } from './components/layout/Layout.jsx';

// --- Main App Component ---
function App() {
    const [currentThemeId, setCurrentThemeId] = useState('emerald-dark');
    const [cursorThemeId, setCursorThemeId] = useState('professional');
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

    // Load theme preference on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('portfolio_theme_id');
        if (savedTheme) {
            setCurrentThemeId(savedTheme);
        }
        const savedCursorTheme = localStorage.getItem('portfolio_cursor_theme_id');
        if (savedCursorTheme) {
            setCursorThemeId(savedCursorTheme);
        }
    }, []);

    const updateTheme = (newThemeId) => {
        setCurrentThemeId(newThemeId);
        localStorage.setItem('portfolio_theme_id', newThemeId);
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
