import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuthStore } from '../store/authStore.js';

export default function FacilityDetailPage() {
  const { id } = useParams();
  const [facility, setFacility] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/facilities/${id}`).then((res) => {
      setFacility(res.data.data);
      if (res.data.data.courts?.[0]) setSelectedCourt(res.data.data.courts[0].id);
    });
  }, [id]);

  useEffect(() => {
    if (!selectedCourt || !date) return;
    api
      .get('/facilities/slots', { params: { courtId: selectedCourt, date } })
      .then((res) => setSlots(res.data.data));
  }, [selectedCourt, date]);

  async function bookSlot(slotId) {
    if (!accessToken) {
      navigate('/login');
      return;
    }
    setBookingLoading(true);
    try {
      await api.post('/bookings', { slotId });
      navigate('/bookings');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  }

  if (!facility) return <p className="p-10 text-slate-400">Loading…</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">{facility.name}</h1>
      <p className="text-slate-400 mt-2">
        {facility.area} · {facility.address}
      </p>
      <p className="mt-4 text-slate-300">{facility.description}</p>
      <p className="mt-2 text-sm text-slate-500">Pay at the venue — no online payment required.</p>

      <div className="mt-8 space-y-4">
        <select
          value={selectedCourt}
          onChange={(e) => setSelectedCourt(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700"
        >
          {facility.courts?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — ₹{c.pricePerHour}/hr
            </option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700"
        />
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-4">Available slots</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {slots.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={s.availability === 'BOOKED' || bookingLoading}
            onClick={() => bookSlot(s.id)}
            className="py-3 rounded-lg border border-slate-700 hover:border-brand-500 disabled:opacity-40 text-sm"
          >
            {s.startTime}–{s.endTime}
            <span className="block text-xs text-slate-500">{s.availability}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
