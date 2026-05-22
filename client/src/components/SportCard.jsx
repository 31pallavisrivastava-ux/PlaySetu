import { Link } from 'react-router-dom';

export default function SportCard({ sport }) {
  return (
    <Link
      to={`/facilities?sport=${sport.id}`}
      className="group flex flex-col items-center text-center"
    >
      <div
        className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${sport.gradient} shadow-lg flex items-center justify-center text-3xl md:text-4xl transition-transform group-hover:scale-105 group-hover:shadow-xl`}
      >
        {sport.emoji}
      </div>
      <p className="mt-3 font-semibold text-slate-800 text-sm md:text-base">{sport.label}</p>
      <p className="text-xs text-slate-500 mt-0.5">{sport.tagline}</p>
    </Link>
  );
}
