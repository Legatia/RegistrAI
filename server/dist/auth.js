import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { findOrCreateUser, getUserById } from './db.js';
export function setupPassport() {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: '/auth/google/callback',
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value || '';
            const user = findOrCreateUser({
                id: profile.id,
                email,
                name: profile.displayName,
                picture: profile.photos?.[0]?.value,
            });
            done(null, user);
        }
        catch (err) {
            done(err);
        }
    }));
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        const user = getUserById(id);
        done(null, user || null);
    });
}
