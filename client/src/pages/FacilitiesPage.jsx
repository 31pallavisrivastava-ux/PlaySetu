import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';

const AREAS = ['', 'Gomti Nagar', 'Chinhat', 'Aliganj', 'Hazratganj', 'SAI Lucknow'];
const SPORTS = ['', 'badminton', 'football', 'cricket', 'swimming'];

export default function FacilitiesPage() {
  const [items, setItems] = useState([]);
  const [sportType, setSportType] = useState('');
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get('/facilities', { params: { sportType: sportType || undefined, area: area || undefined } })
      .then((res) => setItems(res.data.data.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [sportType, area]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Discover facilities</h1>
      <div className="flex flex-wrap gap-3 mb-8">
        <select
          value={sportType}
          onChange={(e) => setSportType(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700"
        >
          {SPORTS.map((s) => (
            <option key={s} value={s}>
              {s || 'All sports'}
            </option>
          ))}
        </select>
        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700"
        >
          {AREAS.map((a) => (
            <option key={a} value={a}>
              {a || 'All areas'}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((f) => (
            <Link
              key={f.id}
              to={`/facilities/${f.id}`}
              className="block p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-600 transition"
            >
              <div className="flex justify-between items-start">
                <h2 className="font-semibold text-lg">{f.name}</h2>
                <span className="text-brand-500 text-sm">★ {f.rating?.toFixed(1)}</span>
              </div>
              <p className="text-slate-400 text-sm mt-1 capitalize">
                {f.sportType?.replace('_', ' ')} · {f.area}
              </p>
              <p className="text-slate-500 text-sm mt-2 line-clamp-1">{f.address}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
