import { GraphQLClient } from 'graphql-request';

// Placeholder for now
export const client = new GraphQLClient('http://localhost:8080');

export const fetchStats = async () => {
    // Mock data
    return {
        agents: 2405,
        executions: "1.2M+",
        volume: "$14.8M"
    };
}
