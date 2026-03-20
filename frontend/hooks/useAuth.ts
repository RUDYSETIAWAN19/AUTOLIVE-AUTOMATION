import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { login as loginAction, register as registerAction, logout as logoutAction } from '../store/slices/authSlice';
import api from '../lib/api';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isLoading } = useSelector((state: RootState) => state.auth);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      dispatch(loginAction(response.data));
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData: { name: string; email: string; password: string; phoneNumber: string }) => {
    try {
      const response = await api.post('/auth/register', userData);
      dispatch(registerAction(response.data));
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const googleLogin = async () => {
    // Implement Google OAuth
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  const logout = () => {
    dispatch(logoutAction());
    localStorage.removeItem('token');
  };

  const updateProfile = async (data: any) => {
    try {
      const response = await api.put('/users/profile', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update failed');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await api.put('/users/change-password', { currentPassword, newPassword });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  };

  return {
    user,
    token,
    isLoading,
    login,
    register,
    googleLogin,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!token,
  };
};
