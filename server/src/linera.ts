import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
export async function provisionChain(): Promise<ChainProvisionResult> {
    try {
        // Check if linera CLI is available
        const { stdout, stderr } = await execAsync('linera open-chain 2>&1');

        // Parse the chain ID from output
        // Format: "New chain: <chain_id>"
        const lines = stdout.trim().split('\n');
        const chainLine = lines.find(l => l.includes('Chain') || l.match(/^[a-f0-9]{64}/i));

        if (chainLine) {
            // Extract chain ID (64 hex characters)
            const match = chainLine.match(/[a-f0-9]{64}/i);
            if (match) {
                return { success: true, chainId: match[0] };
            }
        }

        // If we couldn't parse, return the raw output for debugging
        return {
            success: false,
            error: `Could not parse chain ID from output: ${stdout || stderr}`
        };
    } catch (err: any) {
        // Check if it's a "command not found" error
        if (err.message?.includes('command not found') || err.message?.includes('not recognized')) {
            return {
                success: false,
                error: 'Linera CLI not installed. Please install with: cargo install linera-service'
            };
        }

        return {
            success: false,
            error: err.message || 'Failed to provision chain'
        };
    }
}

/**
 * Mock chain provisioning for development without Linera installed
 */
export function mockProvisionChain(): ChainProvisionResult {
    const mockChainId = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
    ).join('');

    return { success: true, chainId: mockChainId };
}
