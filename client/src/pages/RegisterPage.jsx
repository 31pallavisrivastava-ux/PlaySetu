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
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">Create account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {['name', 'email', 'password', 'location'].map((field) => (
          <input
            key={field}
            type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 capitalize"
            placeholder={field.replace(/([A-Z])/g, ' $1')}
            required={field !== 'location'}
          />
        ))}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-brand-600 font-semibold hover:bg-brand-500"
        >
          Register
        </button>
      </form>
      <p className="mt-4 text-slate-400 text-sm">
        <Link to="/login" className="text-brand-500">
          Already have an account?
        </Link>
      </p>
    </div>
  );
}
