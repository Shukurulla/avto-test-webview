import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import LoginPage from './pages/LoginPage';
import TestSelection from './pages/student/TestSelection';
import TestTaking from './pages/student/TestTaking';
import TestResults from './pages/student/TestResults';
import TestHistory from './pages/student/TestHistory';

// Root redirect component
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Yuklanmoqda...</div>
      </div>
    );
  }

  return user ? <Navigate to="/test/select" replace /> : <Navigate to="/login" replace />;
};

function App() {
  useEffect(() => {
    // Ong klik (context menu)ni bloklash
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Student Routes */}
          <Route
            path="/test/*"
            element={
              <PrivateRoute>
                <Routes>
                  <Route path="/select" element={<TestSelection />} />
                  <Route path="/taking" element={<TestTaking />} />
                  <Route path="/results/:id" element={<TestResults />} />
                  <Route path="/history" element={<TestHistory />} />
                </Routes>
              </PrivateRoute>
            }
          />

          <Route path="/" element={<RootRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
