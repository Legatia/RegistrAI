import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { ethers } from 'ethers';
import { createAgent, getAgentById, listAgents, saveCommitment } from '../db.js';
import { Agent, AgentManifest } from '../types.js';

const router = express.Router();
// Secret key for signing commitments (in production, use KMS or separate key)
const SIGNING_SECRET = process.env.SIGNING_SECRET || 'dev-signing-secret-do-not-use-in-prod';
// EVM signer for Base/Ethereum oracle commitments
const EVM_SIGNER_KEY = process.env.EVM_SIGNER_PRIVATE_KEY;

// GET /api/agents - List all agents
router.get('/', (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const agents = listAgents(limit, offset);
    res.json(agents);
});

// GET /api/agents/:id - Get full agent details
router.get('/:id', (req, res) => {
    const agent = getAgentById(req.params.id);
    if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(agent);
});

// GET /api/agents/:id/score - Lightweight score check
router.get('/:id/score', (req, res) => {
    const agent = getAgentById(req.params.id);
    if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
    }
    res.json({
        id: agent.id,
        score: agent.reputation_score,
        tier: agent.tier
    });
});

// GET /api/agents/:id/commitment - Generate signed commitment
router.get('/:id/commitment', (req, res) => {
    const agent = getAgentById(req.params.id);
    if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
    }

    const timestamp = new Date().toISOString();
    // Valid for 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Create payload to sign
    const payload = `${agent.id}:${agent.reputation_score}:${agent.tier}:${timestamp}:${expiresAt}`;

    // START: Commitment Hashing Logic
    const hmac = crypto.createHmac('sha256', SIGNING_SECRET);
    hmac.update(payload);
    const signature = hmac.digest('hex');
    const commitmentHash = crypto.createHash('sha256').update(payload).digest('hex');
    // END: Commitment Hashing Logic

    const commitment = {
        agent_id: agent.id,
        score: agent.reputation_score,
        tier: agent.tier,
        timestamp,
        expires_at: expiresAt,
        commitment_hash: commitmentHash,
        signature
    };

    // Save for audit trail
    saveCommitment(commitment);

    res.json(commitment);
});

// GET /api/agents/:id/evm-commitment - Generate EVM-compatible signed commitment for Base/Ethereum
router.get('/:id/evm-commitment', async (req, res) => {
    if (!EVM_SIGNER_KEY) {
        return res.status(503).json({
            error: 'EVM signer not configured',
            hint: 'Set EVM_SIGNER_PRIVATE_KEY in .env'
        });
    }

    const agent = getAgentById(req.params.id);
    if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
    }

    const tierMap: Record<string, number> = {
        'UNVERIFIED': 0, 'VERIFIED': 1, 'GOLD': 2, 'PLATINUM': 3
    };

    const timestamp = Math.floor(Date.now() / 1000);
    const expiresAt = timestamp + 3600; // 1 hour validity

    try {
        // Create message hash matching Solidity's keccak256(abi.encodePacked(...))
        const messageHash = ethers.solidityPackedKeccak256(
            ['string', 'uint16', 'uint8', 'uint64', 'uint64'],
            [agent.id, agent.reputation_score, tierMap[agent.tier], timestamp, expiresAt]
        );

        const wallet = new ethers.Wallet(EVM_SIGNER_KEY);
        const signature = await wallet.signMessage(ethers.getBytes(messageHash));

        res.json({
            agent_id: agent.id,
            score: agent.reputation_score,
            tier: tierMap[agent.tier],
            tier_name: agent.tier,
            timestamp,
            expires_at: expiresAt,
            signature,
            oracle_address: wallet.address,
            verifier_address: process.env.KYA_VERIFIER_ADDRESS || 'Not deployed yet',
            chain: 'base_sepolia'
        });
    } catch (err: any) {
        console.error('Failed to sign EVM commitment:', err);
        res.status(500).json({ error: 'Failed to sign commitment' });
    }
});

// POST /api/agents/search - Search agents
router.post('/search', (req, res) => {
    const { tier, min_score, capability } = req.body;

    // Naive implementation: fetch all and filter in memory 
    // (SQL would be better but capabilities are stored as JSON string)
    let agents = listAgents(100, 0);

    if (tier) {
        agents = agents.filter(a => a.tier === tier);
    }

    if (min_score) {
        agents = agents.filter(a => a.reputation_score >= min_score);
    }

    if (capability) {
        agents = agents.filter(a =>
            a.capabilities.some((c: string) => c.toLowerCase().includes(capability.toLowerCase()))
        );
    }

    res.json(agents);
});

// POST /api/agents - Register new agent
router.post('/', (req, res) => {
    // Basic auth check
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const {
        name, description, version, code_hash,
        storage_provider, storage_cid, capabilities, runtime
    } = req.body;

    if (!name || !code_hash) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const newAgent: Omit<Agent, 'registered_at' | 'updated_at'> = {
        id: uuidv4(),
        owner_id: (req.user as any).id,
        name,
        description: description || '',
        version: version || 'v1.0.0',
        code_hash,
        storage_provider: storage_provider || 'IPFS',
        storage_cid: storage_cid || '',
        capabilities: capabilities || [],
        runtime: runtime || 'python3',
        reputation_score: 100,
        tier: 'UNVERIFIED',
        spam_flags: 0,
        tasks_completed: 0,
        tasks_failed: 0
    };

    try {
        const created = createAgent(newAgent);
        res.status(201).json(created);
    } catch (err: any) {
        console.error('Failed to create agent:', err);
        res.status(500).json({ error: 'Failed to register agent' });
    }
});

// POST /api/verify - Verify a commitment
router.post('/verify', (req, res) => {
    const { commitment_hash, signature, payload_data } = req.body;

    // If they provide just hash/sig, we can't fully verify without the original payload data
    // unless we look it up in DB. For stateless verification, they must provide payload data.

    if (!payload_data || !signature) {
        return res.status(400).json({ error: 'Missing payload_data or signature' });
    }

    const { agent_id, score, tier, timestamp, expires_at } = payload_data;
    const reconstructedPayload = `${agent_id}:${score}:${tier}:${timestamp}:${expires_at}`;

    const hmac = crypto.createHmac('sha256', SIGNING_SECRET);
    hmac.update(reconstructedPayload);
    const expectedSig = hmac.digest('hex');

    if (signature !== expectedSig) {
        return res.status(400).json({ valid: false, error: 'Invalid signature' });
    }

    if (new Date(expires_at) < new Date()) {
        return res.status(400).json({ valid: false, error: 'Commitment expired' });
    }

    res.json({ valid: true });
});

export default router;
