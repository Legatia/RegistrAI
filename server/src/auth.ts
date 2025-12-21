import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { findOrCreateUser, getUserById, User } from './db.js';

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

export function setupPassport() {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID || '',
                clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
                callbackURL: '/auth/google/callback',
            },
            async (_accessToken, _refreshToken, profile: Profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value || '';
                    const user = findOrCreateUser({
                        id: profile.id,
                        email,
                        name: profile.displayName,
                        picture: profile.photos?.[0]?.value,
                    });
                    done(null, user);
                } catch (err) {
                    done(err as Error);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id: number, done) => {
        const user = getUserById(id);
        done(null, user || null);
    });
}
