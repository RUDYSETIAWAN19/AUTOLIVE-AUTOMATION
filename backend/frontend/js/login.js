// API Configuration
const API_URL = 'http://localhost:5001/api';

// Language Translations
const translations = {
    en: {
        signin_title: 'Sign in to AutoLive',
        email_label: 'Email address',
        password_label: 'Password',
        signin_button: 'Sign in',
        or: 'or',
        google_login: 'Continue with Google',
        facebook_login: 'Continue with Facebook',
        github_login: 'Continue with GitHub',
        create_account: 'Create an account',
        forgot_password: 'Forgot password?',
        login_success: 'Login successful! Redirecting...',
        login_error: 'Invalid email or password',
        social_login_error: 'Social login failed'
    },
    id: {
        signin_title: 'Masuk ke AutoLive',
        email_label: 'Alamat email',
        password_label: 'Kata sandi',
        signin_button: 'Masuk',
        or: 'atau',
        google_login: 'Lanjutkan dengan Google',
        facebook_login: 'Lanjutkan dengan Facebook',
        github_login: 'Lanjutkan dengan GitHub',
        create_account: 'Buat akun',
        forgot_password: 'Lupa kata sandi?',
        login_success: 'Berhasil masuk! Mengalihkan...',
        login_error: 'Email atau kata sandi salah',
        social_login_error: 'Login sosial gagal'
    },
    zh: {
        signin_title: '登录 AutoLive',
        email_label: '电子邮件地址',
        password_label: '密码',
        signin_button: '登录',
        or: '或',
        google_login: '使用 Google 继续',
        facebook_login: '使用 Facebook 继续',
        github_login: '使用 GitHub 继续',
        create_account: '创建帐户',
        forgot_password: '忘记密码？',
        login_success: '登录成功！正在跳转...',
        login_error: '电子邮件或密码错误',
        social_login_error: '社交登录失败'
    }
};

let currentLang = localStorage.getItem('language') || 'en';

// Language Selector
function initLanguageSelector() {
    const langBtn = document.getElementById('langBtn');
    const langDropdown = document.getElementById('langDropdown');
    const currentLangSpan = document.getElementById('currentLang');
    
    // Set current language display
    const langNames = { en: 'English', id: 'Bahasa Indonesia', zh: '中文' };
    currentLangSpan.textContent = langNames[currentLang];
    
    // Toggle dropdown
    langBtn.addEventListener('click', () => {
        langDropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!langBtn.contains(e.target) && !langDropdown.contains(e.target)) {
            langDropdown.classList.remove('show');
        }
    });
    
    // Language options click
    document.querySelectorAll('.lang-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = option.dataset.lang;
            currentLang = lang;
            localStorage.setItem('language', lang);
            
            // Update active class
            document.querySelectorAll('.lang-option').forEach(opt => {
                opt.classList.remove('active');
            });
            option.classList.add('active');
            
            // Update current language display
            currentLangSpan.textContent = langNames[lang];
            
            // Update page translations
            updateTranslations();
            
            langDropdown.classList.remove('show');
        });
    });
}

function updateTranslations() {
    const t = translations[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.dataset.i18n;
        if (t[key]) {
            element.textContent = t[key];
        }
    });
}

// Show Alert
function showAlert(message, type = 'error') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${type}`;
    alertDiv.textContent = message;
    
    const loginCard = document.querySelector('.login-card');
    const loginForm = document.getElementById('loginForm');
    loginCard.insertBefore(alertDiv, loginForm);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Login Function
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Save token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showAlert(translations[currentLang].login_success, 'success');
            
            // Redirect based on role
            setTimeout(() => {
                if (data.user.role === 'admin') {
                    window.location.href = '/admin/dashboard.html';
                } else {
                    window.location.href = '/user/dashboard.html';
                }
            }, 1000);
            
            return { success: true, user: data.user };
        } else {
            showAlert(data.message || translations[currentLang].login_error);
            return { success: false };
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Network error. Please check if backend is running.');
        return { success: false };
    }
}

// Social Login Handler
function handleSocialLogin(provider) {
    // Simulate social login - in production, this would redirect to OAuth
    showAlert(`Connecting to ${provider}...`, 'info');
    
    setTimeout(() => {
        // Simulated social login data
        const socialUser = {
            name: `User from ${provider}`,
            email: `${provider.toLowerCase()}_user@example.com`,
            provider: provider
        };
        
        // Store temporary social data
        localStorage.setItem('socialLoginData', JSON.stringify(socialUser));
        
        // Redirect to authorization page
        window.location.href = `/auth/authorize.html?provider=${provider}`;
    }, 1000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initLanguageSelector();
    updateTranslations();
    
    // Login form submit
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');
        
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
        
        await login(email, password);
        
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign in';
    });
    
    // Social login buttons
    document.getElementById('googleLogin').addEventListener('click', () => handleSocialLogin('Google'));
    document.getElementById('facebookLogin').addEventListener('click', () => handleSocialLogin('Facebook'));
    document.getElementById('githubLogin').addEventListener('click', () => handleSocialLogin('GitHub'));
});

// Check if already logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        const userData = JSON.parse(user);
        if (userData.role === 'admin') {
            window.location.href = '/admin/dashboard.html';
        } else {
            window.location.href = '/user/dashboard.html';
        }
    }
}

checkAuth();
