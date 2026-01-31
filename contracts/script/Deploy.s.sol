// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/KYAScoreVerifier.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address oracleSigner = vm.envAddress("ORACLE_SIGNER_ADDRESS");

        console.log("Deploying KYAScoreVerifier...");
        console.log("Oracle signer:", oracleSigner);

        vm.startBroadcast(deployerPrivateKey);

        KYAScoreVerifier verifier = new KYAScoreVerifier(oracleSigner);

        vm.stopBroadcast();

        console.log("KYAScoreVerifier deployed to:", address(verifier));
        console.log("");
        console.log("Add to your .env:");
        console.log("KYA_VERIFIER_ADDRESS=", address(verifier));
    }
}
