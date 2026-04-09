const express = require('express');
const bcrypt = require('bcryptjs');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.get('/', (req, res) => {
    if (!req.session.user && !req.session.tempRegister) return res.redirect('/login');
    const isRegister = req.query.register === '1';
    const pkg = req.query.package || (req.session.tempRegister ? req.session.tempRegister.package : null);
    let price = 0;
    if (pkg === 'pro') price = 100000;
    else if (pkg === 'premium') price = 180000;
    res.render('subscription', {
        user: req.session.user,
        packages: [
            { name: 'Pro', price: 100000, days: 14 },
            { name: 'Premium', price: 180000, days: 30 }
        ],
        isRegister,
        selectedPackage: pkg,
        price,
        stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
});

// Endpoint untuk membuat PaymentIntent (client-side menggunakan Stripe Elements)
router.post('/create-payment-intent', express.json(), async (req, res) => {
    const { package: pkg } = req.body;
    let amount = 0;
    if (pkg === 'pro') amount = 100000;
    else if (pkg === 'premium') amount = 180000;
    else return res.status(400).json({ error: 'Invalid package' });

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // dalam cents? Stripe menggunakan unit terkecil mata uang. IDR tidak memiliki subunit, jadi amount dalam Rupiah (integer)
            currency: 'idr',
            metadata: { package: pkg }
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint untuk konfirmasi pembayaran (webhook atau setelah sukses dari frontend)
router.post('/confirm-payment', express.json(), async (req, res) => {
    const { paymentIntentId, package: pkg, method } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ error: 'Pembayaran belum berhasil' });
        }

        // Proses pembayaran sukses - sama seperti logika sebelumnya
        if (req.session.tempRegister) {
            const temp = req.session.tempRegister;
            const expiry = new Date();
            let days = 0;
            if (temp.package === 'pro') days = 14;
            else if (temp.package === 'premium') days = 30;
            expiry.setDate(expiry.getDate() + days);
            const newUser = {
                id: Date.now().toString(),
                email: temp.email,
                password: temp.password,
                name: temp.name,
                role: 'user',
                trial_expired: expiry.toISOString(),
                created_at: new Date().toISOString(),
                channel_id: null,
                youtube_connected: false,
                package: temp.package,
                last_package: temp.package
            };
            req.db.data.users.push(newUser);
            req.db.data.transactions.push({
                id: Date.now(),
                user_id: newUser.id,
                package: temp.package,
                amount: temp.price,
                method: 'stripe',
                status: 'success',
                date: new Date().toISOString(),
                stripe_payment_intent: paymentIntentId
            });
            await req.db.write();
            delete req.session.tempRegister;
            req.session.user = newUser;
            return res.json({ success: true, message: 'Pembayaran berhasil, akun dibuat!', redirect: '/dashboard' });
        }

        // Upgrade / perpanjang untuk user yang sudah login
        if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
        const user = req.session.user;
        const userIndex = req.db.data.users.findIndex(u => u.id === user.id);
        if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

        let daysToAdd = 0;
        let amount = 0;
        if (pkg === 'pro') { daysToAdd = 14; amount = 100000; }
        else if (pkg === 'premium') { daysToAdd = 30; amount = 180000; }
        else return res.status(400).json({ error: 'Invalid package' });

        const currentPackage = req.db.data.users[userIndex].package;
        if (currentPackage === 'premium' && pkg === 'pro') {
            req.db.data.users[userIndex].package = 'pro';
        } else if (currentPackage === 'pro' && pkg === 'premium') {
            req.db.data.users[userIndex].package = 'premium';
        } else if (currentPackage === 'free' && (pkg === 'pro' || pkg === 'premium')) {
            req.db.data.users[userIndex].package = pkg;
        } else if (currentPackage === pkg) {
            // perpanjang
        } else if (currentPackage === 'premium' && pkg === 'pro') {
            req.db.data.users[userIndex].package = 'pro';
        } else if ((currentPackage === 'pro' && pkg === 'free') || (currentPackage === 'premium' && pkg === 'free')) {
            return res.status(400).json({ error: 'Tidak bisa downgrade ke free' });
        }

        const newExpiry = new Date();
        newExpiry.setDate(newExpiry.getDate() + daysToAdd);
        req.db.data.users[userIndex].trial_expired = newExpiry.toISOString();
        req.db.data.users[userIndex].last_package = pkg;
        req.db.data.transactions.push({
            id: Date.now(),
            user_id: user.id,
            package: pkg,
            amount,
            method: 'stripe',
            status: 'success',
            date: new Date().toISOString(),
            stripe_payment_intent: paymentIntentId
        });
        await req.db.write();
        req.session.user = req.db.data.users[userIndex];
        res.json({ success: true, message: `Berhasil ${pkg === currentPackage ? 'memperpanjang' : 'mengganti paket'} ${pkg.toUpperCase()} selama ${daysToAdd} hari!` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint lama untuk keperluan fallback (jika tidak pakai Stripe) - opsional
router.post('/buy', express.json(), async (req, res) => {
    // Fallback ke simulasi lama jika Stripe tidak terkonfigurasi
    res.json({ error: 'Silakan gunakan pembayaran melalui Stripe. Sistem pembayaran lama tidak aktif.' });
});

module.exports = router;
