import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Layout } from './components/layout/Layout.jsx';

// --- Main App Component ---
function App() {
    const [currentThemeId, setCurrentThemeId] = useState('emerald-dark');
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

    // Load theme preference on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('portfolio_theme_id');
        if (savedTheme) {
            setCurrentThemeId(savedTheme);
        }
    }, []);

    const updateTheme = (newThemeId) => {
        setCurrentThemeId(newThemeId);
        localStorage.setItem('portfolio_theme_id', newThemeId);
    };

    return (
        <Router>
            <Layout 
                themeId={currentThemeId}
                setThemeId={updateTheme}
                toast={toast}
                setToast={setToast}
            />
        </Router>
    );
}

export default App;
