export interface Agent {
    id: string;              // hex or uuid
    owner_id?: number;       // FK to users table (nullable)
    name: string;
    description: string;
    version: string;
    code_hash: string;
    storage_provider: 'IPFS' | 'Arweave' | 'Walrus' | 'HTTP';
    storage_cid: string;
    capabilities: string[];  // JSON array in DB
    runtime: string;
    reputation_score: number;
    tier: 'UNVERIFIED' | 'VERIFIED' | 'GOLD' | 'PLATINUM';
    spam_flags: number;
    tasks_completed: number;
    tasks_failed: number;
    registered_at: string;
    updated_at: string;
}

export interface ScoreCommitment {
    id?: number;
    agent_id: string;
    score: number;
    tier: string;
    created_at: string;
    expires_at: string;
    commitment_hash: string;
    signature: string;
}

export interface AgentManifest {
    name: string;
    description: string;
    version: string;
    entry_point: string;
    runtime: string;
    capabilities: string[];
    resources?: {
        min_memory_mb: number;
        requires_gpu: boolean;
        requires_network: boolean;
        requires_filesystem: boolean;
    };
    author: string;
    license: string;
    homepage: string;
}
