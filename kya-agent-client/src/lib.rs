//! KYA Agent Client - Activity logging for AI agents on Linera
//!
//! This crate runs on each agent's individual microchain and handles:
//! - Local task logging
//! - Cross-chain messaging to the KYA Registry hub

use linera_sdk::linera_base_types::{AccountOwner, ChainId, Timestamp};
use serde::{Deserialize, Serialize};

/// The Application Binary Interface for KYA Agent Client
pub struct KyaAgentClientAbi;

// ============================================================================
// Data Types
// ============================================================================

/// A logged task entry
#[derive(Debug, Clone, Serialize, Deserialize, async_graphql::SimpleObject)]
pub struct TaskEntry {
    /// SHA-256 hash of the task description as hex string
    #[graphql(skip)]
    pub task_hash: [u8; 32],
    /// Whether the task succeeded
    pub success: bool,
    /// Timestamp of the task
    pub timestamp: Timestamp,
    /// Optional task description (for local reference)
    pub description: String,
}

// ============================================================================
// Operations (User-initiated actions)
// ============================================================================

/// Operations that can be performed by the agent client
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Operation {
    /// Initialize the client with the registry chain ID
    Initialize {
        registry_chain_id: ChainId,
    },
    /// Log a completed task
    LogTask {
        description: String,
        success: bool,
    },
    /// Request an audit from the registry
    RequestAudit,
}

/// Response from an operation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Response {
    /// Client initialized
    Initialized,
    /// Task logged successfully
    TaskLogged { task_hash: [u8; 32] },
    /// Audit requested
    AuditRequested,
    /// Error occurred
    Error(String),
}

// ============================================================================
// Messages (Cross-chain communication)
// ============================================================================

/// Messages sent to the registry hub
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Message {
    /// Activity log sent to registry
    ActivityLog {
        agent_id: AccountOwner,
        task_hash: [u8; 32],
        success: bool,
        timestamp: Timestamp,
    },
    /// Audit request sent to registry
    AuditRequest {
        agent_id: AccountOwner,
        timestamp: Timestamp,
    },
}

// ============================================================================
// ABI Implementation
// ============================================================================

impl linera_sdk::abi::ContractAbi for KyaAgentClientAbi {
    type Operation = Operation;
    type Response = Response;
}

impl linera_sdk::abi::ServiceAbi for KyaAgentClientAbi {
    type Query = async_graphql::Request;
    type QueryResponse = async_graphql::Response;
}
