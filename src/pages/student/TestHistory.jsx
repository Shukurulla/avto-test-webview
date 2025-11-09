import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testService } from '../../services/testService';
import { useAuth } from '../../context/AuthContext';
import '../../styles/TestHistory.css';

const TestHistory = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHistory();
  }, [currentPage]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await testService.getTestHistory(currentPage, 10);
      setHistory(response.data);
      setTotalPages(response.pages);
    } catch (err) {
      setError(err.response?.data?.error || 'Tarixni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Yuklanmoqda...</div>;
  }

  return (
    <div className="test-history">
      <header className="history-header">
        <h1>Test Tarixi</h1>
        <div className="user-info">
          <span>Xush kelibsiz, {user?.login}</span>
          <button onClick={() => navigate('/test/select')} className="btn-primary">
            Yangi Test
          </button>
          <button onClick={handleLogout} className="btn-danger">Chiqish</button>
        </div>
      </header>

      <div className="history-container">
        {error && <div className="error-message">{error}</div>}

        {history.length === 0 ? (
          <div className="no-history">
            <p>Siz hali birorta ham test topshirmadingiz.</p>
            <button onClick={() => navigate('/test/select')} className="btn-primary">
              Test Topshirish
            </button>
          </div>
        ) : (
          <>
            <div className="history-grid">
              {history.map((test) => {
                const passed = test.score >= 70;

                return (
                  <div key={test._id} className={`history-card ${passed ? 'passed' : 'failed'}`}>
                    <div className="card-header">
                      <h3>
                        {test.testType === 50 ? '50 savollik test' : '20 savollik test'}
                      </h3>
                      <span className={`badge ${passed ? 'badge-success' : 'badge-danger'}`}>
                        {passed ? 'O\'tdi' : 'O\'tmadi'}
                      </span>
                    </div>

                    <div className="card-body">
                      <div className="score-display-small">
                        <span className="score">{test.score}%</span>
                      </div>

                      <div className="test-stats-small">
                        <div className="stat">
                          <span className="label">To'g'ri:</span>
                          <span className="value correct">{test.correctCount}</span>
                        </div>
                        <div className="stat">
                          <span className="label">Noto'g'ri:</span>
                          <span className="value incorrect">{test.incorrectCount}</span>
                        </div>
                      </div>

                      <p className="test-date">
                        {new Date(test.completedAt).toLocaleString('uz-UZ')}
                      </p>
                    </div>

                    <div className="card-footer">
                      <button
                        onClick={() => navigate(`/test/results/${test._id}`)}
                        className="btn-secondary btn-sm"
                      >
                        Batafsil
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary"
                >
                  ← Oldingi
                </button>
                <span className="page-info">
                  Sahifa {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary"
                >
                  Keyingi →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TestHistory;
