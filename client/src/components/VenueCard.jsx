import { Link } from 'react-router-dom';
import { formatSport } from '../constants/sports.js';

const sportGradients = {
  badminton: 'from-emerald-500/90 to-teal-700/90',
  football: 'from-green-600/90 to-emerald-800/90',
  cricket: 'from-lime-600/90 to-green-800/90',
  swimming: 'from-cyan-500/90 to-blue-700/90',
  table_tennis: 'from-amber-500/90 to-orange-600/90',
  kabaddi: 'from-orange-500/90 to-red-600/90',
};

export default function VenueCard({ facility }) {
  const gradient = sportGradients[facility.sportType] || 'from-playo-green/90 to-emerald-800/90';

  return (
    <Link
      to={`/facilities/${facility.id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:border-playo-green/30 transition-all duration-300"
    >
      <div className={`h-36 bg-gradient-to-br ${gradient} relative p-5 flex flex-col justify-end`}>
        <span className="absolute top-4 right-4 bg-white/95 text-playo-green text-xs font-bold px-2.5 py-1 rounded-full shadow">
          ★ {facility.rating?.toFixed(1) || '4.0'}
        </span>
        <span className="text-white/90 text-xs font-medium uppercase tracking-wide">
          {formatSport(facility.sportType)}
        </span>
        <h3 className="text-white font-bold text-lg leading-tight mt-1">{facility.name}</h3>
      </div>
      <div className="p-4">
        <p className="text-slate-600 text-sm flex items-center gap-1">
          <span className="text-playo-green">📍</span>
          {facility.area || 'Lucknow'}
        </p>
        <p className="text-slate-400 text-xs mt-1 line-clamp-1">{facility.address}</p>
        {facility.courts?.length > 0 && (
          <p className="text-playo-green font-semibold text-sm mt-3">
            From ₹{Math.min(...facility.courts.map((c) => Number(c.pricePerHour)))}/hr
          </p>
        )}
      </div>
    </Link>
  );
}
