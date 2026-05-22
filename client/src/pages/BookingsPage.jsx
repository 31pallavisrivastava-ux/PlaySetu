import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuthStore } from '../store/authStore.js';

export default function BookingsPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
      navigate('/login');
      return;
    }
    api.get('/bookings/my').then((res) => setBookings(res.data.data));
  }, [accessToken, navigate]);

  async function cancel(id) {
    if (!confirm('Cancel this booking?')) return;
    await api.delete(`/bookings/${id}`);
    setBookings((b) => b.filter((x) => x.id !== id));
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">My bookings</h1>
      {bookings.length === 0 ? (
        <p className="text-slate-400">
          No bookings yet. <Link to="/facilities" className="text-brand-500">Browse facilities</Link>
        </p>
      ) : (
        <ul className="space-y-4">
          {bookings.map((b) => (
            <li key={b.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <p className="font-semibold">{b.slot?.court?.facility?.name}</p>
              <p className="text-slate-400 text-sm">
                {b.slot?.startTime}–{b.slot?.endTime} · {b.bookingStatus} · ₹{b.totalAmount} at venue
              </p>
              {b.bookingStatus !== 'CANCELLED' && (
                <button
                  type="button"
                  onClick={() => cancel(b.id)}
                  className="mt-3 text-sm text-red-400 hover:text-red-300"
                >
                  Cancel
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
