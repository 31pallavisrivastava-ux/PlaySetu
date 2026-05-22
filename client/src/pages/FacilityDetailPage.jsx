import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuthStore } from '../store/authStore.js';
import { formatSport } from '../constants/sports.js';

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

  if (!facility) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="h-8 w-48 bg-slate-200 rounded mx-auto animate-pulse" />
      </div>
    );
  }

  const court = facility.courts?.find((c) => c.id === selectedCourt);

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-gradient-to-br from-playo-green to-emerald-700 text-white">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <Link to="/facilities" className="text-emerald-100 text-sm hover:text-white">
            ← Back to venues
          </Link>
          <p className="text-emerald-100 text-sm font-medium mt-4 uppercase tracking-wide">
            {formatSport(facility.sportType)}
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-1">{facility.name}</h1>
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-emerald-50">
            <span>★ {facility.rating?.toFixed(1)}</span>
            <span>📍 {facility.area}</span>
            <span>{facility.openingTime} – {facility.closingTime}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8">
          <p className="text-slate-600">{facility.description}</p>
          <p className="text-sm text-playo-green font-medium mt-3 bg-playo-green-light inline-block px-3 py-1 rounded-full">
            Pay at venue — no online payment
          </p>
          <p className="text-slate-400 text-sm mt-4">{facility.address}</p>

          <hr className="my-8 border-slate-100" />

          <h2 className="font-bold text-playo-navy text-lg">Select court & date</h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Court</label>
              <select
                value={selectedCourt}
                onChange={(e) => setSelectedCourt(e.target.value)}
                className="input-playo mt-1"
              >
                {facility.courts?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — ₹{c.pricePerHour}/hr
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-playo mt-1"
              />
            </div>
          </div>

          {court && (
            <p className="mt-4 text-playo-green font-bold text-lg">
              ₹{court.pricePerHour} <span className="text-slate-400 font-normal text-sm">/ hour</span>
            </p>
          )}

          <h2 className="font-bold text-playo-navy text-lg mt-8 mb-4">Available slots</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {slots.length === 0 ? (
              <p className="col-span-full text-slate-400 text-sm">No slots for this date</p>
            ) : (
              slots.map((s) => {
                const booked = s.availability === 'BOOKED';
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={booked || bookingLoading}
                    onClick={() => bookSlot(s.id)}
                    className={`py-4 rounded-xl border-2 text-sm font-semibold transition ${
                      booked
                        ? 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'
                        : 'border-playo-green/30 text-playo-navy hover:bg-playo-green hover:text-white hover:border-playo-green'
                    }`}
                  >
                    {s.startTime} – {s.endTime}
                    <span className="block text-xs font-normal mt-1 opacity-80">
                      {booked ? 'Booked' : 'Book now'}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
