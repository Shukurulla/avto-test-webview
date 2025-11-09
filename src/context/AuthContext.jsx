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

  const checkAuth = async () => {
    console.log('🔍 checkAuth START');
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      console.log('📝 token:', token ? 'MAVJUD ✅' : 'YO\'Q ❌');
      console.log('📝 storedUser:', storedUser ? 'MAVJUD ✅' : 'YO\'Q ❌');

      if (token && storedUser) {
        // Avval localStorage dan user ni yuklash
        const parsedUser = JSON.parse(storedUser);
        console.log('👤 parsedUser:', parsedUser);
        setUser(parsedUser);
        setLoading(false); // Darhol loading ni false qilish
        console.log('✅ User set qilindi va loading = false');

        // Keyin server dan yangi ma'lumot olish
        try {
          const response = await authService.getMe();
          console.log('🌐 Server response:', response.data);
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } catch (error) {
          // Agar server bilan aloqa yo'q bo'lsa, localStorage dagi user ni ishlatamiz
          console.log('⚠️ Server xato, localStorage ishlatilmoqda');
        }
      } else {
        console.log('❌ Token yoki user yo\'q, loading = false');
        setLoading(false);
      }
    } catch (error) {
      // Faqat JSON parse error bo'lsa localStorage ni tozalaymiz
      console.error('❌ checkAuth ERROR:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false);
    }
    console.log('🏁 checkAuth END');
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
