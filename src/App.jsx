import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Layout } from './components/layout/Layout.jsx';

// --- Main App Component ---
function App() {
    // Theme State
    const [darkMode, setDarkMode] = useState(true);
    const [theme, setTheme] = useState('green'); // 'green' or 'pink'
    const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

    // Load theme preference on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('portfolio_theme');
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'green' ? 'pink' : 'green';
        setTheme(newTheme);
        localStorage.setItem('portfolio_theme', newTheme);
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    return (
        <Router>
            <Layout 
                theme={theme}
                toggleTheme={toggleTheme}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                toast={toast}
                setToast={setToast}
            />
        </Router>
    );
}

export default App;
