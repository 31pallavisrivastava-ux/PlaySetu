import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

const navLinkClass = ({ isActive }) =>
  `text-sm font-semibold transition-colors ${
    isActive ? 'text-playo-green' : 'text-slate-600 hover:text-playo-green'
  }`;

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="bg-playo-green text-white text-center text-xs md:text-sm py-2 px-4 font-medium">
        Book on PlaySetu — pay at the venue · Instant slot confirmation
      </div>

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-playo-green flex items-center justify-center text-white font-extrabold text-lg">
              P
            </span>
            <span className="text-xl font-extrabold text-playo-navy tracking-tight">
              Play<span className="text-playo-green">Setu</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/facilities" className={navLinkClass}>
              Book
            </NavLink>
            <NavLink to="/ai" className={navLinkClass}>
              AI Assist
            </NavLink>
            {user && (
              <NavLink to="/bookings" className={navLinkClass}>
                My Bookings
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-slate-500">Hi, {user.name?.split(' ')[0]}</span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="text-sm font-medium text-slate-500 hover:text-playo-green"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-playo text-sm py-2 px-5">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-playo-navy text-slate-300 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <p className="text-2xl font-extrabold text-white">
              Play<span className="text-playo-green">Setu</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed max-w-md">
              Lucknow&apos;s sports platform to book venues, discover courts & turfs, and get AI-powered
              recommendations — inspired by the best booking experiences.
            </p>
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-3">Explore</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/facilities" className="hover:text-playo-green">
                  Book venues
                </Link>
              </li>
              <li>
                <Link to="/ai" className="hover:text-playo-green">
                  AI assistant
                </Link>
              </li>
              <li>
                <Link to="/bookings" className="hover:text-playo-green">
                  My bookings
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-3">Lucknow areas</p>
            <ul className="space-y-2 text-sm">
              <li>Gomti Nagar</li>
              <li>Chinhat</li>
              <li>Hazratganj</li>
              <li>SAI Lucknow</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 text-center text-xs py-4 text-slate-500">
          © {new Date().getFullYear()} PlaySetu — Sports booking for Lucknow
        </div>
      </footer>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-2 z-50 safe-area-pb">
        <NavLink to="/" end className={mobileNavClass}>
          <span>🏠</span>
          <span className="text-[10px]">Home</span>
        </NavLink>
        <NavLink to="/facilities" className={mobileNavClass}>
          <span>📅</span>
          <span className="text-[10px]">Book</span>
        </NavLink>
        <NavLink to="/ai" className={mobileNavClass}>
          <span>✨</span>
          <span className="text-[10px]">AI</span>
        </NavLink>
        <NavLink to="/bookings" className={mobileNavClass}>
          <span>📋</span>
          <span className="text-[10px]">Bookings</span>
        </NavLink>
      </nav>
      <div className="h-16 md:hidden" />
    </div>
  );
}

function mobileNavClass({ isActive }) {
  return `flex flex-col items-center gap-0.5 px-3 py-1 ${
    isActive ? 'text-playo-green' : 'text-slate-400'
  }`;
}
