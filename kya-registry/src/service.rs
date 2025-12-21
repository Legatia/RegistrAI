//! KYA Registry Service - GraphQL queries for reading badge data

#![cfg_attr(target_arch = "wasm32", no_main)]
#![allow(unexpected_cfgs)]

use std::sync::Arc;

use async_graphql::{EmptySubscription, Object, Request, Response, Schema};
use kya_registry::{KyaRegistryAbi, ReputationTier};
use linera_sdk::{
    linera_base_types::WithServiceAbi,
    views::View,
    Service, ServiceRuntime,
};

mod state;
use state::KyaRegistryState;

linera_sdk::service!(KyaRegistryService);

/// The KYA Registry service
pub struct KyaRegistryService {
    state: KyaRegistryState,
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
            state,
            runtime: Arc::new(runtime),
        }
    }

    async fn handle_query(&self, request: Request) -> Response {
        let total_registered = *self.state.total_registered.get();
        let total_logs_processed = *self.state.total_logs_processed.get();
        
        let schema = Schema::build(
            QueryRoot {
                total_registered,
                total_logs_processed,
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
