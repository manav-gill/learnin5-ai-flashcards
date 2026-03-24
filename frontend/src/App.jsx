import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';

// Main Application Layout (Sidebar + Content)
function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-body">
        <Navbar />
        <main className="app-main">
          <Dashboard />
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
      <Route path="/dashboard" element={<AppLayout />} />
    </Routes>
  );
}
