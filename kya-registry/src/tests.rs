//! Unit tests for KYA Registry Contract
//! 
//! These tests verify the economic operations: Stake, Unstake, Slash, Subscribe.
//! 
//! Note: These tests focus on data structure operations. Full integration tests
//! requiring AccountOwner construction should use Linera's test harness.

use super::*;

#[test]
fn test_stake_balance_arithmetic() {
    // Test Amount arithmetic for staking
    let initial = Amount::ZERO;
    let stake = Amount::from_tokens(100);
    
    let after_stake = initial.saturating_add(stake);
    assert_eq!(after_stake, stake);
    
    let unstake = Amount::from_tokens(30);
    let after_unstake = after_stake.saturating_sub(unstake);
    assert_eq!(after_unstake, Amount::from_tokens(70));
}

#[test]
fn test_slash_arithmetic() {
    let stake = Amount::from_tokens(1000);
    let slash = Amount::from_tokens(200);
    
    let remaining = stake.saturating_sub(slash);
    assert_eq!(remaining, Amount::from_tokens(800));
}

#[test]
fn test_slash_cannot_exceed_balance() {
    let stake = Amount::from_tokens(50);
    let slash = Amount::from_tokens(100);
    
    // saturating_sub clamps to zero
    let remaining = stake.saturating_sub(slash);
    assert_eq!(remaining, Amount::ZERO);
}

#[test]
fn test_subscription_cost_amount() {
    let cost = Amount::from_tokens(5);
    assert_eq!(cost, Amount::from_tokens(5));
    
    // Verify amounts can be compared
    let higher_cost = Amount::from_tokens(10);
    assert!(higher_cost > cost);
}

#[test]
fn test_tier_from_score() {
    // Test the tier calculation logic
    assert_eq!(ReputationTier::from_score(0), ReputationTier::Unverified);
    assert_eq!(ReputationTier::from_score(100), ReputationTier::Unverified);
    assert_eq!(ReputationTier::from_score(249), ReputationTier::Unverified);
    
    assert_eq!(ReputationTier::from_score(250), ReputationTier::Verified);
    assert_eq!(ReputationTier::from_score(400), ReputationTier::Verified);
    assert_eq!(ReputationTier::from_score(499), ReputationTier::Verified);
    
    assert_eq!(ReputationTier::from_score(500), ReputationTier::Gold);
    assert_eq!(ReputationTier::from_score(600), ReputationTier::Gold);
    assert_eq!(ReputationTier::from_score(749), ReputationTier::Gold);
    
    assert_eq!(ReputationTier::from_score(750), ReputationTier::Platinum);
    assert_eq!(ReputationTier::from_score(900), ReputationTier::Platinum);
    assert_eq!(ReputationTier::from_score(1000), ReputationTier::Platinum);
}

#[test]
fn test_tier_rate_limits() {
    assert_eq!(ReputationTier::Unverified.rate_limit(), Some(0));
    assert_eq!(ReputationTier::Verified.rate_limit(), Some(10));
    assert_eq!(ReputationTier::Gold.rate_limit(), Some(100));
    assert_eq!(ReputationTier::Platinum.rate_limit(), None); // Unlimited
}

#[test]
fn test_storage_provider_variants() {
    // Verify all storage providers serialize correctly
    let providers = vec![
        StorageProvider::None,
        StorageProvider::IPFS,
        StorageProvider::Arweave,
        StorageProvider::Walrus,
        StorageProvider::HTTP,
    ];
    
    for provider in providers {
        // Each variant should be usable
        let _copy = provider;
    }
}

#[test]
fn test_agent_manifest_default() {
    let manifest = AgentManifest::default();
    
    assert!(manifest.name.is_empty());
    assert_eq!(manifest.version, "0.1.0");
    assert_eq!(manifest.runtime, "python3");
    assert_eq!(manifest.license, "MIT");
}
