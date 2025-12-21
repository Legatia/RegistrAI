declare global {
    namespace Express {
        interface User {
            id: number;
            google_id: string;
            email: string;
            name: string | null;
            picture: string | null;
            chain_id: string | null;
        }
    }
}
export declare function setupPassport(): void;
