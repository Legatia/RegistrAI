import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import db from '../db';

// Create a minimal test app
const app = express();
app.use(express.json());

// Mock the agents routes matching actual db schema
app.get('/api/agents', (_req, res) => {
    const agents = db.prepare('SELECT * FROM agents LIMIT 10').all();
    res.json({ agents });
});

app.post('/api/agents/search', (req, res) => {
    const { tier, min_score } = req.body;
    let query = 'SELECT * FROM agents WHERE 1=1';
    const params: any[] = [];

    if (tier) {
        query += ' AND tier = ?';
        params.push(tier);
    }
    if (min_score) {
        query += ' AND reputation_score >= ?';
        params.push(min_score);
    }

    const agents = db.prepare(query).all(...params);
    res.json({ agents });
});

app.post('/api/agents/:id/score', (req, res) => {
    const { id } = req.params;
    const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(id);

    if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
    }

    // Mock commitment generation
    const commitment = {
        agent_id: id,
        score: (agent as any).reputation_score,
        timestamp: Date.now(),
        signature: 'mock_signature_' + id
    };

    res.json(commitment);
});

describe('Agent API', () => {
    beforeAll(() => {
        // Seed test data using correct schema
        db.exec(`
            INSERT OR IGNORE INTO agents (id, name, tier, reputation_score, capabilities, storage_cid, code_hash)
            VALUES 
                ('test-agent-1', 'Test Agent 1', 'PLATINUM', 950, '["trading"]', 'cid123', 'hash123'),
                ('test-agent-2', 'Test Agent 2', 'GOLD', 750, '["analysis"]', 'cid456', 'hash456'),
                ('test-agent-3', 'Test Agent 3', 'SILVER', 500, '["trading", "analysis"]', 'cid789', 'hash789');
        `);
    });

    afterAll(() => {
        // Cleanup test data
        db.exec(`DELETE FROM agents WHERE id LIKE 'test-agent-%'`);
    });

    describe('GET /api/agents', () => {
        it('should return a list of agents', async () => {
            const res = await request(app).get('/api/agents');

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('agents');
            expect(Array.isArray(res.body.agents)).toBe(true);
        });
    });

    describe('POST /api/agents/search', () => {
        it('should filter agents by tier', async () => {
            const res = await request(app)
                .post('/api/agents/search')
                .send({ tier: 'PLATINUM' });

            expect(res.status).toBe(200);
            expect(res.body.agents.every((a: any) => a.tier === 'PLATINUM')).toBe(true);
        });

        it('should filter agents by minimum score', async () => {
            const res = await request(app)
                .post('/api/agents/search')
                .send({ min_score: 700 });

            expect(res.status).toBe(200);
            expect(res.body.agents.every((a: any) => a.reputation_score >= 700)).toBe(true);
        });
    });

    describe('POST /api/agents/:id/score', () => {
        it('should return a commitment for a valid agent', async () => {
            const res = await request(app)
                .post('/api/agents/test-agent-1/score')
                .send({});

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('agent_id', 'test-agent-1');
            expect(res.body).toHaveProperty('score');
            expect(res.body).toHaveProperty('signature');
        });

        it('should return 404 for non-existent agent', async () => {
            const res = await request(app)
                .post('/api/agents/non-existent/score')
                .send({});

            expect(res.status).toBe(404);
        });
    });
});
