import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import {
  FiCalendar,
  FiGrid,
  FiHome,
  FiLifeBuoy,
  FiLogOut,
  FiMenu,
  FiPlusCircle,
  FiX,
} from 'react-icons/fi';

const APP_NAV = [
  { to: '/homeuser', label: 'Home', icon: FiHome },
  { to: '/schedule', label: 'Requests', icon: FiCalendar },
  { to: '/request', label: 'Book', icon: FiPlusCircle },
  { to: '/services', label: 'Services', icon: FiGrid },
];

const Brand = () => (
  <Link
    to="/"
    className="flex items-center gap-2 text-sm font-semibold tracking-tight text-gray-900 dark:text-white"
  >
    <span className="flex h-6 w-6 items-center justify-center rounded bg-primary-600 text-2xs font-bold text-white">
      S
    </span>
    Scheduler
  </Link>
);

const Layout = ({ children }) => {
  const { user, logout } = useAuthContext();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (to) =>
    location.pathname === to || location.pathname.startsWith(`${to}/`);

  const navLink = (item, onClick) => {
    const Icon = item.icon;
    return (
      <Link
        key={item.to}
        to={item.to}
        onClick={onClick}
        className={`flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors ${
          isActive(item.to)
            ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-white'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {item.label}
      </Link>
    );
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 md:px-8">
            <Brand />
            <nav className="flex items-center gap-1">
              <Link
                to="/services"
                className="button-ghost hidden sm:inline-flex"
              >
                Services
              </Link>
              <Link to="/login" className="button-ghost">
                Sign in
              </Link>
              <Link to="/signup" className="button">
                Get started
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 md:px-8">
          {children}
        </main>

        <footer className="border-t border-gray-200 py-6 dark:border-gray-800">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between md:px-8 dark:text-gray-500">
            <span>© {new Date().getFullYear()} Scheduler</span>
            <Link
              to="/services"
              className="hover:text-gray-900 dark:hover:text-gray-200"
            >
              Browse services
            </Link>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-gray-200 bg-white px-3 py-4 md:flex dark:border-gray-800 dark:bg-gray-900">
        <div className="px-2.5 pb-4">
          <Brand />
        </div>

        <nav className="flex flex-1 flex-col gap-0.5">
          {APP_NAV.map((item) => navLink(item))}
        </nav>

        <div className="flex flex-col gap-0.5 border-t border-gray-200 pt-3 dark:border-gray-800">
          <div className="truncate px-2.5 pb-2 text-xs text-gray-500 dark:text-gray-500">
            {user.email}
          </div>
          <div className="flex items-center justify-between px-0.5">
            <button
              type="button"
              onClick={handleLogout}
              className="button-ghost"
            >
              <FiLogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur md:hidden dark:border-gray-800 dark:bg-gray-900/90">
          <div className="flex h-14 items-center justify-between px-4">
            <Brand />
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="button-ghost"
                aria-label="Toggle navigation"
                aria-expanded={mobileNavOpen}
              >
                {mobileNavOpen ? (
                  <FiX className="h-5 w-5" />
                ) : (
                  <FiMenu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {mobileNavOpen && (
            <nav className="flex flex-col gap-0.5 border-t border-gray-200 px-3 py-3 dark:border-gray-800">
              {APP_NAV.map((item) =>
                navLink(item, () => setMobileNavOpen(false)),
              )}
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  handleLogout();
                }}
                className="flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <FiLogOut className="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            </nav>
          )}
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>

        <footer className="border-t border-gray-200 px-4 py-4 text-xs text-gray-500 md:px-8 dark:border-gray-800 dark:text-gray-500">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-2">
            <FiLifeBuoy className="h-3.5 w-3.5" aria-hidden="true" />
            Need help? Open the support panel on the Requests page.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
