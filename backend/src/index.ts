/**
 * AutoLive Automation Backend
 * Main application entry point
 */

import express from 'express';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'AutoLive API is running' });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

export default app;
