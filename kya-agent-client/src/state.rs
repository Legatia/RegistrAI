//! KYA Agent Client State - Local task logging with linera-views

use kya_agent_client::TaskEntry;
use linera_sdk::linera_base_types::ChainId;
use linera_sdk::views::{linera_views, LogView, RegisterView, RootView, ViewStorageContext};

/// The root state of the KYA Agent Client application
#[derive(RootView, async_graphql::SimpleObject)]
#[view(context = ViewStorageContext)]
pub struct AgentClientState {
    /// The chain ID of the KYA Registry hub
    pub registry_chain_id: RegisterView<Option<ChainId>>,
    /// Log of all tasks performed by this agent
    pub task_log: LogView<TaskEntry>,
    /// Total number of tasks logged
    pub task_count: RegisterView<u64>,
    /// Number of successful tasks
    pub success_count: RegisterView<u64>,
    /// Number of failed tasks
    pub failure_count: RegisterView<u64>,
}

impl AgentClientState {
    /// Initialize with a registry chain ID
    pub fn initialize(&mut self, registry_chain_id: ChainId) {
        self.registry_chain_id.set(Some(registry_chain_id));
    }

    /// Get the registry chain ID
    pub fn get_registry(&self) -> Option<ChainId> {
        *self.registry_chain_id.get()
    }

    /// Log a new task
    pub async fn log_task(&mut self, entry: TaskEntry) -> Result<(), String> {
        // Update counters
        let count = self.task_count.get();
        self.task_count.set(count + 1);

        if entry.success {
            let success = self.success_count.get();
            self.success_count.set(success + 1);
        } else {
            let failure = self.failure_count.get();
            self.failure_count.set(failure + 1);
        }

        // Append to log
        self.task_log.push(entry);

        Ok(())
    }

    /// Get task statistics
    pub fn get_stats(&self) -> (u64, u64, u64) {
        (
            *self.task_count.get(),
            *self.success_count.get(),
            *self.failure_count.get(),
        )
    }
}
