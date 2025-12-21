//! KYA Oracle Bridge Service - Query score commitments

#![allow(unexpected_cfgs)]

use std::sync::Arc;

use async_graphql::{EmptySubscription, Object, Request, Response, Schema};
use kya_oracle_bridge::KyaOracleBridgeAbi;
use linera_sdk::{
    linera_base_types::WithServiceAbi,
    views::View,
    Service, ServiceRuntime,
};

mod state;
use state::OracleBridgeState;

linera_sdk::service!(OracleBridgeService);

/// The Oracle Bridge service
pub struct OracleBridgeService {
    state: OracleBridgeState,
    #[allow(dead_code)]
    runtime: Arc<ServiceRuntime<Self>>,
}

impl Service for OracleBridgeService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = OracleBridgeState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        OracleBridgeService {
            state,
            runtime: Arc::new(runtime),
        }
    }

    async fn handle_query(&self, request: Request) -> Response {
        let total_commitments = *self.state.total_commitments.get();
        let schema = Schema::build(
            QueryRoot {
                total_commitments,
            },
            MutationRoot,
            EmptySubscription,
        )
        .finish();
        schema.execute(request).await
    }
}

impl WithServiceAbi for OracleBridgeService {
    type Abi = KyaOracleBridgeAbi;
}

// ============================================================================
// GraphQL Schema
// ============================================================================

struct QueryRoot {
    total_commitments: u64,
}

#[Object]
impl QueryRoot {
    /// Get total commitments generated
    async fn total_commitments(&self) -> u64 {
        self.total_commitments
    }
}

struct MutationRoot;

#[Object]
impl MutationRoot {
    async fn placeholder(&self) -> bool {
        true
    }
}
