import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { LUCKNOW_AREAS, POPULAR_SPORTS, formatSport } from '../constants/sports.js';

const EMPTY_FORM = {
  name: '',
  description: '',
  sportType: 'badminton',
  address: '',
  area: 'Gomti Nagar',
  latitude: 26.85,
  longitude: 81.01,
  openingTime: '06:00',
  closingTime: '22:00',
};

const STATUS_LABEL = {
  ACTIVE: { text: 'Enabled', class: 'bg-playo-green-light text-playo-green' },
  INACTIVE: { text: 'Disabled', class: 'bg-slate-100 text-slate-500' },
  PENDING: { text: 'Pending', class: 'bg-amber-50 text-amber-700' },
};

export default function OwnerVenuesPanel({ onChanged, hideToolbar, onToolbarReady }) {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    api
      .get('/owner/facilities')
      .then((r) => setVenues(r.data.data))
      .catch(() => setVenues([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    onToolbarReady?.({ openCreate, venueCount: venues.length });
  }, [onToolbarReady, venues.length]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError('');
  }

  function openEdit(venue) {
    setEditingId(venue.id);
    setForm({
      name: venue.name,
      description: venue.description || '',
      sportType: venue.sportType,
      address: venue.address,
      area: venue.area || '',
      latitude: venue.latitude,
      longitude: venue.longitude,
      openingTime: venue.openingTime,
      closingTime: venue.closingTime,
    });
    setShowForm(true);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await api.patch(`/owner/facilities/${editingId}`, form);
      } else {
        await api.post('/owner/facilities', form);
      }
      setShowForm(false);
      load();
      onChanged?.();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(venue) {
    const next = venue.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/owner/facilities/${venue.id}/status`, { status: next });
      load();
      onChanged?.();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Could not update status');
    }
  }

  async function handleDelete(venue) {
    if (!confirm(`Delete "${venue.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/owner/facilities/${venue.id}`);
      load();
      onChanged?.();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Delete failed');
    }
  }

  if (loading) return <p className="text-slate-400">Loading venues…</p>;

  return (
    <div className="space-y-6">
      {!hideToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">{venues.length} venue(s) you manage</p>
          <button type="button" onClick={openCreate} className="btn-playo text-sm py-2 px-4">
            + Add venue
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-playo-navy mb-4">
            {editingId ? 'Edit venue' : 'New venue'}
          </h3>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Field label="Sport" as="select" value={form.sportType} onChange={(v) => setForm({ ...form, sportType: v })}>
              {POPULAR_SPORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Field>
            <Field label="Area" as="select" value={form.area} onChange={(v) => setForm({ ...form, area: v })}>
              {LUCKNOW_AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Field>
            <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} required />
            <Field
              label="Latitude"
              type="number"
              step="any"
              value={form.latitude}
              onChange={(v) => setForm({ ...form, latitude: Number(v) })}
            />
            <Field
              label="Longitude"
              type="number"
              step="any"
              value={form.longitude}
              onChange={(v) => setForm({ ...form, longitude: Number(v) })}
            />
            <Field label="Opens" value={form.openingTime} onChange={(v) => setForm({ ...form, openingTime: v })} />
            <Field label="Closes" value={form.closingTime} onChange={(v) => setForm({ ...form, closingTime: v })} />
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-400 uppercase">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-playo mt-1 min-h-[80px]"
                rows={3}
              />
            </div>
            {error && <p className="sm:col-span-2 text-red-500 text-sm">{error}</p>}
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-playo disabled:opacity-50">
                {saving ? 'Saving…' : editingId ? 'Update venue' : 'Create venue'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-playo-outline">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {venues.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-500">No venues yet. Add your first court or turf.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {venues.map((v) => {
            const st = STATUS_LABEL[v.status] || STATUS_LABEL.PENDING;
            return (
              <div
                key={v.id}
                className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-playo-navy">{v.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${st.class}`}>
                      {st.text}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {formatSport(v.sportType)} · {v.area} · {v.courts?.length ?? 0} court(s)
                  </p>
                  <p className="text-xs text-slate-400 mt-1 truncate">{v.address}</p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleStatus(v)}
                    className={`text-sm font-semibold px-3 py-2 rounded-lg border ${
                      v.status === 'ACTIVE'
                        ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        : 'border-playo-green text-playo-green hover:bg-playo-green-light'
                    }`}
                  >
                    {v.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(v)}
                    className="text-sm font-semibold px-3 py-2 rounded-lg border border-slate-200 text-playo-navy hover:border-playo-green"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(v)}
                    className="text-sm font-semibold px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, as = 'input', type = 'text', step, children, required }) {
  const cls = 'input-playo mt-1';
  return (
    <div>
      <label className="text-xs font-semibold text-slate-400 uppercase">{label}</label>
      {as === 'select' ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={cls} required={required}>
          {children}
        </select>
      ) : (
        <input
          type={type}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cls}
          required={required}
        />
      )}
    </div>
  );
}
