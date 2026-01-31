// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/KYAScoreVerifier.sol";

contract KYAScoreVerifierTest is Test {
    KYAScoreVerifier public verifier;

    uint256 internal oraclePrivateKey = 0xA11CE;
    address internal oracleSigner;
    address internal owner = address(this);

    string constant AGENT_ID = "test-agent-123";
    uint16 constant SCORE = 750;
    uint8 constant TIER = 2; // Gold

    function setUp() public {
        oracleSigner = vm.addr(oraclePrivateKey);
        verifier = new KYAScoreVerifier(oracleSigner);
    }

    function _signCommitment(
        string memory agentId,
        uint16 score,
        uint8 tier,
        uint64 timestamp,
        uint64 expiresAt
    ) internal view returns (bytes memory) {
        bytes32 messageHash = keccak256(
            abi.encodePacked(agentId, score, tier, timestamp, expiresAt)
        );
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(
            messageHash
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            oraclePrivateKey,
            ethSignedHash
        );
        return abi.encodePacked(r, s, v);
    }

    function test_UpdateScore() public {
        uint64 timestamp = uint64(block.timestamp);
        uint64 expiresAt = uint64(block.timestamp + 1 hours);

        bytes memory signature = _signCommitment(
            AGENT_ID,
            SCORE,
            TIER,
            timestamp,
            expiresAt
        );

        verifier.updateScore(
            AGENT_ID,
            SCORE,
            TIER,
            timestamp,
            expiresAt,
            signature
        );

        (uint16 score, uint8 tier, bool valid) = verifier.getScore(AGENT_ID);

        assertEq(score, SCORE);
        assertEq(tier, TIER);
        assertTrue(valid);
        assertEq(verifier.totalVerifiedAgents(), 1);
    }

    function test_GetScore_Expired() public {
        uint64 timestamp = uint64(block.timestamp);
        uint64 expiresAt = uint64(block.timestamp + 1 hours);

        bytes memory signature = _signCommitment(
            AGENT_ID,
            SCORE,
            TIER,
            timestamp,
            expiresAt
        );
        verifier.updateScore(
            AGENT_ID,
            SCORE,
            TIER,
            timestamp,
            expiresAt,
            signature
        );

        // Warp past expiry
        vm.warp(block.timestamp + 2 hours);

        (uint16 score, uint8 tier, bool valid) = verifier.getScore(AGENT_ID);

        assertEq(score, SCORE);
        assertEq(tier, TIER);
        assertFalse(valid); // Should be invalid after expiry
    }

    function test_IsTrusted() public {
        uint64 timestamp = uint64(block.timestamp);
        uint64 expiresAt = uint64(block.timestamp + 1 hours);

        bytes memory signature = _signCommitment(
            AGENT_ID,
            SCORE,
            TIER,
            timestamp,
            expiresAt
        );
        verifier.updateScore(
            AGENT_ID,
            SCORE,
            TIER,
            timestamp,
            expiresAt,
            signature
        );

        assertTrue(verifier.isTrusted(AGENT_ID)); // 750 >= 500
    }

    function test_IsTrusted_LowScore() public {
        uint64 timestamp = uint64(block.timestamp);
        uint64 expiresAt = uint64(block.timestamp + 1 hours);
        uint16 lowScore = 200;

        bytes memory signature = _signCommitment(
            AGENT_ID,
            lowScore,
            0,
            timestamp,
            expiresAt
        );
        verifier.updateScore(
            AGENT_ID,
            lowScore,
            0,
            timestamp,
            expiresAt,
            signature
        );

        assertFalse(verifier.isTrusted(AGENT_ID)); // 200 < 500
    }

    function test_RevertIf_InvalidSignature() public {
        uint64 timestamp = uint64(block.timestamp);
        uint64 expiresAt = uint64(block.timestamp + 1 hours);

        // Sign with different key
        uint256 wrongKey = 0xBAD;
        bytes32 messageHash = keccak256(
            abi.encodePacked(AGENT_ID, SCORE, TIER, timestamp, expiresAt)
        );
        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(
            messageHash
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(wrongKey, ethSignedHash);
        bytes memory badSignature = abi.encodePacked(r, s, v);

        vm.expectRevert(KYAScoreVerifier.InvalidSignature.selector);
        verifier.updateScore(
            AGENT_ID,
            SCORE,
            TIER,
            timestamp,
            expiresAt,
            badSignature
        );
    }

    function test_RevertIf_CommitmentExpired() public {
        uint64 timestamp = uint64(block.timestamp);
        uint64 expiresAt = uint64(block.timestamp - 1); // Already expired

        bytes memory signature = _signCommitment(
            AGENT_ID,
            SCORE,
            TIER,
            timestamp,
            expiresAt
        );

        vm.expectRevert(KYAScoreVerifier.CommitmentExpired.selector);
        verifier.updateScore(
            AGENT_ID,
            SCORE,
            TIER,
            timestamp,
            expiresAt,
            signature
        );
    }

    function test_SetOracleSigner() public {
        address newSigner = address(0x123);
        verifier.setOracleSigner(newSigner);
        assertEq(verifier.oracleSigner(), newSigner);
    }

    function test_RevertIf_SetOracleSigner_ZeroAddress() public {
        vm.expectRevert(KYAScoreVerifier.ZeroAddress.selector);
        verifier.setOracleSigner(address(0));
    }
}
