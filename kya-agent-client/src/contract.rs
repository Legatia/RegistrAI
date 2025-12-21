//! KYA Agent Client Contract - Logs tasks and sends activity to registry

#![allow(unexpected_cfgs)]

use kya_agent_client::{KyaAgentClientAbi, Message, Operation, Response, TaskEntry};
use linera_sdk::{
    linera_base_types::WithContractAbi,
    views::{RootView, View},
    Contract, ContractRuntime,
};
use sha2::{Digest, Sha256};

mod state;
use state::AgentClientState;

linera_sdk::contract!(AgentClientContract);

/// The Agent Client contract
pub struct AgentClientContract {
    state: AgentClientState,
    runtime: ContractRuntime<Self>,
}

impl Contract for AgentClientContract {
    type Message = Message;
    type Parameters = ();
    type InstantiationArgument = ();
    type EventValue = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = AgentClientState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        AgentClientContract { state, runtime }
    }

    async fn instantiate(&mut self, _argument: Self::InstantiationArgument) {
        // Default initialization
    }

    async fn execute_operation(&mut self, operation: Operation) -> Response {
        match operation {
            Operation::Initialize { registry_chain_id } => {
                self.state.initialize(registry_chain_id);
                Response::Initialized
            }

            Operation::LogTask {
                description,
                success,
            } => {
                // Get the authenticated signer (agent owner)
                let agent_id = match self.runtime.authenticated_signer() {
                    Some(signer) => signer.into(),
                    None => return Response::Error("Must be authenticated".to_string()),
                };

                // Get registry chain ID
                let registry_chain_id = match self.state.get_registry() {
                    Some(id) => id,
                    None => return Response::Error("Not initialized with registry".to_string()),
                };

                // Hash the task description
                let mut hasher = Sha256::new();
                hasher.update(description.as_bytes());
                let task_hash: [u8; 32] = hasher.finalize().into();

                let timestamp = self.runtime.system_time();

                // Create task entry
                let entry = TaskEntry {
                    task_hash,
                    success,
                    timestamp,
                    description,
                };

                // Log locally
                if let Err(e) = self.state.log_task(entry).await {
                    return Response::Error(e);
                }

                // Send activity log to registry hub
                let message = Message::ActivityLog {
                    agent_id,
                    task_hash,
                    success,
                    timestamp,
                };

                self.runtime
                    .prepare_message(message)
                    .with_authentication()
                    .with_tracking()
                    .send_to(registry_chain_id);

                Response::TaskLogged { task_hash }
            }

            Operation::RequestAudit => {
                let agent_id = match self.runtime.authenticated_signer() {
                    Some(signer) => signer.into(),
                    None => return Response::Error("Must be authenticated".to_string()),
                };

                let registry_chain_id = match self.state.get_registry() {
                    Some(id) => id,
                    None => return Response::Error("Not initialized with registry".to_string()),
                };

                let timestamp = self.runtime.system_time();

                let message = Message::AuditRequest {
                    agent_id,
                    timestamp,
                };

                self.runtime
                    .prepare_message(message)
                    .with_authentication()
                    .with_tracking()
                    .send_to(registry_chain_id);

                Response::AuditRequested
            }
        }
    }

    async fn execute_message(&mut self, _message: Message) {
        // Agent client doesn't receive messages from registry in this design
        // Could be extended to receive score updates, audit results, etc.
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}

impl WithContractAbi for AgentClientContract {
    type Abi = KyaAgentClientAbi;
}
