import { Link } from 'react-router-dom';
import AnimatedTagline from '../components/AnimatedTagline.jsx';
import SportCard from '../components/SportCard.jsx';
import { POPULAR_SPORTS, LUCKNOW_AREAS } from '../constants/sports.js';

export default function HomePage() {
  return (
    <>
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-playo-green/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-12 pb-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-playo-navy leading-[1.15] tracking-tight">
              Book sports venues.
              <br />
              <span className="text-playo-green">Join games.</span>
              <br />
              Find courts near you.
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              Lucknow&apos;s platform to book badminton courts, football turfs, cricket nets, swimming
              pools & more — with AI-powered search across Gomti Nagar, Chinhat, and beyond.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/facilities" className="btn-playo text-base px-8">
                Book a venue
              </Link>
              <Link to="/ai" className="btn-playo-outline text-base px-8">
                Ask AI assistant
              </Link>
            </div>
          </div>

          <AnimatedTagline />

          <div className="flex justify-center gap-4 md:gap-8 mt-4 flex-wrap">
            {['🏸', '⚽', '🏏'].map((emoji, i) => (
              <div
                key={i}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center text-3xl md:text-4xl"
                style={{ transform: `rotate(${i * 8 - 8}deg)` }}
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-playo-navy text-center">Popular Sports</h2>
        <p className="text-slate-500 text-center mt-2 text-sm">Tap a sport to find venues in Lucknow</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6 md:gap-8 mt-10">
          {POPULAR_SPORTS.map((sport) => (
            <SportCard key={sport.id} sport={sport} />
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-playo-navy text-center">
            Top areas in Lucknow
          </h2>
          <p className="text-slate-500 text-center mt-2 text-sm">Browse sports complexes by locality</p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {LUCKNOW_AREAS.map((area) => (
              <Link
                key={area}
                to={`/facilities?area=${encodeURIComponent(area)}`}
                className="chip chip-inactive hover:shadow-sm"
              >
                {area}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="rounded-3xl bg-gradient-to-r from-playo-green to-emerald-600 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-white shadow-xl">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold">Get the PlaySetu experience</h3>
            <p className="mt-2 text-emerald-50 max-w-md">
              Instant booking, live slots, and an AI that understands &quot;badminton near Gomti under
              ₹500&quot;.
            </p>
          </div>
          <Link
            to="/facilities"
            className="shrink-0 px-8 py-3 rounded-full bg-white text-playo-green font-bold hover:bg-emerald-50 transition shadow-lg"
          >
            Start booking
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16 grid md:grid-cols-3 gap-6">
        {[
          {
            title: 'Book in seconds',
            desc: 'Pick a slot and confirm instantly — pay at the venue.',
            icon: '⚡',
          },
          {
            title: 'AI-powered search',
            desc: 'Describe what you need; we find courts, times & budget.',
            icon: '🤖',
          },
          {
            title: 'Trusted venues',
            desc: 'Rated facilities across Lucknow with real availability.',
            icon: '⭐',
          },
        ].map((card) => (
          <div
            key={card.title}
            className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition"
          >
            <span className="text-3xl">{card.icon}</span>
            <h3 className="font-bold text-playo-navy mt-4">{card.title}</h3>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </section>
    </>
  );
}
