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

export default function VenueCard({ facility, compact = false }) {
  const gradient = sportGradients[facility.sportType] || 'from-playo-green/90 to-emerald-800/90';

  return (
    <Link
      to={`/facilities/${facility.id}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg hover:border-playo-green/30 transition-all duration-300"
    >
      <div
        className={`bg-gradient-to-br ${gradient} relative flex flex-col justify-end ${
          compact ? 'h-24 px-3.5 py-3' : 'h-36 p-5'
        }`}
      >
        <span
          className={`absolute bg-white/95 text-playo-green font-bold rounded-full shadow ${
            compact ? 'top-2 right-2 text-[10px] px-2 py-0.5' : 'top-4 right-4 text-xs px-2.5 py-1'
          }`}
        >
          ★ {facility.rating?.toFixed(1) || '4.0'}
        </span>
        <span className={`text-white/90 font-medium uppercase tracking-wide ${compact ? 'text-[10px]' : 'text-xs'}`}>
          {formatSport(facility.sportType)}
        </span>
        <h3 className={`text-white font-bold leading-tight mt-0.5 ${compact ? 'text-sm' : 'text-lg'}`}>
          {facility.name}
        </h3>
      </div>
      <div className={compact ? 'px-3.5 py-2.5' : 'p-4'}>
        <p className={`text-slate-600 flex items-center gap-1 ${compact ? 'text-xs' : 'text-sm'}`}>
          <span className="text-playo-green">📍</span>
          {facility.area || 'Lucknow'}
        </p>
        {!compact && (
          <p className="text-slate-400 text-xs mt-1 line-clamp-1">{facility.address}</p>
        )}
        {facility.courts?.length > 0 && (
          <p className={`text-playo-green font-semibold ${compact ? 'text-xs mt-1.5' : 'text-sm mt-3'}`}>
            From ₹{Math.min(...facility.courts.map((c) => Number(c.pricePerHour)))}/hr
          </p>
        )}
      </div>
    </Link>
  );
}
