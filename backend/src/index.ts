import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock users data
const users = {
    'rudysetiawan111@gmail.com': {
        id: '1',
        name: 'Rudy Setiawan',
        email: 'rudysetiawan111@gmail.com',
        password: '@Rs101185',
        role: 'admin',
        plan: 'premium',
        avatar: 'https://via.placeholder.com/40'
    },
    'marga.jaya.bird.shop@gmail.com': {
        id: '2',
        name: 'Marga Jaya',
        email: 'marga.jaya.bird.shop@gmail.com',
        password: '@Rs101185',
        role: 'user',
        plan: 'pro',
        avatar: 'https://via.placeholder.com/40'
    },
    'autolive1.0.0@gmail.com': {
        id: '3',
        name: 'Auto Live',
        email: 'autolive1.0.0@gmail.com',
        password: '@Rs101185',
        role: 'user',
        plan: 'free',
        avatar: 'https://via.placeholder.com/40'
    }
};

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'AutoLive API is running', status: 'healthy' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    const user = users[email];
    
    if (user && user.password === password) {
        // Generate mock token
        const token = Buffer.from(JSON.stringify({ 
            id: user.id, 
            email: user.email, 
            role: user.role,
            exp: Date.now() + 7 * 24 * 60 * 60 * 1000 
        })).toString('base64');
        
        res.json({
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                plan: user.plan,
                avatar: user.avatar
            }
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
        const user = {
            id: 'social_' + Date.now(),
            name: `${provider} User`,
            email: email || `${provider.toLowerCase()}_user@example.com`,
            role: 'user',
            plan: 'free',
            avatar: 'https://via.placeholder.com/40'
        };
        
        const token = Buffer.from(JSON.stringify({ 
            id: user.id, 
            email: user.email, 
            role: user.role,
            exp: Date.now() + 7 * 24 * 60 * 60 * 1000 
        })).toString('base64');
        
        res.json({
            message: 'API key verified',
            token: token,
            user: user
        });
    } else {
        res.status(400).json({ message: 'Invalid API key. Must be at least 10 characters.' });
    }
});

// Users endpoint (admin only)
app.get('/api/users', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        
        if (decoded.role === 'admin') {
            const userList = Object.values(users).map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                plan: u.plan,
                avatar: u.avatar
            }));
            res.json({ users: userList });
        } else {
            res.status(403).json({ message: 'Forbidden' });
        }
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Profile endpoint
app.get('/api/auth/profile', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        const user = Object.values(users).find(u => u.id === decoded.id);
        
        if (user) {
            res.json({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    plan: user.plan,
                    avatar: user.avatar
                }
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Dashboard stats endpoint
app.get('/api/admin/stats', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        
        if (decoded.role === 'admin') {
            res.json({
                stats: {
                    totalUsers: Object.keys(users).length,
                    activeSessions: 5,
                    apiCallsToday: 1234,
                    totalVideos: 567,
                    totalWorkflows: 89,
                    storageUsed: '2.3 GB',
                    revenue: '$1,234',
                    growth: '+12%'
                }
            });
        } else {
            res.status(403).json({ message: 'Forbidden' });
        }
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// User dashboard stats
app.get('/api/user/stats', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        const user = Object.values(users).find(u => u.id === decoded.id);
        
        if (user) {
            res.json({
                stats: {
                    videosProcessed: 42,
                    activeChannels: user.plan === 'premium' ? 5 : user.plan === 'pro' ? 3 : 1,
                    apiCallsThisMonth: 856,
                    storageUsed: '0.5 GB',
                    totalWorkflows: user.plan === 'premium' ? 10 : user.plan === 'pro' ? 5 : 2,
                    viralScore: 85,
                    engagement: '+23%'
                },
                recentVideos: [
                    { id: 1, title: 'Viral Video 1', views: '1.2M', status: 'completed' },
                    { id: 2, title: 'Viral Video 2', views: '856K', status: 'processing' },
                    { id: 3, title: 'Viral Video 3', views: '432K', status: 'scheduled' }
                ],
                channels: [
                    { id: 1, name: 'YouTube Channel', subscribers: '10.2K', status: 'active' },
                    { id: 2, name: 'TikTok Account', followers: '25.5K', status: 'active' }
                ]
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Backend server running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
});
