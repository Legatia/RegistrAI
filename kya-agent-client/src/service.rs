//! KYA Agent Client Service - Query task logs and statistics

#![allow(unexpected_cfgs)]

use std::sync::Arc;

use async_graphql::{EmptySubscription, Object, Request, Response, Schema};
use kya_agent_client::KyaAgentClientAbi;
use linera_sdk::{
    linera_base_types::WithServiceAbi,
    views::View,
    Service, ServiceRuntime,
};

mod state;
use state::AgentClientState;

linera_sdk::service!(AgentClientService);

/// The Agent Client service
pub struct AgentClientService {
    state: AgentClientState,
    #[allow(dead_code)]
    runtime: Arc<ServiceRuntime<Self>>,
}

impl Service for AgentClientService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = AgentClientState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        AgentClientService {
            state,
            runtime: Arc::new(runtime),
        }
    }

    async fn handle_query(&self, request: Request) -> Response {
        let (total, success, failure) = self.state.get_stats();
        let schema = Schema::build(
            QueryRoot {
                total_tasks: total,
                success_count: success,
                failure_count: failure,
            },
            MutationRoot,
            EmptySubscription,
        )
        .finish();
        schema.execute(request).await
    }
}

impl WithServiceAbi for AgentClientService {
    type Abi = KyaAgentClientAbi;
}

// ============================================================================
// GraphQL Schema
// ============================================================================

struct QueryRoot {
    total_tasks: u64,
    success_count: u64,
    failure_count: u64,
}

#[Object]
impl QueryRoot {
    /// Get total number of tasks logged
    async fn total_tasks(&self) -> u64 {
        self.total_tasks
    }

    /// Get number of successful tasks
    async fn success_count(&self) -> u64 {
        self.success_count
    }

    /// Get number of failed tasks
    async fn failure_count(&self) -> u64 {
        self.failure_count
    }

    /// Get success rate as percentage
    async fn success_rate(&self) -> f64 {
        if self.total_tasks == 0 {
            0.0
        } else {
            (self.success_count as f64 / self.total_tasks as f64) * 100.0
        }
    }
}

struct MutationRoot;

#[Object]
impl MutationRoot {
    /// Placeholder - operations via CLI
    async fn placeholder(&self) -> bool {
        true
    }
}
