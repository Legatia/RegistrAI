import Database from 'better-sqlite3';
import { Agent, ScoreCommitment } from './types.js';
declare const db: Database.Database;
export interface User {
    id: number;
    google_id: string;
    email: string;
    name: string | null;
    picture: string | null;
    chain_id: string | null;
    created_at: string;
    updated_at: string;
}
export declare function findOrCreateUser(profile: {
    id: string;
    email: string;
    name?: string;
    picture?: string;
}): User;
export declare function getUserById(id: number): User | undefined;
export declare function updateUserChain(userId: number, chainId: string): void;
export declare function createAgent(agent: Omit<Agent, 'registered_at' | 'updated_at'>): Agent;
export declare function getAgentById(id: string): Agent | undefined;
export declare function listAgents(limit?: number, offset?: number): Agent[];
export declare function saveCommitment(c: Omit<ScoreCommitment, 'id' | 'created_at'>): void;
export interface WaitlistEntry {
    id: number;
    email: string;
    agent_types: string[];
    use_case: string;
    chains: string[];
    created_at: string;
}
export interface WaitlistInput {
    email: string;
    agent_types: string[];
    use_case: string;
    chains: string[];
}
export declare function addToWaitlist(entry: WaitlistInput): WaitlistEntry;
export declare function getWaitlistByEmail(email: string): WaitlistEntry | undefined;
export declare function getWaitlistCount(): number;
export default db;
