import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProfilePage } from './ProfilePage';

describe('ProfilePage', () => {
    const renderWithRouter = () => {
        return render(
            <BrowserRouter>
                <ProfilePage />
            </BrowserRouter>
        );
    };

    it('should render the agent name', () => {
        renderWithRouter();
        // Check for agent-related content
        expect(screen.getAllByText(/Agent/i).length).toBeGreaterThan(0);
    });

    it('should render the trust score gauge', () => {
        renderWithRouter();
        expect(screen.getByText(/Trust Score/i)).toBeInTheDocument();
    });

    it('should render the staked balance', () => {
        renderWithRouter();
        expect(screen.getByText(/Total Staked/i)).toBeInTheDocument();
        expect(screen.getByText(/1,000 LIN/i)).toBeInTheDocument();
    });

    it('should render the subscription cost', () => {
        renderWithRouter();
        expect(screen.getByText(/Monthly Cost/i)).toBeInTheDocument();
        expect(screen.getByText(/5 LIN/i)).toBeInTheDocument();
    });

    it('should render version information', () => {
        renderWithRouter();
        expect(screen.getByText(/Version/i)).toBeInTheDocument();
    });
});
