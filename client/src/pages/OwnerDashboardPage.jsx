import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuthStore } from '../store/authStore.js';
import { formatSport } from '../constants/sports.js';
import OwnerVenuesPanel from '../components/OwnerVenuesPanel.jsx';

const STATUS_STYLES = {
  CONFIRMED: 'bg-playo-green-light text-playo-green',
  PENDING: 'bg-amber-50 text-amber-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
  COMPLETED: 'bg-blue-50 text-blue-700',
};

function formatDate(d) {
  if (!d) return '';
  const s = typeof d === 'string' ? d : new Date(d).toISOString();
  return s.slice(0, 10);
}

const OWNER_TABS = [
  { id: 'venues', label: 'My venues' },
  { id: 'slots', label: 'Slot schedule' },
  { id: 'bookings', label: 'Bookings' },
];

const SLOT_STYLES = {
  AVAILABLE: 'border-slate-200 bg-white text-slate-600',
  LOCKED: 'border-amber-200 bg-amber-50 text-amber-800',
  BOOKED: 'border-playo-green/40 bg-playo-green-light text-playo-navy',
};

export default function OwnerDashboardPage() {
  const { user, accessToken } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('venues');
  const [summary, setSummary] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [facilityId, setFacilityId] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [slotsData, setSlotsData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const venuesToolbarRef = useRef(null);
  const handleVenuesToolbarReady = useCallback((actions) => {
    venuesToolbarRef.current = actions;
  }, []);

  useEffect(() => {
    if (!accessToken) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'OWNER' && user?.role !== 'ADMIN') {
      navigate('/facilities');
    }
  }, [accessToken, user, navigate]);

  function loadFacilities() {
    return api.get('/owner/facilities').then((r) => {
      setFacilities(r.data.data);
      if (r.data.data.length === 1) setFacilityId(r.data.data[0].id);
      return r.data.data;
    });
  }

  useEffect(() => {
    if (!accessToken) return;
    api.get('/owner/summary').then((r) => setSummary(r.data.data));
    loadFacilities();
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || tab === 'venues') return;
    setLoading(true);
    const params = { date, ...(facilityId ? { facilityId } : {}) };

    Promise.all([
      api.get('/owner/slots', { params }),
      api.get('/owner/bookings', { params }),
    ])
      .then(([slotsRes, bookingsRes]) => {
        setSlotsData(slotsRes.data.data);
        setBookings(bookingsRes.data.data);
      })
      .catch(() => {
        setSlotsData(null);
        setBookings([]);
      })
      .finally(() => setLoading(false));
  }, [accessToken, date, facilityId, tab]);

  if (!user) return null;

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-playo-green text-sm font-semibold uppercase tracking-wide">Venue manager</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-playo-navy mt-1">Venue dashboard</h1>
          <p className="text-slate-500 text-sm mt-2">
            Manage venues, slot schedules, and confirmed bookings in one place.
          </p>

          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {[
                { label: 'Venues', value: summary.facilityCount },
                { label: 'Today', value: summary.todayBookings },
                { label: 'Upcoming', value: summary.upcomingConfirmed },
                { label: 'Revenue', value: `₹${summary.totalRevenue}` },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase font-semibold">{s.label}</p>
                  <p className="text-xl font-bold text-playo-navy mt-1">{s.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6 space-y-4">
          <div
            role="tablist"
            aria-label="Venue manager sections"
            className="flex flex-wrap gap-2 border-b border-slate-100 pb-4"
          >
            {OWNER_TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`chip ${tab === id ? 'chip-active' : 'chip-inactive'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            {tab === 'venues' ? (
              <>
                <p className="text-sm text-slate-500">
                  {facilities.length} venue{facilities.length === 1 ? '' : 's'} you manage
                </p>
                <button
                  type="button"
                  onClick={() => venuesToolbarRef.current?.openCreate?.()}
                  className="btn-playo text-sm py-2 px-4"
                >
                  + Add venue
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-wrap gap-3 items-end">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Venue
                    </label>
                    <select
                      value={facilityId}
                      onChange={(e) => setFacilityId(e.target.value)}
                      className="input-playo mt-1 min-w-[200px]"
                    >
                      <option value="">All venues</option>
                      {facilities.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="input-playo mt-1"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  {tab === 'slots' ? 'Court slots for the selected day' : 'Confirmed bookings for the selected day'}
                </p>
              </>
            )}
          </div>
        </div>

        {tab === 'venues' ? (
          <OwnerVenuesPanel
            hideToolbar
            onToolbarReady={handleVenuesToolbarReady}
            onChanged={() => {
              loadFacilities();
              api.get('/owner/summary').then((r) => setSummary(r.data.data));
            }}
          />
        ) : loading ? (
          <p className="text-slate-400">Loading…</p>
        ) : tab === 'slots' ? (
          <SlotsSchedule data={slotsData} />
        ) : (
          <BookingsList bookings={bookings} />
        )}
      </div>
    </div>
  );
}

function SlotsSchedule({ data }) {
  if (!data?.facilities?.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500">
        No venues or slots for this date.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.facilities.map((facility) => (
        <div key={facility.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-playo-navy">{facility.name}</h2>
              <p className="text-xs text-slate-500">
                {formatSport(facility.sportType)} · {facility.area}
              </p>
            </div>
            <Link to={`/facilities/${facility.id}`} className="text-sm text-playo-green font-semibold">
              View public page →
            </Link>
          </div>
          {facility.courts.map((court) => (
            <div key={court.id} className="px-5 py-4 border-b border-slate-50 last:border-0">
              <p className="text-sm font-semibold text-slate-700 mb-3">{court.name}</p>
              {court.slots.length === 0 ? (
                <p className="text-xs text-slate-400">No slots on this date</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {court.slots.map((slot) => {
                    const booking = slot.bookings?.[0];
                    return (
                      <div
                        key={slot.id}
                        className={`rounded-lg border px-2 py-2 text-xs ${SLOT_STYLES[slot.availability] ?? SLOT_STYLES.AVAILABLE}`}
                      >
                        <p className="font-semibold">
                          {slot.startTime}–{slot.endTime}
                        </p>
                        <p className="mt-1 opacity-80 capitalize">{slot.availability.toLowerCase()}</p>
                        {booking && (
                          <p className="mt-1 font-medium truncate" title={booking.user?.name}>
                            {booking.user?.name}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function BookingsList({ bookings }) {
  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500">
        No confirmed bookings for this filter.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100">
      {bookings.map((b) => (
        <div key={b.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="font-bold text-playo-navy">{b.slot?.court?.facility?.name}</p>
            <p className="text-sm text-slate-600">
              {b.slot?.court?.name} · {formatDate(b.slot?.date)} · {b.slot?.startTime}–{b.slot?.endTime}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {b.user?.name}
              {b.user?.phone && ` · ${b.user.phone}`}
              {b.user?.email && ` · ${b.user.email}`}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[b.bookingStatus]}`}>
              {b.bookingStatus}
            </span>
            <span className="font-bold text-playo-green">₹{b.totalAmount}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
