import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { testService } from "../../services/testService";
import "../../styles/TestTaking.css";
import { Logo } from "../../../public";

const TestTaking = () => {
  const navigate = useNavigate();

  const [testData, setTestData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    const storedTest = sessionStorage.getItem("currentTest");
    if (!storedTest) {
      navigate("/test/select");
      return;
    }

    const test = JSON.parse(storedTest);
    setTestData(test);
    setCurrentLanguage(test.langId);
    setTimeRemaining(test.duration);

    // Initialize answers array
    setAnswers(new Array(test.questions.length).fill(null));

    // Enter fullscreen mode
    const enterFullscreen = async () => {
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
          await elem.msRequestFullscreen();
        }
      } catch (err) {
        console.log("Fullscreen error:", err);
      }
    };
    enterFullscreen();

    // Exit fullscreen on unmount
    return () => {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    };
  }, [navigate]);

  // Language switching is disabled during test - language is selected before test starts

  // Timer
  useEffect(() => {
    if (!testData || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleFinishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testData, timeRemaining]);

  const handleFinishTest = useCallback(async () => {
    try {
      const result = await testService.finishTest({
        testType: testData.testType,
        templateId: testData.templateId,
        questions: answers.filter((a) => a !== null),
        startedAt: testData.startedAt,
      });

      sessionStorage.removeItem("currentTest");
      navigate(`/test/results/${result.data.id}`);
    } catch (err) {
      alert("Testni tugatishda xatolik");
    }
  }, [testData, answers, navigate]);

  const handleExitConfirm = useCallback(() => {
    sessionStorage.removeItem("currentTest");
    navigate("/test/select");
  }, [navigate]);

  // Select answer function with useCallback
  const selectAnswer = useCallback(
    async (answerIndex) => {
      if (showFeedback || !testData) return;

      // Agar bu savolga allaqachon javob berilgan bo'lsa, qayta javob berishga ruxsat berma
      if (answers[currentQuestionIndex] !== null) return;

      const currentQuestion = testData.questions[currentQuestionIndex];
      const selectedAnswer = currentQuestion.answers[answerIndex];

      if (!selectedAnswer) return;

      try {
        const response = await testService.submitAnswer(
          currentQuestion.questionId,
          currentLanguage,
          selectedAnswer.id
        );

        setFeedbackData(response.data);
        setShowFeedback(true);

        // Update answers array
        setAnswers((prevAnswers) => {
          const newAnswers = [...prevAnswers];
          newAnswers[currentQuestionIndex] = {
            questionId: currentQuestion.questionId,
            langId: currentLanguage,
            userAnswer: selectedAnswer.id,
            isCorrect: response.data.isCorrect,
            correctAnswerId: response.data.correctAnswerId,
          };
          return newAnswers;
        });

        // Auto advance after 1 second
        setTimeout(() => {
          setShowFeedback(false);
          setFeedbackData(null);

          if (currentQuestionIndex < testData.questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
          } else {
            handleFinishTest();
          }
        }, 1000);
      } catch (err) {
        alert("Javobni yuborishda xatolik");
      }
    },
    [
      showFeedback,
      testData,
      currentQuestionIndex,
      currentLanguage,
      answers,
      handleFinishTest,
    ]
  );

  // Keyboard shortcuts
  const handleKeyPress = useCallback(
    (e) => {
      if (showFeedback || !testData) return;

      const currentQuestion = testData.questions[currentQuestionIndex];
      const answerCount = currentQuestion?.answers?.length || 0;

      // Prevent default for function keys
      if (e.key.startsWith("F") && !isNaN(e.key.substring(1))) {
        e.preventDefault();
      }

      switch (e.key) {
        case "F1":
          if (answerCount >= 1) selectAnswer(0);
          break;
        case "F2":
          if (answerCount >= 2) selectAnswer(1);
          break;
        case "F3":
          if (answerCount >= 3) selectAnswer(2);
          break;
        case "F4":
          if (answerCount >= 4) selectAnswer(3);
          break;
        case "F5":
          if (answerCount >= 5) selectAnswer(4);
          break;
        case "f":
        case "F":
          e.preventDefault();
          setShowImageModal((prev) => !prev);
          break;
        case "Escape":
          e.preventDefault();
          if (showImageModal) {
            setShowImageModal(false);
          } else if (showExitModal) {
            setShowExitModal(false);
          } else {
            setShowExitModal(true);
          }
          break;
        case "Enter":
          if (showExitModal) {
            e.preventDefault();
            handleExitConfirm();
          }
          break;
        default:
          break;
      }
    },
    [
      showFeedback,
      testData,
      currentQuestionIndex,
      showImageModal,
      showExitModal,
      selectAnswer,
      handleExitConfirm,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  if (!testData) {
    return <div className="loading">Yuklanmoqda...</div>;
  }

  const currentQuestion = testData.questions[currentQuestionIndex];
  const questionBody = currentQuestion.body;

  // Get question text (type 1 = text, type 2 = image)
  const questionText = questionBody.find((b) => b.type === 1)?.value || "";
  const questionImage = currentQuestion.imagePath;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="test-taking">
      {/* Header */}
      <header className="test-header">
        <div className="nav-left">
          <div className="logo">
            <div className="logo-icon">
              <img src={Logo} className="logo-img" alt="" />
            </div>
            <span>Avto Test Nukus</span>
          </div>
        </div>
        <div className="nav-center">
          <button
            className="exit-test-btn"
            onClick={() => setShowExitModal(true)}
          >
            Testdan chiqish
            <span className="exit-shortcut">ESC</span>
          </button>
        </div>
        <div className="nav-right">
          <span className="question-counter">
            - {currentQuestionIndex + 1} -
          </span>
          <span className="timer">{formatTime(timeRemaining)}</span>
        </div>
      </header>

      {/* Question */}
      <div className="question-container">
        {/* Savol matni (to'liq kenglikda) */}
        <div className="question-text">{questionText}</div>

        {/* Rasm va javoblar yonma-yon */}
        <div className="content-row">
          {/* Rasm (chap tomonda, agar mavjud bo'lsa) */}
          {questionImage ? (
            <div className="question-image-section">
              <img
                src={`https://webview-server.test-avtomaktab.uz/${questionImage}`}
                alt="Savol rasmi"
                onClick={() => setShowImageModal(true)}
              />
              <p className="image-hint">
                Rasmni kattalashtirish uchun F tugmasini bosing
              </p>
            </div>
          ) : (
            <div className="question-image-section no-image">
              <div className="no-image-placeholder">
                <p>Bu test uchun rasm yo'q</p>
              </div>
            </div>
          )}

          {/* Javob variantlari (o'ng tomonda) */}
          <div className="answers-section">
            <div className="answers-grid">
              {currentQuestion.answers.map((answer, index) => {
                // Get answer text (type 1 = text for answers as well)
                const answerText =
                  answer.body.find((b) => b.type === 1)?.value || "";
                const label = String.fromCharCode(65 + index); // A, B, C, D...
                const shortcutKey = `F${index + 1}`;

                const currentAnswer = answers[currentQuestionIndex];
                let className = "answer-option";

                // Agar bu savolga oldin javob berilgan bo'lsa
                if (currentAnswer) {
                  // Foydalanuvchi tanlagan javob
                  if (currentAnswer.userAnswer === answer.id) {
                    className += currentAnswer.isCorrect
                      ? " correct"
                      : " incorrect";
                  }
                  // To'g'ri javobni ham ko'rsatish
                  if (currentAnswer.correctAnswerId === answer.id) {
                    className += " correct";
                  }
                }

                // Feedback ko'rsatilayotganda
                if (showFeedback && feedbackData) {
                  if (answer.id === feedbackData.correctAnswerId) {
                    className += " correct";
                  } else if (
                    currentAnswer?.userAnswer === answer.id &&
                    !feedbackData.isCorrect
                  ) {
                    className += " incorrect";
                  }
                }

                return (
                  <button
                    key={answer.id}
                    className={className}
                    onClick={() => selectAnswer(index)}
                    disabled={showFeedback || currentAnswer !== null}
                  >
                    <span className="answer-label">{label}</span>
                    <span className="answer-text">{answerText}</span>
                    <span className="answer-shortcut">{shortcutKey}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Feedback */}
        {showFeedback && feedbackData && (
          <div
            className={`feedback ${
              feedbackData.isCorrect ? "correct" : "incorrect"
            }`}
          >
            {feedbackData.isCorrect ? "✓ To'g'ri!" : "✗ Noto'g'ri!"}
          </div>
        )}

        {/* Savol paginatsiyasi */}
        <div className={`question-pagination test-${testData.testType}`}>
          <div className="pagination-grid">
            {testData.questions.map((_, index) => {
              const answer = answers[index];
              let btnClass = "page-btn";
              if (index === currentQuestionIndex) btnClass += " active";
              if (answer !== null) {
                // To'g'ri javob - yashil, noto'g'ri - qizil
                btnClass += answer.isCorrect
                  ? " answered-correct"
                  : " answered-incorrect";
              }

              return (
                <button
                  key={index}
                  className={btnClass}
                  onClick={() => setCurrentQuestionIndex(index)}
                  disabled={showFeedback}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && questionImage && (
        <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="modal-content image-modal">
            <img
              src={`https://webview-server.test-avtomaktab.uz/${questionImage}`}
              alt="Savol rasmi"
            />
            <p>F yoki ESC tugmasini bosing yopish uchun</p>
          </div>
        </div>
      )}

      {/* Exit Modal */}
      {showExitModal && (
        <div className="modal-overlay">
          <div className="modal-content exit-modal">
            <h3>Testni tugatish</h3>
            <p>Testni tugatmoqchimisiz? Barcha javoblaringiz saqlanmaydi.</p>
            <div className="modal-actions">
              <button onClick={handleExitConfirm} className="btn-danger">
                Ha, chiqish
              </button>
              <button
                onClick={() => setShowExitModal(false)}
                className="btn-secondary"
              >
                Yo'q, davom etish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestTaking;
