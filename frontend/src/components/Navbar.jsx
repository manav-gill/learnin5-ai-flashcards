import './Navbar.css';

export default function Navbar() {
  return (
    <header className="navbar">
      {/* Left — Page title / breadcrumb area */}
      <div className="navbar__left">
        <h2 className="navbar__title">Dashboard</h2>
      </div>

      {/* Center — Search */}
      <div className="navbar__center">
        <div className="navbar__search">
          <svg className="navbar__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="navbar__search-input"
            placeholder="Search flashcards, decks..."
            aria-label="Search"
          />
          <kbd className="navbar__search-shortcut">⌘K</kbd>
        </div>
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
          <div className="navbar__avatar">M</div>
          <div className="navbar__user-info">
            <span className="navbar__user-name">Madhav</span>
            <span className="navbar__user-role">Pro Plan</span>
          </div>
          <svg className="navbar__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </header>
  );
}
