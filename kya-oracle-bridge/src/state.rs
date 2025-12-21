//! KYA Oracle Bridge State - Store score commitments

use kya_oracle_bridge::ScoreCommitment;
use linera_sdk::linera_base_types::{AccountOwner, ChainId};
use linera_sdk::views::{linera_views, MapView, RegisterView, RootView, ViewStorageContext};

/// The root state of the KYA Oracle Bridge application
#[derive(RootView, async_graphql::SimpleObject)]
#[view(context = ViewStorageContext)]
pub struct OracleBridgeState {
    /// The chain ID of the KYA Registry hub
    pub registry_chain_id: RegisterView<Option<ChainId>>,
    /// Map of agent IDs to their latest score commitments
    pub commitments: MapView<AccountOwner, ScoreCommitment>,
    /// Total number of commitments generated
    pub total_commitments: RegisterView<u64>,
}

impl OracleBridgeState {
    /// Initialize with registry chain ID
    pub fn initialize(&mut self, registry_chain_id: ChainId) {
        self.registry_chain_id.set(Some(registry_chain_id));
    }

    /// Get the registry chain ID
    pub fn get_registry(&self) -> Option<ChainId> {
        *self.registry_chain_id.get()
    }

    /// Store a new commitment
    pub async fn store_commitment(&mut self, commitment: ScoreCommitment) -> Result<(), String> {
        let agent_id = commitment.agent_id;
        self.commitments
            .insert(&agent_id, commitment)
            .map_err(|e| e.to_string())?;

        let count = self.total_commitments.get();
        self.total_commitments.set(count + 1);

        Ok(())
    }

    /// Get a commitment for an agent
    pub async fn get_commitment(
        &self,
        agent_id: &AccountOwner,
    ) -> Result<Option<ScoreCommitment>, String> {
        self.commitments.get(agent_id).await.map_err(|e| e.to_string())
    }
}
