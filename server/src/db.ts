import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { Agent, ScoreCommitment } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db: Database.Database = new Database(path.join(__dirname, '../data/users.db'));

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    google_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    name TEXT,
    picture TEXT,
    chain_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_google_id ON users(google_id);

  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    owner_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    version TEXT DEFAULT 'v1.0.0',
    code_hash TEXT NOT NULL,
    storage_provider TEXT DEFAULT 'IPFS',
    storage_cid TEXT,
    capabilities TEXT,
    runtime TEXT DEFAULT 'python3',
    reputation_score INTEGER DEFAULT 100,
    tier TEXT DEFAULT 'UNVERIFIED',
    spam_flags INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    tasks_failed INTEGER DEFAULT 0,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS commitments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    tier TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    commitment_hash TEXT NOT NULL UNIQUE,
    signature TEXT NOT NULL,
    FOREIGN KEY(agent_id) REFERENCES agents(id)
  );

  CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    agent_types TEXT,
    use_case TEXT,
    chains TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
`);

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

export function findOrCreateUser(profile: {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}): User {
  const existing = db.prepare('SELECT * FROM users WHERE google_id = ?').get(profile.id) as User | undefined;

  if (existing) {
    // Update profile info
    db.prepare(`
      UPDATE users SET email = ?, name = ?, picture = ?, updated_at = CURRENT_TIMESTAMP
      WHERE google_id = ?
    `).run(profile.email, profile.name || null, profile.picture || null, profile.id);

    return db.prepare('SELECT * FROM users WHERE google_id = ?').get(profile.id) as User;
  }

  // Create new user
  db.prepare(`
    INSERT INTO users (google_id, email, name, picture)
    VALUES (?, ?, ?, ?)
  `).run(profile.id, profile.email, profile.name || null, profile.picture || null);

  return db.prepare('SELECT * FROM users WHERE google_id = ?').get(profile.id) as User;
}

export function getUserById(id: number): User | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}

export function updateUserChain(userId: number, chainId: string): void {
  db.prepare(`
    UPDATE users SET chain_id = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(chainId, userId);
}

// === Agent Functions ===

export function createAgent(agent: Omit<Agent, 'registered_at' | 'updated_at'>): Agent {
  const caps = JSON.stringify(agent.capabilities);

  db.prepare(`
        INSERT INTO agents (
            id, owner_id, name, description, version, code_hash,
            storage_provider, storage_cid, capabilities, runtime,
            reputation_score, tier
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
    `).run(
    agent.id, agent.owner_id || null, agent.name, agent.description,
    agent.version, agent.code_hash, agent.storage_provider,
    agent.storage_cid, caps, agent.runtime,
    agent.reputation_score, agent.tier
  );

  return getAgentById(agent.id)!;
}

export function getAgentById(id: string): Agent | undefined {
  const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(id) as any;
  if (!agent) return undefined;

  return {
    ...agent,
    capabilities: JSON.parse(agent.capabilities || '[]')
  };
}

export function listAgents(limit = 50, offset = 0): Agent[] {
  const agents = db.prepare('SELECT * FROM agents ORDER BY reputation_score DESC LIMIT ? OFFSET ?')
    .all(limit, offset) as any[];

  return agents.map(a => ({
    ...a,
    capabilities: JSON.parse(a.capabilities || '[]')
  }));
}

export function saveCommitment(c: Omit<ScoreCommitment, 'id' | 'created_at'>): void {
  db.prepare(`
        INSERT INTO commitments (
            agent_id, score, tier, expires_at, commitment_hash, signature
        ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(c.agent_id, c.score, c.tier, c.expires_at, c.commitment_hash, c.signature);
}

// === Waitlist Functions ===

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

export function addToWaitlist(entry: WaitlistInput): WaitlistEntry {
  const existing = db.prepare('SELECT * FROM waitlist WHERE email = ?').get(entry.email);
  if (existing) {
    throw new Error('Email already registered');
  }

  db.prepare(`
    INSERT INTO waitlist (email, agent_types, use_case, chains)
    VALUES (?, ?, ?, ?)
  `).run(
    entry.email,
    JSON.stringify(entry.agent_types),
    entry.use_case,
    JSON.stringify(entry.chains)
  );

  return getWaitlistByEmail(entry.email)!;
}

export function getWaitlistByEmail(email: string): WaitlistEntry | undefined {
  const row = db.prepare('SELECT * FROM waitlist WHERE email = ?').get(email) as any;
  if (!row) return undefined;

  return {
    ...row,
    agent_types: JSON.parse(row.agent_types || '[]'),
    chains: JSON.parse(row.chains || '[]')
  };
}

export function getWaitlistCount(): number {
  const result = db.prepare('SELECT COUNT(*) as count FROM waitlist').get() as any;
  return result.count;
}

export default db;
