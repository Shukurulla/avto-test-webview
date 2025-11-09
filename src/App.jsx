import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import LoginPage from './pages/LoginPage';
import TestSelection from './pages/student/TestSelection';
import TestTaking from './pages/student/TestTaking';
import TestResults from './pages/student/TestResults';
import TestHistory from './pages/student/TestHistory';

function App() {
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

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
