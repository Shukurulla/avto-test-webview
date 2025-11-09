import api from './api';

export const authService = {
  login: async (login, password, computerNumber) => {
    const response = await api.post('/auth/login', {
      login,
      password,
      computerNumber,
    });
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
