import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 5001;

// Cek apakah folder frontend ada
const frontendPath = path.join(__dirname, '../../frontend');
console.log(`Looking for frontend at: ${frontendPath}`);

if (!fs.existsSync(frontendPath)) {
    console.error(`❌ Frontend folder not found at: ${frontendPath}`);
    console.log('Creating frontend folder structure...');
    
    // Buat folder frontend jika belum ada
    fs.mkdirSync(frontendPath, { recursive: true });
    fs.mkdirSync(path.join(frontendPath, 'css'), { recursive: true });
    fs.mkdirSync(path.join(frontendPath, 'js'), { recursive: true });
    fs.mkdirSync(path.join(frontendPath, 'auth'), { recursive: true });
    fs.mkdirSync(path.join(frontendPath, 'admin'), { recursive: true });
    fs.mkdirSync(path.join(frontendPath, 'user'), { recursive: true });
    
    console.log('✅ Frontend folders created');
}

// Serve static files
app.use(express.static(frontendPath));

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'login.html'));
});

// Login page
app.get('/login.html', (req, res) => {
    const loginPath = path.join(frontendPath, 'login.html');
    if (fs.existsSync(loginPath)) {
        res.sendFile(loginPath);
    } else {
        res.status(404).send('Login page not found. Please create frontend/login.html');
    }
});

// Fallback for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'login.html'));
});

app.listen(PORT, () => {
    console.log(`✅ Frontend server running on http://localhost:${PORT}`);
    console.log(`   Serving files from: ${frontendPath}`);
    console.log(`   Login page: http://localhost:${PORT}/login.html`);
    
    // List available files
    if (fs.existsSync(frontendPath)) {
        const files = fs.readdirSync(frontendPath);
        console.log(`   Available files: ${files.join(', ')}`);
    }
});
