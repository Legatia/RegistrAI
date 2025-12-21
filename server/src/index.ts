import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { setupPassport } from './auth.js';
import { updateUserChain } from './db.js';
import { provisionChain, mockProvisionChain } from './linera.js';
import agentRoutes from './routes/agents.js';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
}));

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Passport
setupPassport();
app.use(passport.initialize());
app.use(passport.session());

// Mount Agent Routes
app.use('/api/agents', agentRoutes);

// Auth Routes
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login?error=auth_failed` }),
    (req, res) => {
        res.redirect(`${FRONTEND_URL}/dashboard`);
    }
);

app.get('/auth/logout', (req, res) => {
    req.logout(() => {
        res.redirect(FRONTEND_URL);
    });
});

// API Routes
app.get('/api/me', (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    res.json({
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        picture: req.user.picture,
        chainId: req.user.chain_id,
    });
});

app.post('/api/provision-chain', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    if (req.user.chain_id) {
        return res.status(400).json({
            error: 'Chain already provisioned',
            chainId: req.user.chain_id
        });
    }

    // Use mock provisioning in development if Linera isn't installed
    const useMock = process.env.USE_MOCK_LINERA === 'true';
    const result = useMock ? mockProvisionChain() : await provisionChain();

    if (!result.success) {
        return res.status(500).json({ error: result.error });
    }

    // Save chain ID to user
    updateUserChain(req.user.id, result.chainId!);

    res.json({
        success: true,
        chainId: result.chainId
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 RegistrAI Server running on http://localhost:${PORT}`);
    console.log(`📍 Frontend URL: ${FRONTEND_URL}`);
    console.log(`🔐 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'NOT CONFIGURED'}`);
});
