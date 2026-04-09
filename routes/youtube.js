const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const router = express.Router();

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI;
const SCOPES = process.env.YOUTUBE_SCOPES;

// Halaman integrasi
router.get('/integrate', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const user = req.session.user;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${querystring.stringify({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: SCOPES,
        access_type: 'offline',
        prompt: 'consent'
    })}`;
    res.render('youtube-integrate', { 
        user, 
        authUrl,
        youtubeConnected: user.youtube_connected || false,
        channelId: user.channel_id || null,
        tokenExpiry: user.youtube_token_expiry || null
    });
});

// Mulai OAuth flow
router.get('/auth', (req, res) => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${querystring.stringify({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: SCOPES,
        access_type: 'offline',
        prompt: 'consent'
    })}`;
    res.redirect(authUrl);
});

// Callback OAuth
router.get('/callback', async (req, res) => {
    const { code, error } = req.query;
    if (error || !code) {
        return res.redirect('/youtube/integrate?error=oauth_failed');
    }
    try {
        // Tukar code dengan access_token
        const tokenRes = await axios.post('https://oauth2.googleapis.com/token', querystring.stringify({
            code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code'
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        
        const { access_token, refresh_token, expires_in } = tokenRes.data;
        
        // Ambil channel info dari YouTube API
        const channelRes = await axios.get('https://www.googleapis.com/youtube/v3/channels?part=id&mine=true', {
            headers: { Authorization: `Bearer ${access_token}` }
        });
        const channelId = channelRes.data.items[0]?.id;
        
        if (!channelId) {
            throw new Error('No channel found for this account');
        }
        
        // Simpan ke database
        const user = req.session.user;
        const userIndex = req.db.data.users.findIndex(u => u.id === user.id);
        req.db.data.users[userIndex].youtube_connected = true;
        req.db.data.users[userIndex].channel_id = channelId;
        req.db.data.users[userIndex].youtube_access_token = access_token;
        req.db.data.users[userIndex].youtube_refresh_token = refresh_token;
        req.db.data.users[userIndex].youtube_token_expiry = new Date(Date.now() + expires_in * 1000).toISOString();
        await req.db.write();
        req.session.user = req.db.data.users[userIndex];
        
        res.redirect('/youtube/integrate?success=connected');
    } catch (err) {
        console.error('OAuth error:', err.message);
        res.redirect('/youtube/integrate?error=token_exchange_failed');
    }
});

// Refresh token (otomatis dipanggil sebelum upload)
async function refreshAccessToken(userId, db) {
    const user = db.data.users.find(u => u.id === userId);
    if (!user || !user.youtube_refresh_token) return null;
    try {
        const res = await axios.post('https://oauth2.googleapis.com/token', querystring.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: user.youtube_refresh_token,
            grant_type: 'refresh_token'
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        
        const { access_token, expires_in } = res.data;
        const userIndex = db.data.users.findIndex(u => u.id === userId);
        db.data.users[userIndex].youtube_access_token = access_token;
        db.data.users[userIndex].youtube_token_expiry = new Date(Date.now() + expires_in * 1000).toISOString();
        await db.write();
        return access_token;
    } catch (err) {
        return null;
    }
}

// Putuskan koneksi
router.post('/disconnect', async (req, res) => {
    const user = req.session.user;
    const userIndex = req.db.data.users.findIndex(u => u.id === user.id);
    req.db.data.users[userIndex].youtube_connected = false;
    req.db.data.users[userIndex].channel_id = null;
    req.db.data.users[userIndex].youtube_access_token = null;
    req.db.data.users[userIndex].youtube_refresh_token = null;
    req.db.data.users[userIndex].youtube_token_expiry = null;
    await req.db.write();
    req.session.user = req.db.data.users[userIndex];
    res.redirect('/youtube/integrate');
});

// Endpoint untuk cek token (debug)
router.get('/check-token', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
    const user = req.session.user;
    if (!user.youtube_access_token) return res.json({ valid: false });
    try {
        await axios.get('https://www.googleapis.com/youtube/v3/channels?part=id&mine=true', {
            headers: { Authorization: `Bearer ${user.youtube_access_token}` }
        });
        res.json({ valid: true });
    } catch (err) {
        if (err.response?.status === 401) {
            const newToken = await refreshAccessToken(user.id, req.db);
            if (newToken) return res.json({ valid: true, refreshed: true });
        }
        res.json({ valid: false });
    }
});

module.exports = { router, refreshAccessToken };
