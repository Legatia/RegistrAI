/**
 * API utility functions for communicating with the RegistrAI server
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Types
export interface Agent {
    id: string;
    owner_id: number | null;
    name: string;
    description: string;
    version: string;
    code_hash: string;
    storage_provider: string;
    storage_cid: string;
    capabilities: string[];
    runtime: string;
    reputation_score: number;
    tier: 'UNVERIFIED' | 'VERIFIED' | 'GOLD' | 'PLATINUM';
    spam_flags: number;
    tasks_completed: number;
    tasks_failed: number;
    registered_at: string;
    updated_at: string;
}

export interface AgentCreateInput {
    name: string;
    description?: string;
    version?: string;
    code_hash: string;
    storage_provider?: string;
    storage_cid?: string;
    capabilities?: string[];
    runtime?: string;
}

export interface ScoreCommitment {
    agent_id: string;
    score: number;
    tier: string;
    timestamp: string;
    expires_at: string;
    commitment_hash: string;
    signature: string;
}

// Generic fetch wrapper with credentials
async function fetchWithCredentials<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.json();
}

// Agent API functions
export async function listAgents(limit = 50, offset = 0): Promise<Agent[]> {
    return fetchWithCredentials<Agent[]>(`/api/agents?limit=${limit}&offset=${offset}`);
}

export async function getAgent(id: string): Promise<Agent> {
    return fetchWithCredentials<Agent>(`/api/agents/${id}`);
}

export async function createAgent(input: AgentCreateInput): Promise<Agent> {
    return fetchWithCredentials<Agent>('/api/agents', {
        method: 'POST',
        body: JSON.stringify(input),
    });
}

export async function searchAgents(filters: {
    tier?: string;
    min_score?: number;
    capability?: string;
}): Promise<Agent[]> {
    return fetchWithCredentials<Agent[]>('/api/agents/search', {
        method: 'POST',
        body: JSON.stringify(filters),
    });
}

export async function getAgentScore(id: string): Promise<{ id: string; score: number; tier: string }> {
    return fetchWithCredentials<{ id: string; score: number; tier: string }>(`/api/agents/${id}/score`);
}

export async function getAgentCommitment(id: string): Promise<ScoreCommitment> {
    return fetchWithCredentials<ScoreCommitment>(`/api/agents/${id}/commitment`);
}

// File hash utility
export async function hashFile(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
