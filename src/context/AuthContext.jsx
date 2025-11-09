import { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    console.log('🔍 checkAuth BOSHLANDI');
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      console.log('📦 localStorage:', {
        hasToken: !!token,
        hasUser: !!storedUser,
        token: token ? token.substring(0, 20) + '...' : null,
        user: storedUser ? JSON.parse(storedUser).login : null
      });

      if (token && storedUser) {
        // localStorage dan user ni yuklash va ishlatish
        const parsedUser = JSON.parse(storedUser);
        console.log('👤 Parsed user:', parsedUser.login);
        setUser(parsedUser);
        console.log('✅ User o\'rnatildi');
      } else {
        console.log('❌ Token yoki user yo\'q!');
        setUser(null);
      }
    } catch (error) {
      console.error('💥 checkAuth XATO:', error);
      // Faqat JSON parse error bo'lsa localStorage ni tozalaymiz
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      // Loading ni har doim oxirida false qilish
      setLoading(false);
      console.log('🏁 checkAuth TUGADI, loading = false');
    }
  };

  const login = async (loginName, password, computerNumber) => {
    const response = await authService.login(loginName, password, computerNumber);
    const { user, token, refreshToken } = response.data;

    // Student saytda faqat oddiy userlar kirishi mumkin
    if (user.isAdmin) {
      throw new Error('Admin foydalanuvchilar student saytiga kira olmaydi. Iltimos admin paneldan (port 3001) kiring.');
    }

    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    setUser(user);

    return user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Xatolik bo'lsa ham localStorage ni tozalaymiz
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
