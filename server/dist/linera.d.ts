export interface ChainProvisionResult {
    success: boolean;
    chainId?: string;
    error?: string;
}
/**
 * Provisions a new Linera microchain for a user.
 * This calls the `linera open-chain` command.
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
