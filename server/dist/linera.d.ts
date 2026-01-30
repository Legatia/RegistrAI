export interface ChainProvisionResult {
    success: boolean;
    chainId?: string;
    error?: string;
}
/**
 * Provisions a new Linera microchain for a user on Testnet Conway.
 * This calls `linera wallet request-chain` with the faucet.
 *
 * In production, you'd want to:
 * - Use a dedicated service account wallet
 * - Handle gas/fees properly
 * - Add proper error handling and retries
 */
export declare function provisionChain(): Promise<ChainProvisionResult>;
/**
 * Mock chain provisioning for development without Linera installed
 */
export declare function mockProvisionChain(): ChainProvisionResult;
