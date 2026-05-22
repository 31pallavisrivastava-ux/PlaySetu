import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuthStore } from '../store/authStore.js';

const STATUS_STYLES = {
  CONFIRMED: 'bg-playo-green-light text-playo-green',
  PENDING: 'bg-amber-50 text-amber-700',
  CANCELLED: 'bg-red-50 text-red-600',
  COMPLETED: 'bg-blue-50 text-blue-700',
};

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
    try {
      const { data } = await api.delete(`/bookings/${id}`);
      setBookings((b) => b.map((x) => (x.id === id ? data.data : x)));
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Could not cancel booking');
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-extrabold text-playo-navy">My bookings</h1>
          <p className="text-slate-500 mt-1">Your upcoming & past venue bookings</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <p className="text-5xl mb-4">📅</p>
            <p className="font-semibold text-playo-navy">No bookings yet</p>
            <p className="text-slate-500 text-sm mt-2 mb-6">Find a court or turf and book your first slot</p>
            <Link to="/facilities" className="btn-playo">
              Book a venue
            </Link>
          </div>
        ) : (
          bookings.map((b) => (
            <div
              key={b.id}
              className={`bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                b.bookingStatus === 'CANCELLED' ? 'opacity-75' : ''
              }`}
            >
              <div>
                <p className="font-bold text-playo-navy text-lg">{b.slot?.court?.facility?.name}</p>
                <p className="text-slate-500 text-sm mt-1">
                  {b.slot?.startTime} – {b.slot?.endTime} · {b.slot?.court?.facility?.area}
                </p>
                {b.playerCount != null && (
                  <p className="text-slate-500 text-sm mt-1">
                    {b.playerCount} {b.playerCount === 1 ? 'player' : 'players'} in your group
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      STATUS_STYLES[b.bookingStatus] ?? 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {b.bookingStatus}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                    ₹{b.totalAmount} at venue
                  </span>
                </div>
              </div>
              {b.bookingStatus !== 'CANCELLED' && (
                <button
                  type="button"
                  onClick={() => cancel(b.id)}
                  className="text-sm font-medium text-red-500 hover:text-red-600 shrink-0"
                >
                  Cancel booking
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
