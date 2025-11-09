import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { testService } from "../../services/testService";
import "../../styles/TestResults.css";

const TestResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const response = await testService.getTestResult(id);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Natijalarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Yuklanmoqda...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button
          onClick={() => navigate("/test/select")}
          className="btn-primary"
        >
          Bosh sahifaga qaytish
        </button>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const passed = result.score >= 70;
  const totalQuestions = result.questions.length;
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} daqiqa ${secs} soniya`;
  };

  return (
    <div className="test-results">
      <div className="results-container">
        <div className={`results-header ${passed ? "passed" : "failed"}`}>
          <div className="result-icon">{passed ? "✓" : "✗"}</div>
          <h1>{passed ? "Tabriklaymiz!" : "Afsuski..."}</h1>
          <p className="result-message">
            {passed
              ? "Siz testdan muvaffaqiyatli o'tdingiz!"
              : "Siz testdan o'ta olmadingiz. Qaytadan urinib ko'ring!"}
          </p>
        </div>

        <div className="score-display">
          <div className="score-circle">
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="20"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={passed ? "#28a745" : "#dc3545"}
                strokeWidth="20"
                strokeDasharray={`${(result.score / 100) * 565} 565`}
                strokeDashoffset="0"
                transform="rotate(-90 100 100)"
                strokeLinecap="round"
              />
            </svg>
            <div className="score-text">
              <span className="score-number">{result.score}%</span>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{totalQuestions}</div>
            <div className="stat-label">Jami savollar</div>
          </div>
          <div className="stat-item correct">
            <div className="stat-value">{result.correctCount}</div>
            <div className="stat-label">To'g'ri javoblar</div>
          </div>
          <div className="stat-item incorrect">
            <div className="stat-value">{result.incorrectCount}</div>
            <div className="stat-label">Noto'g'ri javoblar</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{formatDuration(result.duration)}</div>
            <div className="stat-label">Sarflangan vaqt</div>
          </div>
        </div>

        <div className="actions">
          <button
            onClick={() => navigate("/test/select")}
            className="btn-primary"
          >
            Yangi Test Topshirish
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestResults;
