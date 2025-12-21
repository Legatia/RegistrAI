import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database(path.join(__dirname, '../data/users.db'));
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
`);
export function findOrCreateUser(profile) {
    const existing = db.prepare('SELECT * FROM users WHERE google_id = ?').get(profile.id);
    if (existing) {
        // Update profile info
        db.prepare(`
      UPDATE users SET email = ?, name = ?, picture = ?, updated_at = CURRENT_TIMESTAMP
      WHERE google_id = ?
    `).run(profile.email, profile.name || null, profile.picture || null, profile.id);
        return db.prepare('SELECT * FROM users WHERE google_id = ?').get(profile.id);
    }
    // Create new user
    db.prepare(`
    INSERT INTO users (google_id, email, name, picture)
    VALUES (?, ?, ?, ?)
  `).run(profile.id, profile.email, profile.name || null, profile.picture || null);
    return db.prepare('SELECT * FROM users WHERE google_id = ?').get(profile.id);
}
export function getUserById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}
export function updateUserChain(userId, chainId) {
    db.prepare(`
    UPDATE users SET chain_id = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(chainId, userId);
}
// === Agent Functions ===
export function createAgent(agent) {
    const caps = JSON.stringify(agent.capabilities);
    db.prepare(`
        INSERT INTO agents (
            id, owner_id, name, description, version, code_hash,
            storage_provider, storage_cid, capabilities, runtime,
            reputation_score, tier
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
    `).run(agent.id, agent.owner_id || null, agent.name, agent.description, agent.version, agent.code_hash, agent.storage_provider, agent.storage_cid, caps, agent.runtime, agent.reputation_score, agent.tier);
    return getAgentById(agent.id);
}
export function getAgentById(id) {
    const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
    if (!agent)
        return undefined;
    return {
        ...agent,
        capabilities: JSON.parse(agent.capabilities || '[]')
    };
}
export function listAgents(limit = 50, offset = 0) {
    const agents = db.prepare('SELECT * FROM agents ORDER BY reputation_score DESC LIMIT ? OFFSET ?')
        .all(limit, offset);
    return agents.map(a => ({
        ...a,
        capabilities: JSON.parse(a.capabilities || '[]')
    }));
}
export function saveCommitment(c) {
    db.prepare(`
        INSERT INTO commitments (
            agent_id, score, tier, expires_at, commitment_hash, signature
        ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(c.agent_id, c.score, c.tier, c.expires_at, c.commitment_hash, c.signature);
}
export default db;
