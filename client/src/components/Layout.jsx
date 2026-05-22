import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-brand-500 tracking-tight">
            PlaySetu
          </Link>
          <nav className="flex items-center gap-6 text-sm text-slate-300">
            <Link to="/facilities" className="hover:text-white">
              Discover
            </Link>
            {user && (
              <>
                <Link to="/bookings" className="hover:text-white">
                  My Bookings
                </Link>
                <Link to="/ai" className="hover:text-white">
                  AI Assistant
                </Link>
              </>
            )}
            {user ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-slate-400 hover:text-white"
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className="px-4 py-2 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-500">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        PlaySetu — Agentic sports booking for Lucknow
      </footer>
    </div>
  );
}
