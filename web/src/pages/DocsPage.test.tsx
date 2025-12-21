import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DocsPage } from './DocsPage';

describe('DocsPage', () => {
    const renderWithRouter = () => {
        return render(
            <BrowserRouter>
                <DocsPage />
            </BrowserRouter>
        );
    };

    it('should render the introduction section', () => {
        renderWithRouter();
        expect(screen.getByText(/RegistrAI Developer Hub/i)).toBeInTheDocument();
    });

    it('should render the architecture section', () => {
        renderWithRouter();
        // Multiple elements have this text (sidebar + heading), so we check for at least one
        expect(screen.getAllByText(/System Architecture/i).length).toBeGreaterThan(0);
    });

    it('should render the economic security section', () => {
        renderWithRouter();
        expect(screen.getAllByText(/Economic Security/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Staking/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Slashing/i).length).toBeGreaterThan(0);
    });

    it('should render the monetization section', () => {
        renderWithRouter();
        expect(screen.getByText(/Monetization/i)).toBeInTheDocument();
        expect(screen.getByText(/Subscription Cost/i)).toBeInTheDocument();
    });

    it('should render the API reference section', () => {
        renderWithRouter();
        expect(screen.getAllByText(/API Reference/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/GET/i).length).toBeGreaterThan(0);
    });

    it('should render the oracle bridge section', () => {
        renderWithRouter();
        expect(screen.getByText(/Cross-Chain Oracle/i)).toBeInTheDocument();
    });
});
