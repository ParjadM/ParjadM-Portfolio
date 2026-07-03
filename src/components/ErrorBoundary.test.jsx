import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary.jsx';
import { reportError } from '../utils/errorReporter.js';

vi.mock('../utils/errorReporter.js', () => ({
    reportError: vi.fn(),
}));

const Boom = () => {
    throw new Error('kaboom');
};

describe('ErrorBoundary', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // React logs caught render errors; keep test output clean
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('renders children when nothing throws', () => {
        render(
            <ErrorBoundary>
                <p>all good</p>
            </ErrorBoundary>
        );
        expect(screen.getByText('all good')).toBeInTheDocument();
    });

    it('shows the fallback UI and reports the error when a child throws', () => {
        render(
            <ErrorBoundary>
                <Boom />
            </ErrorBoundary>
        );
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
        expect(reportError).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'kaboom',
                source: 'react-error-boundary',
            })
        );
    });
});
