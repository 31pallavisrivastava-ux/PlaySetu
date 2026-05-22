import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-20">
      <div className="max-w-2xl">
        <p className="text-brand-500 font-medium mb-3">Lucknow · Agentic booking</p>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white mb-6">
          Discover courts, turfs & pools — book in seconds
        </h1>
        <p className="text-lg text-slate-400 mb-10">
          PlaySetu unifies badminton, football, cricket nets, swimming and more across Gomti Nagar,
          Chinhat, Aliganj, and all of Lucknow. Ask the AI assistant or browse live slots.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/facilities"
            className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-500"
          >
            Explore facilities
          </Link>
          <Link
            to="/ai"
            className="px-6 py-3 rounded-xl border border-slate-600 text-slate-200 font-semibold hover:border-brand-500"
          >
            Talk to AI
          </Link>
        </div>
      </div>
      <div className="mt-16 grid sm:grid-cols-3 gap-6">
        {[
          { title: 'Real-time slots', desc: 'Instant booking — pay at the venue, no payment gateway' },
          { title: 'AI booking', desc: 'Natural language: "badminton near Gomti tomorrow under ₹500"' },
          { title: 'Owner dashboard', desc: 'Courts, pricing, slots & revenue for facility partners' },
        ].map((card) => (
          <div key={card.title} className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="font-semibold text-white mb-2">{card.title}</h3>
            <p className="text-slate-400 text-sm">{card.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
