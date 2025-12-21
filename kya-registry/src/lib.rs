//! KYA Registry - On-chain AI Agent Reputation System
//!
//! This library defines the core types and ABIs for the KYA Registry Linera application.

#[cfg(test)]
mod tests;

use linera_sdk::linera_base_types::{AccountOwner, Timestamp, Amount};
use serde::{Deserialize, Serialize};

/// The Application Binary Interface for KYA Registry
pub struct KyaRegistryAbi;

// ============================================================================
// Data Types
// ============================================================================

/// Reputation tiers for agents - determines rate limits and trust level
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default, async_graphql::Enum)]
pub enum ReputationTier {
    #[default]
    Unverified, // Rate Limit: 0 req/sec
    Verified,   // Rate Limit: 10 req/sec
    Gold,       // Rate Limit: 100 req/sec
    Platinum,   // Rate Limit: Unlimited
}

impl ReputationTier {
    /// Get the rate limit for this tier (requests per second)
    pub fn rate_limit(&self) -> Option<u32> {
        match self {
            ReputationTier::Unverified => Some(0),
            ReputationTier::Verified => Some(10),
            ReputationTier::Gold => Some(100),
            ReputationTier::Platinum => None, // Unlimited
        }
    }

    /// Calculate tier from reputation score
    pub fn from_score(score: u16) -> Self {
        match score {
            0..=249 => ReputationTier::Unverified,
            250..=499 => ReputationTier::Verified,
            500..=749 => ReputationTier::Gold,
            750..=1000 => ReputationTier::Platinum,
            _ => ReputationTier::Platinum,
        }
    }
}

/// Storage provider for agent code packages
#[derive(Debug, Clone, Serialize, Deserialize, Default, async_graphql::Enum, PartialEq, Eq, Copy)]
pub enum StorageProvider {
    #[default]
    None,     // No off-chain storage
    IPFS,     // IPFS CID
    Arweave,  // Arweave transaction ID
    Walrus,   // Walrus (Sui) blob ID
    HTTP,     // Direct HTTP URL
}

/// Tool definition for MCP-compatible agents
#[derive(Debug, Clone, Serialize, Deserialize, async_graphql::SimpleObject)]
pub struct ToolDefinition {
    /// Name of the tool
    pub name: String,
    /// Description of the tool
    pub description: String,
    /// Input schema (JSON Schema format as string)
    pub input_schema: String,
}

/// Resource requirements for running the agent
#[derive(Debug, Clone, Serialize, Deserialize, async_graphql::SimpleObject, Default)]
pub struct ResourceRequirements {
    /// Minimum memory in MB
    pub min_memory_mb: u32,
    /// Requires GPU
    pub requires_gpu: bool,
    /// Requires network access
    pub requires_network: bool,
    /// Requires filesystem access
    pub requires_filesystem: bool,
}

/// Agent manifest - structured metadata about the agent's capabilities
#[derive(Debug, Clone, Serialize, Deserialize, async_graphql::SimpleObject)]
pub struct AgentManifest {
    /// Human-readable name
    pub name: String,
    /// Description of what the agent does
    pub description: String,
    /// Semantic version (e.g., "1.0.0")
    pub version: String,
    /// Entry point function (e.g., "main.run")
    pub entry_point: String,
    /// Runtime environment (e.g., "python3.11", "docker", "node20")
    pub runtime: String,
    /// List of capabilities/domains (e.g., ["defi", "trading", "social"])
    pub capabilities: Vec<String>,
    /// MCP tools provided by this agent
    pub tools: Vec<ToolDefinition>,
    /// Required permissions
    pub required_permissions: Vec<String>,
    /// Resource requirements
    pub resources: ResourceRequirements,
    /// Author/maintainer
    pub author: String,
    /// License (e.g., "MIT", "Apache-2.0")
    pub license: String,
    /// Homepage/documentation URL
    pub homepage: String,
}

impl Default for AgentManifest {
    fn default() -> Self {
        Self {
            name: String::new(),
            description: String::new(),
            version: "0.1.0".to_string(),
            entry_point: "main.run".to_string(),
            runtime: "python3".to_string(),
            capabilities: Vec::new(),
            tools: Vec::new(),
            required_permissions: Vec::new(),
            resources: ResourceRequirements::default(),
            author: String::new(),
            license: "MIT".to_string(),
            homepage: String::new(),
        }
    }
}

/// The Dynamic Reputation Badge - a Soulbound NFT for AI agents
#[derive(Debug, Clone, Serialize, Deserialize, async_graphql::SimpleObject)]
pub struct AgentBadge {
    // === Identity ===
    /// The agent's wallet owner
    pub owner: AccountOwner,
    /// SHA-256 hash of the full code package
    #[graphql(skip)]
    pub code_hash: [u8; 32],
    
    // === Off-chain Storage ===
    /// Storage provider for full code package
    pub storage_provider: StorageProvider,
    /// Content ID for off-chain storage (IPFS CID, Arweave TX, etc.)
    pub storage_cid: String,
    
    // === Agent Manifest (Essential Metadata) ===
    /// Agent manifest with capabilities, tools, permissions
    pub manifest: AgentManifest,
    
    // === Reputation ===
    /// Reputation score (0-1000)
    pub reputation_score: u16,
    /// Current tier based on score
    pub tier: ReputationTier,
    /// Count of reported spam/abuse incidents
    pub spam_flags: u8,
    
    // === Economics ===
    /// Total amount staked by the agent (Native Token)
    pub stake_balance: Amount,
    /// Cost to subscribe to this agent for 30 days (Native Token)
    pub subscription_cost: Amount,
    
    // === Audit & Activity ===
    /// Timestamp of last audit
    pub last_audit_timestamp: Timestamp,
    /// Number of successful tasks completed
    pub tasks_completed: u64,
    /// Number of failed tasks
    pub tasks_failed: u64,
    
    // === Versioning ===
    /// Number of code updates (version changes)
    pub update_count: u32,
    /// Timestamp of registration
    pub registered_at: Timestamp,
    /// Timestamp of last code update
    pub last_updated_at: Timestamp,
}

impl AgentBadge {
    /// Create a new badge for a freshly registered agent
    pub fn new(
        owner: AccountOwner,
        code_hash: [u8; 32],
        storage_provider: StorageProvider,
        storage_cid: String,
        manifest: AgentManifest,
        timestamp: Timestamp,
    ) -> Self {
        Self {
            owner,
            code_hash,
            storage_provider,
            storage_cid,
            manifest,
            reputation_score: 100, // Start with base score
            tier: ReputationTier::Unverified,
            spam_flags: 0,
            stake_balance: Amount::ZERO,
            subscription_cost: Amount::ZERO,
            last_audit_timestamp: timestamp,
            tasks_completed: 0,
            tasks_failed: 0,
            update_count: 0,
            registered_at: timestamp,
            last_updated_at: timestamp,
        }
    }

    /// Recalculate tier based on current score
    pub fn update_tier(&mut self) {
        self.tier = ReputationTier::from_score(self.reputation_score);
    }

    /// Update the agent's code (new version)
    pub fn update_code(
        &mut self,
        code_hash: [u8; 32],
        storage_provider: StorageProvider,
        storage_cid: String,
        manifest: AgentManifest,
        timestamp: Timestamp,
    ) {
        self.code_hash = code_hash;
        self.storage_provider = storage_provider;
        self.storage_cid = storage_cid;
        self.manifest = manifest;
        self.update_count += 1;
        self.last_updated_at = timestamp;
        // Code updates require re-verification, reset to Unverified tier
        // but preserve the score
        if self.tier != ReputationTier::Unverified {
            // Small penalty for updating code without re-audit
            self.reputation_score = self.reputation_score.saturating_sub(50);
            self.update_tier();
        }
    }

    /// Get the code hash as hex string
    pub fn code_hash_hex(&self) -> String {
        hex::encode(self.code_hash)
    }
}

// ============================================================================
// Operations (User-initiated actions)
// ============================================================================

/// Operations that can be performed on the registry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Operation {
    /// Register a new AI agent with full manifest
    RegisterAgent {
        /// SHA-256 hash of the full code package
        code_hash: [u8; 32],
        /// Storage provider (IPFS, Arweave, etc.)
        storage_provider: StorageProvider,
        /// Content ID for retrieving the code
        storage_cid: String,
        /// Agent manifest with metadata
        manifest: AgentManifest,
    },
    /// Update an existing agent's code (new version)
    UpdateAgentCode {
        /// New code hash
        code_hash: [u8; 32],
        /// New storage provider
        storage_provider: StorageProvider,
        /// New storage CID
        storage_cid: String,
        /// Updated manifest
        manifest: AgentManifest,
    },
    /// Manually adjust an agent's score (admin/DAO only)
    AdjustScore {
        agent_id: AccountOwner,
        delta: i16,
        reason: String,
    },
    /// Flag an agent for spam/abuse
    FlagSpam {
        agent_id: AccountOwner,
        evidence: String,
    },
    /// Submit an audit result for an agent
    SubmitAudit {
        agent_id: AccountOwner,
        passed: bool,
        auditor_notes: String,
    },
    /// Verify that a code hash matches the stored CID (anyone can verify)
    VerifyCodeHash {
        agent_id: AccountOwner,
        expected_hash: [u8; 32],
    },
    
    // === Economic Operations ===
    /// Lock tokens to increase security/trust (Native Token)
    Stake {
        amount: Amount,
    },
    /// Withdraw staked tokens
    Unstake {
        amount: Amount,
    },
    /// Slash an agent's stake (Governance only)
    Slash {
        agent_id: AccountOwner,
        amount: Amount,
    },
    /// Set the subscription cost for this agent
    SetSubscriptionCost {
        cost: Amount,
    },
    /// User pays the agent for a subscription
    Subscribe {
        agent_id: AccountOwner,
        duration: u64, // Not used in logic yet (just payment), but good for indexing
    },
}

/// Response from an operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Response {
    /// Agent successfully registered
    AgentRegistered { 
        agent_id: AccountOwner,
        storage_cid: String,
    },
    /// Agent code updated
    AgentUpdated {
        agent_id: AccountOwner,
        version: String,
        update_count: u32,
    },
    /// Score was adjusted
    ScoreAdjusted { new_score: u16, new_tier: ReputationTier },
    /// Spam flag recorded
    SpamFlagged { total_flags: u8 },
    /// Audit submitted
    AuditSubmitted { passed: bool },
    /// Hash verification result
    HashVerified { matches: bool },
    
    // === Economic Responses ===
    /// Staked successfully
    Staked { agent_id: AccountOwner, amount: Amount, new_balance: Amount },
    /// Unstaked successfully
    Unstaked { agent_id: AccountOwner, amount: Amount, remaining_balance: Amount },
    /// Slashed successfully
    Slashed { agent_id: AccountOwner, amount: Amount },
    /// Subscription success
    Subscribed { agent_id: AccountOwner, subscriber: AccountOwner, cost: Amount },
    /// Cost updated
    CostUpdated { agent_id: AccountOwner, new_cost: Amount },
    
    /// Error occurred
    Error(String),
}

// ============================================================================
// Messages (Cross-chain communication)
// ============================================================================

/// Messages sent between chains
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Message {
    /// Activity log from an agent's chain
    ActivityLog {
        agent_id: AccountOwner,
        task_hash: [u8; 32],
        success: bool,
        timestamp: Timestamp,
    },
    /// Proof of audit from an auditor
    ProofOfAudit {
        agent_id: AccountOwner,
        auditor: AccountOwner,
        passed: bool,
        timestamp: Timestamp,
    },
    /// Score query response (for oracle bridge)
    ScoreResponse {
        agent_id: AccountOwner,
        score: u16,
        tier: ReputationTier,
        timestamp: Timestamp,
    },
    /// Code update notification
    CodeUpdated {
        agent_id: AccountOwner,
        new_code_hash: [u8; 32],
        new_version: String,
        timestamp: Timestamp,
    },
}

// ============================================================================
// ABI Implementation
// ============================================================================

impl linera_sdk::abi::ContractAbi for KyaRegistryAbi {
    type Operation = Operation;
    type Response = Response;
}

impl linera_sdk::abi::ServiceAbi for KyaRegistryAbi {
    type Query = async_graphql::Request;
    type QueryResponse = async_graphql::Response;
}
