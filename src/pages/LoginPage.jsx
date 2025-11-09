import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [computerNumber, setComputerNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login: authLogin, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Agar user allaqachon kirgan bo'lsa, test selection sahifasiga o'tkazish
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/test/select', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authLogin(login, password, computerNumber);

      // Student saytda faqat test sahifasiga yo'naltiradi
      navigate('/test/select');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login xatosi. Iltimos qaytadan urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Avto Test Tizimi</h1>
        <h2>Kirish</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login">Login</label>
            <input
              type="text"
              id="login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Parol</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="computerNumber">Kompyuter raqami</label>
            <input
              type="text"
              id="computerNumber"
              value={computerNumber}
              onChange={(e) => setComputerNumber(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? 'Kirish...' : 'Kirish'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
