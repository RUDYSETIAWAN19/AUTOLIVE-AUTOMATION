const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = req.db.data.users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.render('login', { error: res.locals.t('loginFailed') });
    }
    req.session.user = user;
    res.redirect('/dashboard');
});

router.get('/register', (req, res) => {
    res.render('register', { error: null });
});

router.post('/register', express.json(), async (req, res) => {
    const { name, email, password, package: selectedPackage } = req.body;
    // Cek apakah email sudah terdaftar
    const existingUser = req.db.data.users.find(u => u.email === email);
    if (existingUser) {
        return res.json({ error: res.locals.t('emailExists') });
    }
    // Validasi password
    if (!name || !email || !password) {
        return res.json({ error: res.locals.t('fillAllFields') });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Tentukan durasi dan role
    let trialDays = 0;
    let role = 'user';
    let price = 0;
    if (selectedPackage === 'free') {
        trialDays = 7;
        price = 0;
    } else if (selectedPackage === 'pro') {
        trialDays = 14;
        price = 100000;
    } else if (selectedPackage === 'premium') {
        trialDays = 30;
        price = 180000;
    } else {
        return res.json({ error: 'Invalid package' });
    }

    // Jika paket berbayar, simpan session sementara lalu redirect ke payment
    if (selectedPackage !== 'free') {
        req.session.tempRegister = { name, email, password: hashedPassword, package: selectedPackage, days: trialDays, price };
        return res.json({ redirect: `/payment?register=1&package=${selectedPackage}&price=${price}` });
    }

    // Paket FREE: langsung buat akun
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + trialDays);
    const newUser = {
        id: Date.now().toString(),
        email,
        password: hashedPassword,
        name,
        role,
        trial_expired: expiry.toISOString(),
        created_at: new Date().toISOString(),
        channel_id: null,
        youtube_connected: false,
        package: selectedPackage,
        last_package: selectedPackage
    };
    req.db.data.users.push(newUser);
    await req.db.write();
    req.session.user = newUser;
    res.json({ redirect: '/dashboard' });
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;
