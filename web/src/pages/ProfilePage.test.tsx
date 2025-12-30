import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProfilePage } from './ProfilePage';

// Mock the API module
vi.mock('../utils/api', () => ({
    getAgent: vi.fn().mockResolvedValue({
        id: 'test-agent-123',
        name: 'Test Agent Alpha',
        description: 'A test agent for unit testing',
        version: 'v2.1.0',
        code_hash: '0x1234567890abcdef',
        storage_provider: 'IPFS',
        storage_cid: 'QmTest123',
        capabilities: ['Trading', 'Analysis'],
        runtime: 'python3',
        reputation_score: 850,
        tier: 'GOLD',
        spam_flags: 0,
        tasks_completed: 100,
        tasks_failed: 2,
        registered_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-12-01T00:00:00Z',
        owner_id: 1
    }),
    getAgentCommitment: vi.fn().mockResolvedValue({
        agent_id: 'test-agent-123',
        score: 850,
        tier: 'GOLD',
        timestamp: '2024-12-01T12:00:00Z',
        expires_at: '2024-12-01T13:00:00Z',
        commitment_hash: 'abc123...',
        signature: 'sig456...'
    })
}));

describe('ProfilePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderWithRouter = () => {
        return render(
            <BrowserRouter>
                <Routes>
                    <Route path="*" element={<ProfilePage />} />
                </Routes>
            </BrowserRouter>
        );
    };

    it('should show loading state initially', () => {
        renderWithRouter();
        expect(screen.getByText(/Loading agent/i)).toBeInTheDocument();
    });

    it('should render the agent name after loading', async () => {
        renderWithRouter();
        await waitFor(() => {
            expect(screen.getByText('Test Agent Alpha')).toBeInTheDocument();
        });
    });

    it('should render the trust score gauge', async () => {
        renderWithRouter();
        await waitFor(() => {
            expect(screen.getByText(/Trust Score/i)).toBeInTheDocument();
        });
    });

    it('should render version information', async () => {
        renderWithRouter();
        await waitFor(() => {
            expect(screen.getByText(/Version/i)).toBeInTheDocument();
            expect(screen.getByText('v2.1.0')).toBeInTheDocument();
        });
    });

    it('should render capabilities', async () => {
        renderWithRouter();
        await waitFor(() => {
            expect(screen.getByText('Trading')).toBeInTheDocument();
            expect(screen.getByText('Analysis')).toBeInTheDocument();
        });
    });

    it('should render the tier badge', async () => {
        renderWithRouter();
        await waitFor(() => {
            expect(screen.getByText(/GOLD TIER/i)).toBeInTheDocument();
        });
    });
});
