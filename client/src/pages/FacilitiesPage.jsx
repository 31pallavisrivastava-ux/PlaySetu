import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client.js';
import VenueCard from '../components/VenueCard.jsx';
import { POPULAR_SPORTS, LUCKNOW_AREAS, formatSport } from '../constants/sports.js';

export default function FacilitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [sportType, setSportType] = useState(searchParams.get('sport') || '');
  const [area, setArea] = useState(searchParams.get('area') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sport = searchParams.get('sport') || '';
    const ar = searchParams.get('area') || '';
    setSportType(sport);
    setArea(ar);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    api
      .get('/facilities', { params: { sportType: sportType || undefined, area: area || undefined } })
      .then((res) => setItems(res.data.data.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [sportType, area]);

  function updateFilters(nextSport, nextArea) {
    const params = new URLSearchParams();
    if (nextSport) params.set('sport', nextSport);
    if (nextArea) params.set('area', nextArea);
    setSearchParams(params);
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-8">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-playo-navy">Book venues</h1>
          <p className="text-slate-500 mt-2">Find courts, turfs & pools near you in Lucknow</p>

          <div className="mt-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Sport</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateFilters('', area)}
                className={`chip ${!sportType ? 'chip-active' : 'chip-inactive'}`}
              >
                All sports
              </button>
              {POPULAR_SPORTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => updateFilters(s.id, area)}
                  className={`chip ${sportType === s.id ? 'chip-active' : 'chip-inactive'}`}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Area</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateFilters(sportType, '')}
                className={`chip ${!area ? 'chip-active' : 'chip-inactive'}`}
              >
                All Lucknow
              </button>
              {LUCKNOW_AREAS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => updateFilters(sportType, a)}
                  className={`chip ${area === a ? 'chip-active' : 'chip-inactive'}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-sm text-slate-500 mb-6">
          {loading ? 'Searching…' : `${items.length} venue${items.length !== 1 ? 's' : ''} found`}
          {sportType && ` · ${formatSport(sportType)}`}
          {area && ` · ${area}`}
        </p>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <p className="text-4xl mb-4">🏟️</p>
            <p className="font-semibold text-playo-navy">No venues found</p>
            <p className="text-slate-500 text-sm mt-2">Try another sport or area</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((f) => (
              <VenueCard key={f.id} facility={f} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
