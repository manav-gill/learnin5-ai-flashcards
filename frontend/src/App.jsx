import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import MyDeck from './pages/MyDeck';
import Profile from './pages/Profile';
import AuthPage from './pages/AuthPage';
import { isAuthenticated } from './services/api';

export default function App() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(isAuthenticated() ? '/generate' : '/auth');
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage onGetStarted={handleGetStarted} />} />
      <Route path="/auth" element={<AuthPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/generate" element={<Dashboard />} />
          <Route path="/my-deck" element={<MyDeck />} />
          <Route path="/profile" element={<Profile />} />

          {/* Backward-compatible aliases */}
          <Route path="/dashboard" element={<Navigate to="/generate" replace />} />
          <Route path="/saved" element={<Navigate to="/my-deck" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated() ? '/generate' : '/auth'} replace />} />
    </Routes>
  );
}
