import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const NAV_ROUTES = {
  generate: '/generate',
  decks: '/my-deck',
  profile: '/profile',
};

const NAV_TITLES = {
  generate: 'Generate',
  decks: 'My Deck',
  profile: 'Profile',
};

const getActiveTabFromPath = (pathname) => {
  if (pathname.startsWith('/my-deck')) {
    return 'decks';
  }

  if (pathname.startsWith('/profile')) {
    return 'profile';
  }

  return 'generate';
};

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeItem = getActiveTabFromPath(location.pathname);
  const pageTitle = NAV_TITLES[activeItem] || 'Learn in 5';

  const handleSidebarNavigate = (itemId) => {
    const route = NAV_ROUTES[itemId];

    if (route && route !== location.pathname) {
      navigate(route);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activeItem={activeItem} onNavigate={handleSidebarNavigate} />
      <div className="app-body">
        <Navbar title={pageTitle} />
        <main key={location.pathname} className="app-main app-main--transition">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
