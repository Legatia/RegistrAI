# KYA Registry Contracts

Solidity smart contracts for exporting KYA reputation scores to EVM chains (Base, Ethereum).

## Overview

The `KYAScoreVerifier` contract allows DeFi protocols to verify agent reputation scores on-chain. Scores are signed by the RegistrAI oracle and cached with a 1-hour TTL.

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Base Sepolia ETH (for deployment)

## Installation

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install dependencies
cd contracts
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge install foundry-rs/forge-std --no-commit
```

## Testing

```bash
forge test -vvv
```

## Deployment

1. Copy `.env.example` to `.env` and fill in values
2. Deploy:

```bash
source .env
forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify
```

## Usage (for DeFi Protocols)

```solidity
interface IKYAScoreVerifier {
    function getScore(string calldata agentId) external view returns (
        uint16 score, uint8 tier, bool valid
    );
    function isTrusted(string calldata agentId) external view returns (bool);
}

// In your DeFi contract
function allowAgent(string calldata agentId) external view returns (bool) {
    IKYAScoreVerifier verifier = IKYAScoreVerifier(KYA_VERIFIER_ADDRESS);
    return verifier.isTrusted(agentId); // Returns true if score >= 500
}
```
