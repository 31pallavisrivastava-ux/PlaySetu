import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuthStore } from '../store/authStore.js';
import { homePathForRole } from '../utils/authRedirect.js';

export default function LoginPage() {
  const [email, setEmail] = useState('user@playsetu.in');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.data);
      navigate(homePathForRole(data.data.user?.role));
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-8">
          <span className="w-14 h-14 rounded-2xl bg-playo-green flex items-center justify-center text-white font-extrabold text-2xl mx-auto">
            P
          </span>
          <h1 className="text-2xl font-extrabold text-playo-navy mt-4">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to book venues in Lucknow</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-playo mt-1"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-playo mt-1"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-playo w-full disabled:opacity-50">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-slate-500 text-sm">
          New here?{' '}
          <Link to="/register" className="text-playo-green font-semibold hover:underline">
            Create account
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-slate-400">
          Player: user@playsetu.in · Venue manager: owner@playsetu.in · Password123!
        </p>
      </div>
    </div>
  );
}
