import React from 'react';
import { reportError } from '../utils/errorReporter.js';

/**
 * Catches React render crashes, reports them, and shows a friendly
 * recovery screen instead of a blank page.
 */
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        reportError({
            message: error?.message || 'React render error',
            stack: `${error?.stack || ''}\n--- component stack ---${info?.componentStack || ''}`,
            source: 'react-error-boundary',
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0f172a',
                    color: '#e2e8f0',
                    fontFamily: 'system-ui, sans-serif',
                    padding: '2rem',
                    textAlign: 'center',
                }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                        Something went wrong
                    </h1>
                    <p style={{ color: '#94a3b8', maxWidth: '24rem', marginBottom: '1.5rem' }}>
                        An unexpected error occurred. It has been reported automatically — try reloading the page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '0.6rem 1.5rem',
                            borderRadius: '9999px',
                            border: '1px solid rgba(16,185,129,0.4)',
                            background: 'rgba(16,185,129,0.15)',
                            color: '#6ee7b7',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Reload page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
