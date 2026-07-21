import React from 'react';

// CSS enter animation (replaces framer-motion; route-level exit animations
// were never triggered because <Routes> is not wrapped in AnimatePresence).
export const PageTransition = ({ children, className = '' }) => {
    return (
        <div className={`page-transition ${className}`}>
            {children}
        </div>
    );
};
