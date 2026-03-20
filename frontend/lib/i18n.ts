import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations
const resources = {
  en: {
    translation: {
      dashboard: 'Dashboard',
      automation: 'Automation',
      videoEditor: 'Video Editor',
      reports: 'Reports',
      profile: 'Profile',
      admin: 'Admin',
      logout: 'Logout',
      login: {
        welcome: 'Welcome back!',
        email: 'Email',
        password: 'Password',
        button: 'Sign In',
        forgotPassword: 'Forgot password?',
        or: 'Or continue with',
        google: 'Sign in with Google',
        noAccount: "Don't have an account?",
        register: 'Sign up',
      },
      register: {
        welcome: 'Create your account',
        name: 'Full Name',
        email: 'Email',
        phone: 'Phone Number',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        button: 'Sign Up',
        haveAccount: 'Already have an account?',
        login: 'Sign in',
      },
    },
  },
  id: {
    translation: {
      dashboard: 'Dasbor',
      automation: 'Otomatisasi',
      videoEditor: 'Editor Video',
      reports: 'Laporan',
      profile: 'Profil',
      admin: 'Admin',
      logout: 'Keluar',
      login: {
        welcome: 'Selamat datang kembali!',
        email: 'Email',
        password: 'Kata Sandi',
        button: 'Masuk',
        forgotPassword: 'Lupa kata sandi?',
        or: 'Atau lanjutkan dengan',
        google: 'Masuk dengan Google',
        noAccount: 'Tidak punya akun?',
        register: 'Daftar',
      },
      register: {
        welcome: 'Buat akun Anda',
        name: 'Nama Lengkap',
        email: 'Email',
        phone: 'Nomor Telepon',
        password: 'Kata Sandi',
        confirmPassword: 'Konfirmasi Kata Sandi',
        button: 'Daftar',
        haveAccount: 'Sudah punya akun?',
        login: 'Masuk',
      },
    },
  },
  // Add more languages...
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'id',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
