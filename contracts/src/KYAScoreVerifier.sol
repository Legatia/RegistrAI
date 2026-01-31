// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title KYAScoreVerifier
 * @notice Verifies and caches KYA (Know Your Agent) reputation scores from Linera
 * @dev Uses ECDSA signatures from the RegistrAI oracle to verify scores on-chain
 */
contract KYAScoreVerifier is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    /// @notice Cached agent score data
    struct AgentScore {
        uint16 score; // 0-1000 reputation score
        uint8 tier; // 0=Unverified, 1=Verified, 2=Gold, 3=Platinum
        uint64 timestamp; // When score was recorded
        uint64 expiresAt; // When this cache entry expires
    }

    /// @notice Tier enumeration for clarity
    enum Tier {
        Unverified,
        Verified,
        Gold,
        Platinum
    }

    /// @notice Oracle signer address (RegistrAI server)
    address public oracleSigner;

    /// @notice Default cache TTL (1 hour)
    uint256 public constant DEFAULT_CACHE_TTL = 1 hours;

    /// @notice Minimum score threshold for "trusted" agents
    uint16 public constant TRUSTED_THRESHOLD = 500;

    /// @notice Cached scores: keccak256(agentId) => AgentScore
    mapping(bytes32 => AgentScore) public scores;

    /// @notice Total number of verified agents (for stats)
    uint256 public totalVerifiedAgents;

    // ============================================================================
    // Events
    // ============================================================================

    event ScoreUpdated(
        bytes32 indexed agentIdHash,
        string agentId,
        uint16 score,
        uint8 tier,
        uint64 expiresAt
    );

    event OracleSignerUpdated(
        address indexed oldSigner,
        address indexed newSigner
    );

    // ============================================================================
    // Errors
    // ============================================================================

    error InvalidSignature();
    error CommitmentExpired();
    error ZeroAddress();

    // ============================================================================
    // Constructor
    // ============================================================================

    constructor(address _oracleSigner) Ownable(msg.sender) {
        if (_oracleSigner == address(0)) revert ZeroAddress();
        oracleSigner = _oracleSigner;
    }

    // ============================================================================
    // External Functions
    // ============================================================================

    /**
     * @notice Update an agent's cached score with a signed commitment
     * @param agentId The unique identifier of the agent (UUID or hex string)
     * @param score The reputation score (0-1000)
     * @param tier The reputation tier (0-3)
     * @param timestamp When the score was recorded (unix seconds)
     * @param expiresAt When this commitment expires (unix seconds)
     * @param signature ECDSA signature from the oracle
     */
    function updateScore(
        string calldata agentId,
        uint16 score,
        uint8 tier,
        uint64 timestamp,
        uint64 expiresAt,
        bytes calldata signature
    ) external {
        // Check expiry
        if (expiresAt <= block.timestamp) revert CommitmentExpired();

        // Verify signature
        bytes32 messageHash = keccak256(
            abi.encodePacked(agentId, score, tier, timestamp, expiresAt)
        );
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address recovered = ethSignedHash.recover(signature);

        if (recovered != oracleSigner) revert InvalidSignature();

        // Store the score
        bytes32 agentIdHash = keccak256(bytes(agentId));

        // Track new agents
        if (scores[agentIdHash].timestamp == 0) {
            totalVerifiedAgents++;
        }

        scores[agentIdHash] = AgentScore({
            score: score,
            tier: tier,
            timestamp: timestamp,
            expiresAt: expiresAt
        });

        emit ScoreUpdated(agentIdHash, agentId, score, tier, expiresAt);
    }

    /**
     * @notice Get an agent's cached score
     * @param agentId The unique identifier of the agent
     * @return score The reputation score
     * @return tier The reputation tier
     * @return valid Whether the cached score is still valid (not expired)
     */
    function getScore(
        string calldata agentId
    ) external view returns (uint16 score, uint8 tier, bool valid) {
        bytes32 agentIdHash = keccak256(bytes(agentId));
        AgentScore memory cached = scores[agentIdHash];

        valid = cached.expiresAt > block.timestamp;
        return (cached.score, cached.tier, valid);
    }

    /**
     * @notice Check if an agent meets the trusted threshold
     * @param agentId The unique identifier of the agent
     * @return trusted Whether the agent has score >= 500 and valid cache
     */
    function isTrusted(
        string calldata agentId
    ) external view returns (bool trusted) {
        bytes32 agentIdHash = keccak256(bytes(agentId));
        AgentScore memory cached = scores[agentIdHash];

        return
            cached.expiresAt > block.timestamp &&
            cached.score >= TRUSTED_THRESHOLD;
    }

    /**
     * @notice Get the full cached data for an agent
     * @param agentId The unique identifier of the agent
     * @return The full AgentScore struct
     */
    function getFullScore(
        string calldata agentId
    ) external view returns (AgentScore memory) {
        bytes32 agentIdHash = keccak256(bytes(agentId));
        return scores[agentIdHash];
    }

    // ============================================================================
    // Admin Functions
    // ============================================================================

    /**
     * @notice Update the oracle signer address
     * @param _signer New oracle signer address
     */
    function setOracleSigner(address _signer) external onlyOwner {
        if (_signer == address(0)) revert ZeroAddress();
        address oldSigner = oracleSigner;
        oracleSigner = _signer;
        emit OracleSignerUpdated(oldSigner, _signer);
    }
}
