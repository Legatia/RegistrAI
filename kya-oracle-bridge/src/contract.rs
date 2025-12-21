//! KYA Oracle Bridge Contract - Handle score commitment requests

#![allow(unexpected_cfgs)]

use kya_oracle_bridge::{KyaOracleBridgeAbi, Message, Operation, Response, ScoreCommitment};
use linera_sdk::{
    linera_base_types::WithContractAbi,
    views::{RootView, View},
    Contract, ContractRuntime,
};
use sha2::{Digest, Sha256};

mod state;
use state::OracleBridgeState;

linera_sdk::contract!(OracleBridgeContract);

/// The Oracle Bridge contract
pub struct OracleBridgeContract {
    state: OracleBridgeState,
    runtime: ContractRuntime<Self>,
}

impl Contract for OracleBridgeContract {
    type Message = Message;
    type Parameters = ();
    type InstantiationArgument = ();
    type EventValue = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = OracleBridgeState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        OracleBridgeContract { state, runtime }
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

            Operation::RequestCommitment { agent_id } => {
                let registry_chain_id = match self.state.get_registry() {
                    Some(id) => id,
                    None => return Response::Error("Not initialized with registry".to_string()),
                };

                // Send request to registry for score
                let message = Message::ScoreRequest {
                    agent_id,
                    requester_chain: self.runtime.chain_id(),
                };

                self.runtime
                    .prepare_message(message)
                    .with_tracking()
                    .send_to(registry_chain_id);

                Response::CommitmentRequested { agent_id }
            }

            Operation::RegisterCommitment { commitment } => {
                let hash = commitment.commitment_hash;
                if let Err(e) = self.state.store_commitment(commitment).await {
                    return Response::Error(e);
                }
                Response::CommitmentRegistered {
                    commitment_hash: hash,
                }
            }
        }
    }

    async fn execute_message(&mut self, message: Message) {
        match message {
            Message::ScoreResponse {
                agent_id,
                score,
                tier,
                timestamp,
            } => {
                // Create commitment from registry response
                let registry_chain_id = self.state.get_registry().unwrap_or(self.runtime.chain_id());

                // Generate commitment hash
                let mut hasher = Sha256::new();
                hasher.update(format!("{:?}", agent_id).as_bytes());
                hasher.update(score.to_le_bytes());
                hasher.update(format!("{:?}", timestamp).as_bytes());
                let commitment_hash: [u8; 32] = hasher.finalize().into();

                let commitment = ScoreCommitment {
                    agent_id,
                    score,
                    tier,
                    timestamp,
                    registry_chain_id,
                    commitment_hash,
                };

                let _ = self.state.store_commitment(commitment).await;
            }

            Message::ScoreRequest { .. } => {
                // This is sent OUT, not received
            }
        }
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}

impl WithContractAbi for OracleBridgeContract {
    type Abi = KyaOracleBridgeAbi;
}
