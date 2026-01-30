import { GraphQLClient } from 'graphql-request';

// Use environment variable for testnet endpoint, fallback to localhost for dev
const LINERA_ENDPOINT = import.meta.env.VITE_LINERA_ENDPOINT || 'http://localhost:8080';

export const client = new GraphQLClient(LINERA_ENDPOINT);

export const fetchStats = async () => {
    try {
        // Query real stats from the registry contract
        const query = `
            query {
                registryStats {
                    totalAgents
                    totalExecutions
                }
            }
        `;
        const data = await client.request<{
            registryStats?: { totalAgents: number; totalExecutions: number };
        }>(query);
        return {
            agents: data.registryStats?.totalAgents || 0,
            executions: String(data.registryStats?.totalExecutions || 0),
            volume: "$0" // Calculated separately
        };
    } catch {
        // Return zeros if not connected
        return { agents: 0, executions: "0", volume: "$0" };
    }
};
