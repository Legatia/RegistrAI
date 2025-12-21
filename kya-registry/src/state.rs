//! KYA Registry State - Persistent storage using linera-views

use kya_registry::{AgentBadge, AgentManifest, ReputationTier, StorageProvider};
use linera_sdk::linera_base_types::{AccountOwner, Timestamp, Amount};
use linera_sdk::views::{linera_views, MapView, RegisterView, RootView, ViewStorageContext};

/// The root state of the KYA Registry application
#[derive(RootView, async_graphql::SimpleObject)]
#[view(context = ViewStorageContext)]
pub struct KyaRegistryState {
    /// Map of agent IDs to their reputation badges
    pub badges: MapView<AccountOwner, AgentBadge>,
    /// Total number of registered agents
    pub total_registered: RegisterView<u64>,
    /// Total activity logs processed
    pub total_logs_processed: RegisterView<u64>,
    /// Total code updates across all agents
    pub total_code_updates: RegisterView<u64>,
}

impl KyaRegistryState {
    /// Register a new agent badge
    pub async fn register_agent(&mut self, badge: AgentBadge) -> Result<String, String> {
        let owner = badge.owner;
        let storage_cid = badge.storage_cid.clone();
        
        // Check if already registered
        if self.badges.contains_key(&owner).await.map_err(|e| e.to_string())? {
            return Err("Agent already registered".to_string());
        }
        
        self.badges.insert(&owner, badge).map_err(|e| e.to_string())?;
        
        let current = self.total_registered.get();
        self.total_registered.set(current + 1);
        
        Ok(storage_cid)
    }

    /// Get an agent's badge
    pub async fn get_badge(&self, agent_id: &AccountOwner) -> Result<Option<AgentBadge>, String> {
        self.badges.get(agent_id).await.map_err(|e| e.to_string())
    }

    /// Update an agent's code (new version)
    pub async fn update_agent_code(
        &mut self,
        agent_id: &AccountOwner,
        code_hash: [u8; 32],
        storage_provider: StorageProvider,
        storage_cid: String,
        manifest: AgentManifest,
        timestamp: Timestamp,
    ) -> Result<(String, u32), String> {
        let mut badge = self
            .badges
            .get(agent_id)
            .await
            .map_err(|e| e.to_string())?
            .ok_or("Agent not found")?;
        
        // Update the code
        badge.update_code(code_hash, storage_provider, storage_cid, manifest.clone(), timestamp);
        
        let version = badge.manifest.version.clone();
        let update_count = badge.update_count;
        
        self.badges.insert(agent_id, badge).map_err(|e| e.to_string())?;
        
        let current = self.total_code_updates.get();
        self.total_code_updates.set(current + 1);
        
        Ok((version, update_count))
    }

    /// Verify that a code hash matches the stored value
    pub async fn verify_code_hash(
        &self,
        agent_id: &AccountOwner,
        expected_hash: [u8; 32],
    ) -> Result<bool, String> {
        let badge = self
            .badges
            .get(agent_id)
            .await
            .map_err(|e| e.to_string())?
            .ok_or("Agent not found")?;
        
        Ok(badge.code_hash == expected_hash)
    }

    /// Update an agent's reputation score
    pub async fn update_score(
        &mut self,
        agent_id: &AccountOwner,
        delta: i16,
    ) -> Result<(u16, ReputationTier), String> {
        let mut badge = self
            .badges
            .get(agent_id)
            .await
            .map_err(|e| e.to_string())?
            .ok_or("Agent not found")?;
        
        // Apply delta with bounds checking (0-1000)
        let new_score = if delta < 0 {
            badge.reputation_score.saturating_sub((-delta) as u16)
        } else {
            badge.reputation_score.saturating_add(delta as u16).min(1000)
        };
        
        badge.reputation_score = new_score;
        badge.update_tier();
        
        let new_tier = badge.tier;
        self.badges.insert(agent_id, badge).map_err(|e| e.to_string())?;
        
        Ok((new_score, new_tier))
    }

    /// Record a task result for an agent
    pub async fn record_task(
        &mut self,
        agent_id: &AccountOwner,
        success: bool,
    ) -> Result<(), String> {
        let mut badge = self
            .badges
            .get(agent_id)
            .await
            .map_err(|e| e.to_string())?
            .ok_or("Agent not found")?;
        
        if success {
            badge.tasks_completed += 1;
            // Small reputation boost for successful tasks
            badge.reputation_score = badge.reputation_score.saturating_add(1).min(1000);
        } else {
            badge.tasks_failed += 1;
            // Small reputation penalty for failed tasks
            badge.reputation_score = badge.reputation_score.saturating_sub(2);
        }
        
        badge.update_tier();
        self.badges.insert(agent_id, badge).map_err(|e| e.to_string())?;
        
        let current = self.total_logs_processed.get();
        self.total_logs_processed.set(current + 1);
        
        Ok(())
    }

    /// Flag an agent for spam
    pub async fn flag_spam(&mut self, agent_id: &AccountOwner) -> Result<u8, String> {
        let mut badge = self
            .badges
            .get(agent_id)
            .await
            .map_err(|e| e.to_string())?
            .ok_or("Agent not found")?;
        
        badge.spam_flags = badge.spam_flags.saturating_add(1);
        
        // Heavy reputation penalty for spam flags
        badge.reputation_score = badge.reputation_score.saturating_sub(50);
        badge.update_tier();
        
        let flags = badge.spam_flags;
        self.badges.insert(agent_id, badge).map_err(|e| e.to_string())?;
        
        Ok(flags)
    }

    // === Economic State Methods ===

    /// Increase an agent's stake balance
    pub async fn stake_tokens(&mut self, agent_id: &AccountOwner, amount: Amount) -> Result<Amount, String> {
        let mut badge = self.badges.get(agent_id).await.map_err(|e| e.to_string())?.ok_or("Agent not found")?;
        
        badge.stake_balance = badge.stake_balance.saturating_add(amount);
        
        let new_balance = badge.stake_balance;
        self.badges.insert(agent_id, badge).map_err(|e| e.to_string())?;
        
        Ok(new_balance)
    }

    /// Decrease an agent's stake balance (Unstake or Slash)
    pub async fn unstake_tokens(&mut self, agent_id: &AccountOwner, amount: Amount) -> Result<Amount, String> {
        let mut badge = self.badges.get(agent_id).await.map_err(|e| e.to_string())?.ok_or("Agent not found")?;
        
        if badge.stake_balance < amount {
            return Err("Insufficient stake balance".to_string());
        }
        
        badge.stake_balance = badge.stake_balance.saturating_sub(amount);
        
        let remaining = badge.stake_balance;
        self.badges.insert(agent_id, badge).map_err(|e| e.to_string())?;
        
        Ok(remaining)
    }

    /// Set subscription cost for an agent
    pub async fn set_subscription_cost(&mut self, agent_id: &AccountOwner, cost: Amount) -> Result<(), String> {
        let mut badge = self.badges.get(agent_id).await.map_err(|e| e.to_string())?.ok_or("Agent not found")?;
        
        badge.subscription_cost = cost;
        
        self.badges.insert(agent_id, badge).map_err(|e| e.to_string())?;
        Ok(())
    }

    /// Check if subscription payment is sufficient
    pub async fn get_subscription_cost(&self, agent_id: &AccountOwner) -> Result<Amount, String> {
         let badge = self.badges.get(agent_id).await.map_err(|e| e.to_string())?.ok_or("Agent not found")?;
         Ok(badge.subscription_cost)
    }
}
