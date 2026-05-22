import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuthStore } from '../store/authStore.js';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    location: 'Gomti Nagar',
    preferredSports: ['badminton'],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      setAuth(data.data);
      navigate('/facilities');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <h1 className="text-2xl font-extrabold text-playo-navy text-center">Join PlaySetu</h1>
        <p className="text-slate-500 text-sm text-center mt-1 mb-8">Book sports venues across Lucknow</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'name', label: 'Full name', type: 'text' },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'password', label: 'Password', type: 'password' },
            { key: 'location', label: 'Preferred area', type: 'text' },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="text-xs font-semibold text-slate-500 uppercase">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="input-playo mt-1"
                required={key !== 'location'}
              />
            </div>
          ))}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-playo w-full">
            Create account
          </button>
        </form>
        <p className="mt-6 text-center text-slate-500 text-sm">
          <Link to="/login" className="text-playo-green font-semibold">
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
