//! KYA Oracle Bridge - Export reputation scores to external chains
//!
//! This crate provides a bridge for exporting Linera reputation data
//! to external chains like Base/Solana for DeFi integration.

use linera_sdk::linera_base_types::{AccountOwner, ChainId, Timestamp};
use serde::{Deserialize, Serialize};

/// The Application Binary Interface for KYA Oracle Bridge
pub struct KyaOracleBridgeAbi;

// ============================================================================
// Data Types
// ============================================================================

/// A signed commitment of an agent's score for external verification
#[derive(Debug, Clone, Serialize, Deserialize, async_graphql::SimpleObject)]
pub struct ScoreCommitment {
    /// The agent's ID
    pub agent_id: AccountOwner,
    /// The reputation score at time of commitment
    pub score: u16,
    /// The tier at time of commitment
    pub tier: String,
    /// Timestamp of the commitment
    pub timestamp: Timestamp,
    /// Chain ID of the Linera registry
    pub registry_chain_id: ChainId,
    /// Commitment hash (SHA-256 of agent_id + score + timestamp)
    #[graphql(skip)]
    pub commitment_hash: [u8; 32],
}

/// External chain target for score export
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExternalChain {
    Base,
    Solana,
    Ethereum,
    Polygon,
}

// ============================================================================
// Operations
// ============================================================================

/// Operations that can be performed by the oracle bridge
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Operation {
    /// Initialize the bridge with registry chain ID
    Initialize {
        registry_chain_id: ChainId,
    },
    /// Request a score commitment for an agent
    RequestCommitment {
        agent_id: AccountOwner,
    },
    /// Register a score commitment (after receiving from registry)
    RegisterCommitment {
        commitment: ScoreCommitment,
    },
}

/// Response from an operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Response {
    /// Bridge initialized
    Initialized,
    /// Commitment requested
    CommitmentRequested { agent_id: AccountOwner },
    /// Commitment registered
    CommitmentRegistered { commitment_hash: [u8; 32] },
    /// Error occurred
    Error(String),
}

// ============================================================================
// Messages (Cross-chain communication with registry)
// ============================================================================

/// Messages for oracle bridge communication
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Message {
    /// Request score from registry
    ScoreRequest {
        agent_id: AccountOwner,
        requester_chain: ChainId,
    },
    /// Score response from registry
    ScoreResponse {
        agent_id: AccountOwner,
        score: u16,
        tier: String,
        timestamp: Timestamp,
    },
}

// ============================================================================
// ABI Implementation
// ============================================================================

impl linera_sdk::abi::ContractAbi for KyaOracleBridgeAbi {
    type Operation = Operation;
    type Response = Response;
}

impl linera_sdk::abi::ServiceAbi for KyaOracleBridgeAbi {
    type Query = async_graphql::Request;
    type QueryResponse = async_graphql::Response;
}
