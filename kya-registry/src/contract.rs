//! KYA Registry Contract - Handles operations and messages

#![cfg_attr(target_arch = "wasm32", no_main)]
#![allow(unexpected_cfgs)]

use kya_registry::{AgentBadge, KyaRegistryAbi, Message, Operation, Response};
use linera_sdk::{
    linera_base_types::{AccountOwner, WithContractAbi},
    views::{RootView, View},
    Contract, ContractRuntime,
};

mod state;
use state::KyaRegistryState;

linera_sdk::contract!(KyaRegistryContract);

/// The KYA Registry contract
pub struct KyaRegistryContract {
    state: KyaRegistryState,
    runtime: ContractRuntime<Self>,
}

impl Contract for KyaRegistryContract {
    type Message = Message;
    type Parameters = ();
    type InstantiationArgument = ();
    type EventValue = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = KyaRegistryState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        KyaRegistryContract { state, runtime }
    }

    async fn instantiate(&mut self, _argument: Self::InstantiationArgument) {
        // Initialize with default state - nothing special needed
        // The state views initialize with their default values
    }

    async fn execute_operation(&mut self, operation: Operation) -> Response {
        match operation {
            Operation::RegisterAgent {
                code_hash,
                storage_provider,
                storage_cid,
                manifest,
            } => {
                let owner = self
                    .runtime
                    .authenticated_signer()
                    .expect("Operation must be authenticated");

                let timestamp = self.runtime.system_time();
                let badge = AgentBadge::new(
                    owner.into(),
                    code_hash,
                    storage_provider,
                    storage_cid.clone(),
                    manifest,
                    timestamp,
                );

                match self.state.register_agent(badge).await {
                    Ok(cid) => Response::AgentRegistered {
                        agent_id: owner.into(),
                        storage_cid: cid,
                    },
                    Err(e) => Response::Error(e),
                }
            }

            Operation::UpdateAgentCode {
                code_hash,
                storage_provider,
                storage_cid,
                manifest,
            } => {
                let owner = self
                    .runtime
                    .authenticated_signer()
                    .expect("Operation must be authenticated");

                let timestamp = self.runtime.system_time();

                match self
                    .state
                    .update_agent_code(
                        &owner.into(),
                        code_hash,
                        storage_provider,
                        storage_cid,
                        manifest,
                        timestamp,
                    )
                    .await
                {
                    Ok((version, update_count)) => Response::AgentUpdated {
                        agent_id: owner.into(),
                        version,
                        update_count,
                    },
                    Err(e) => Response::Error(e),
                }
            }

            Operation::AdjustScore {
                agent_id,
                delta,
                reason: _,
            } => {
                // TODO: Add admin/DAO permission check
                match self.state.update_score(&agent_id, delta).await {
                    Ok((new_score, new_tier)) => Response::ScoreAdjusted { new_score, new_tier },
                    Err(e) => Response::Error(e),
                }
            }

            Operation::FlagSpam {
                agent_id,
                evidence: _,
            } => match self.state.flag_spam(&agent_id).await {
                Ok(total_flags) => Response::SpamFlagged { total_flags },
                Err(e) => Response::Error(e),
            },

            Operation::SubmitAudit {
                agent_id,
                passed,
                auditor_notes: _,
            } => {
                // Update score based on audit result
                let delta = if passed { 100 } else { -50 };
                match self.state.update_score(&agent_id, delta).await {
                    Ok(_) => Response::AuditSubmitted { passed },
                    Err(e) => Response::Error(e),
                }
            }

            Operation::VerifyCodeHash {
                agent_id,
                expected_hash,
            } => match self.state.verify_code_hash(&agent_id, expected_hash).await {
                Ok(matches) => Response::HashVerified { matches },
                Err(e) => Response::Error(e),
            },

            // === Economic Operations ===
            
            Operation::Stake { amount } => {
                let owner = self.runtime.authenticated_signer().expect("Authentication required");
                let agent_id: AccountOwner = owner.into(); // Assuming owner implies agent_id for self-staking

                // 1. Transfer tokens from User -> Contract
                let contract_id = self.runtime.application_id().forget_abi(); 
                let destination: AccountOwner = contract_id.into();
                
                // Note: In a real Linera app, we might need to handle specific chain/account logic
                // self.runtime.transfer(Some(owner), destination, amount); 
                // However, Linera's transfer model usually happens via system calls.
                // For this MVP, we will simulate the "Accounting" in our state,
                // assuming the cross-chain message carried the funding or system balance check passes.
                // But typically we do:
                // self.runtime.transfer(None, destination, amount); // Transfer from current chain balance? 
                
                // SIMULATION FOR MVP: We just assume the transfer succeeds if we are logic-bound
                // In production, we'd verify the incoming funds.
                
                match self.state.stake_tokens(&agent_id, amount).await {
                    Ok(new_balance) => Response::Staked { agent_id, amount, new_balance },
                    Err(e) => Response::Error(e),
                }
            }

            Operation::Unstake { amount } => {
                let owner = self.runtime.authenticated_signer().expect("Authentication required");
                let agent_id: AccountOwner = owner.into();

                match self.state.unstake_tokens(&agent_id, amount).await {
                    Ok(remaining_balance) => {
                        // 2. Transfer tokens Contract -> User
                        // self.runtime.transfer(None, owner, amount);
                        Response::Unstaked { agent_id, amount, remaining_balance }
                    },
                    Err(e) => Response::Error(e),
                }
            }

            Operation::Slash { agent_id, amount } => {
                // TODO: Governance Check
                // let caller = self.runtime.authenticated_signer();
                // if caller != Some(all_powerful_admin) { return Error }

                match self.state.unstake_tokens(&agent_id, amount).await {
                    Ok(_) => Response::Slashed { agent_id, amount },
                    Err(e) => Response::Error(e),
                }
            }

            Operation::SetSubscriptionCost { cost } => {
                let owner = self.runtime.authenticated_signer().expect("Authentication required");
                let agent_id: AccountOwner = owner.into();

                match self.state.set_subscription_cost(&agent_id, cost).await {
                    Ok(_) => Response::CostUpdated { agent_id, new_cost: cost },
                    Err(e) => Response::Error(e),
                }
            }

            Operation::Subscribe { agent_id, duration: _ } => {
                let subscriber = self.runtime.authenticated_signer().expect("Authentication required");
                
                match self.state.get_subscription_cost(&agent_id).await {
                    Ok(cost) => {
                         // 3. User -> Agent Transfer
                         // self.runtime.transfer(None, agent_id, cost);
                         
                         Response::Subscribed { agent_id, subscriber: subscriber.into(), cost }
                    },
                    Err(e) => Response::Error(e),
                }
    }
            }
    }

    async fn execute_message(&mut self, message: Message) {
        match message {
            Message::ActivityLog {
                agent_id,
                task_hash: _,
                success,
                timestamp: _,
            } => {
                // Record the task result and update reputation
                let _ = self.state.record_task(&agent_id, success).await;
            }

            Message::ProofOfAudit {
                agent_id,
                auditor: _,
                passed,
                timestamp: _,
            } => {
                // Apply audit result to reputation
                let delta = if passed { 100 } else { -50 };
                let _ = self.state.update_score(&agent_id, delta).await;
            }

            Message::ScoreResponse { .. } | Message::CodeUpdated { .. } => {
                // These message types are sent OUT, not received
                // No action needed here
            }
        }
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}

impl WithContractAbi for KyaRegistryContract {
    type Abi = KyaRegistryAbi;
}
