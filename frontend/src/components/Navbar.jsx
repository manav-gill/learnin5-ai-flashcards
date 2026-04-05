import { useEffect, useState } from 'react';
import { getAuthUser } from '../services/api';
import './Navbar.css';

export default function Navbar({ title = 'Dashboard' }) {
  const [authUser, setAuthUser] = useState(() => getAuthUser());

  useEffect(() => {
    const refreshUser = () => {
      setAuthUser(getAuthUser());
    };

    window.addEventListener('auth-session-changed', refreshUser);
    window.addEventListener('storage', refreshUser);

    return () => {
      window.removeEventListener('auth-session-changed', refreshUser);
      window.removeEventListener('storage', refreshUser);
    };
  }, []);

  const userName = authUser?.name || 'Learner';
  const userEmail = authUser?.email || 'member@learnin5.app';
  const userInitial = userName.trim().charAt(0).toUpperCase() || 'L';

  return (
    <header className="navbar">
      {/* Left — Page title / breadcrumb area */}
      <div className="navbar__left">
        <h2 className="navbar__title">{title}</h2>
      </div>

      {/* Right — Actions */}
      <div className="navbar__right">
        {/* Notification */}
        <button className="navbar__icon-btn" aria-label="Notifications" title="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className="navbar__notification-dot" />
        </button>

        {/* Divider */}
        <div className="navbar__divider" />

        {/* Profile */}
        <button className="navbar__profile" aria-label="Profile menu" title="Profile">
          <div className="navbar__avatar">{userInitial}</div>
          <div className="navbar__user-info">
            <span className="navbar__user-name">{userName}</span>
            <span className="navbar__user-role">{userEmail}</span>
          </div>
          <svg className="navbar__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </header>
  );
}
