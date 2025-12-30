//! KYA Registry Service - GraphQL queries for reading badge data

#![cfg_attr(target_arch = "wasm32", no_main)]
#![allow(unexpected_cfgs)]

use std::sync::Arc;

use async_graphql::{EmptySubscription, Object, Request, Response, Schema, Context};
use kya_registry::{AgentBadge, KyaRegistryAbi};
use linera_sdk::{
    linera_base_types::{AccountOwner, WithServiceAbi},
    views::View,
    Service, ServiceRuntime,
};

mod state;
use state::KyaRegistryState;

linera_sdk::service!(KyaRegistryService);

/// The KYA Registry service
pub struct KyaRegistryService {
    state: Arc<KyaRegistryState>,
    #[allow(dead_code)]
    runtime: Arc<ServiceRuntime<Self>>,
}

impl Service for KyaRegistryService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = KyaRegistryState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        KyaRegistryService {
            state: Arc::new(state),
            runtime: Arc::new(runtime),
        }
    }

    async fn handle_query(&self, request: Request) -> Response {
        let total_registered = *self.state.total_registered.get();
        let total_logs_processed = *self.state.total_logs_processed.get();
        let state = self.state.clone();
        
        let schema = Schema::build(
            QueryRoot {
                total_registered,
                total_logs_processed,
                state,
            },
            MutationRoot,
            EmptySubscription,
        )
        .finish();
        schema.execute(request).await
    }
}

impl WithServiceAbi for KyaRegistryService {
    type Abi = KyaRegistryAbi;
}

// ============================================================================
// GraphQL Schema
// ============================================================================

/// GraphQL query root
struct QueryRoot {
    total_registered: u64,
    total_logs_processed: u64,
    state: Arc<KyaRegistryState>,
}

#[Object]
impl QueryRoot {
    /// Get total registered agents
    async fn total_agents(&self) -> u64 {
        self.total_registered
    }

    /// Get total activity logs processed
    async fn total_logs(&self) -> u64 {
        self.total_logs_processed
    }

    /// Get an agent's badge by their AccountOwner ID
    async fn get_badge(&self, agent_id: String) -> Option<AgentBadge> {
        // Parse the hex string to AccountOwner
        // AccountOwner is typically a 32-byte hex address
        let bytes: Vec<u8> = match hex::decode(agent_id.trim_start_matches("0x")) {
            Ok(b) => b,
            Err(_) => return None,
        };
        
        if bytes.len() != 32 {
            return None;
        }
        
        let mut arr = [0u8; 32];
        arr.copy_from_slice(&bytes);
        
        // Note: This is a simplified conversion. In production, you'd need
        // proper AccountOwner construction from the address bytes.
        // For now, we return None as a placeholder since AccountOwner
        // construction requires the full Owner type.
        None
    }
}

/// GraphQL mutation root (operations via GraphQL)
struct MutationRoot;

#[Object]
impl MutationRoot {
    /// Placeholder - operations should be submitted via Linera CLI
    async fn placeholder(&self) -> bool {
        true
    }
}
