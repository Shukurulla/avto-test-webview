import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { testService } from "../../services/testService";
import "../../styles/TestSelection.css";
import { Logo } from "../../../public";

const TestSelection = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [testTypes, setTestTypes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedType, setSelectedType] = useState(50);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(1);
  const [computerNumber, setComputerNumber] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [typesData, templatesData] = await Promise.all([
        testService.getTestTypes(),
        testService.getTemplates(),
      ]);

      setTestTypes(typesData.data.types);
      setTemplates(templatesData.data);
    } catch (err) {
      setError(err.response?.data?.error || "Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleStartTest = async () => {
    if (selectedType === 20 && !selectedTemplate) {
      alert("Iltimos shablon tanlang!");
      return;
    }

    try {
      const testData = await testService.startTest(
        selectedType,
        selectedType === 20 ? selectedTemplate : null,
        selectedLanguage
      );

      sessionStorage.setItem("currentTest", JSON.stringify(testData.data));
      navigate("/test/taking");
    } catch (err) {
      alert(err.response?.data?.error || "Test boshlashda xatolik");
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <img src={Logo} alt="Logo" className="loading-logo" />
        <div className="loading-text">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="test-selection-page">
      <header className="top-nav">
        <div className="nav-left">
          <div className="logo">
            <div className="logo-icon">
              <img src={Logo} className="logo-img" alt="" />
            </div>
            <span>Avto Test Nukus</span>
          </div>
        </div>
      </header>

      <div className="test-selection-content">
        <div className="selection-box">
          <h1 className="main-title">Avto Test Nukus</h1>

          {error && <div className="error-message">{error}</div>}

          <div className="form-field">
            <label>Til tanlang:</label>
            <div className="language-buttons">
              <button
                className={`lang-btn ${selectedLanguage === 1 ? "active" : ""}`}
                onClick={() => setSelectedLanguage(1)}
              >
                Uzb (lotin)
              </button>
              <button
                className={`lang-btn ${selectedLanguage === 2 ? "active" : ""}`}
                onClick={() => setSelectedLanguage(2)}
              >
                Rus (кирилл)
              </button>
              <button
                className={`lang-btn ${selectedLanguage === 3 ? "active" : ""}`}
                onClick={() => setSelectedLanguage(3)}
              >
                Uzb (кирил)
              </button>
            </div>
          </div>

          <div className="form-field">
            <label>Savollar soni:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(Number(e.target.value))}
              className="dropdown"
            >
              {testTypes.map((type) => (
                <option key={type.type} value={type.type}>
                  {type.type} ta savol
                </option>
              ))}
            </select>
          </div>

          {selectedType === 20 && (
            <div className="form-field">
              <label>Shablon:</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(Number(e.target.value))}
                className="dropdown"
              >
                <option value="">Shablon tanlang...</option>
                {templates.map((template) => (
                  <option key={template.templateId} value={template.templateId}>
                    Shablon {template.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button onClick={handleStartTest} className="start-button">
            TESTNI BOSHLASH
          </button>

          <div className="footer-text">
            <p>© 2025 IMAX MCHJ | Platformni himoyalangan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSelection;
