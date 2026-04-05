import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import SavedFlashcards from './pages/SavedFlashcards';

const NAV_ROUTES = {
  dashboard: '/dashboard',
  saved: '/saved',
};

// Main Application Layout (Sidebar + Content)
function AppLayout({ activeItem = 'dashboard', children }) {
  const navigate = useNavigate();

  const handleSidebarNavigate = (itemId) => {
    const route = NAV_ROUTES[itemId];

    if (route) {
      navigate(route);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activeItem={activeItem} onNavigate={handleSidebarNavigate} />
      <div className="app-body">
        <Navbar />
        <main className="app-main">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<LandingPage onGetStarted={() => navigate('/dashboard')} />} />
      <Route
        path="/dashboard"
        element={(
          <AppLayout activeItem="dashboard">
            <Dashboard />
          </AppLayout>
        )}
      />
      <Route
        path="/saved"
        element={(
          <AppLayout activeItem="saved">
            <SavedFlashcards />
          </AppLayout>
        )}
      />
    </Routes>
  );
}
