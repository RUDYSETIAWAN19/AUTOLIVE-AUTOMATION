import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'AutoLive API is running', status: 'healthy' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes (mock untuk sementara)
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    // Mock users
    const users = {
        'rudysetiawan111@gmail.com': {
            id: '1',
            name: 'Rudy Setiawan',
            email: 'rudysetiawan111@gmail.com',
            role: 'admin',
            plan: 'premium'
        },
        'marga.jaya.bird.shop@gmail.com': {
            id: '2',
            name: 'Marga Jaya',
            email: 'marga.jaya.bird.shop@gmail.com',
            role: 'user',
            plan: 'pro'
        },
        'autolive1.0.0@gmail.com': {
            id: '3',
            name: 'Auto Live',
            email: 'autolive1.0.0@gmail.com',
            role: 'user',
            plan: 'free'
        }
    };
    
    const user = users[email];
    
    if (user && password === '@Rs101185') {
        res.json({
            message: 'Login successful',
            token: 'mock-jwt-token-' + Date.now(),
            user: user
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
});

// Verify API key endpoint
app.post('/api/auth/verify-api-key', (req, res) => {
    const { email, provider, apiKey } = req.body;
    
    // Mock API key validation
    if (apiKey && apiKey.length >= 10) {
        res.json({
            message: 'API key verified',
            token: 'mock-jwt-token-' + Date.now(),
            user: {
                id: 'social_' + Date.now(),
                name: email?.split('@')[0] || 'User',
                email: email,
                role: 'user',
                plan: 'free'
            }
        });
    } else {
        res.status(400).json({ message: 'Invalid API key' });
    }
});

// Users endpoint
app.get('/api/users', (req, res) => {
    const users = [
        { id: '1', name: 'Rudy Setiawan', email: 'rudysetiawan111@gmail.com', role: 'admin', plan: 'premium' },
        { id: '2', name: 'Marga Jaya', email: 'marga.jaya.bird.shop@gmail.com', role: 'user', plan: 'pro' },
        { id: '3', name: 'Auto Live', email: 'autolive1.0.0@gmail.com', role: 'user', plan: 'free' }
    ];
    res.json({ users });
});

// Profile endpoint
app.get('/api/auth/profile', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        res.json({
            user: {
                id: '1',
                name: 'Rudy Setiawan',
                email: 'rudysetiawan111@gmail.com',
                role: 'admin',
                plan: 'premium'
            }
        });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Backend server running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
});
