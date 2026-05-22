const LETTERS = 'YOUR ONE STOP PLATFORM'.split('');

const offsets = [
  { x: -8, y: 0, r: -12 },
  { x: 4, y: -6, r: 8 },
  { x: -4, y: 4, r: -6 },
  { x: 6, y: 2, r: 10 },
  { x: 0, y: -8, r: -4 },
  { x: -6, y: 6, r: 6 },
  { x: 8, y: -2, r: -8 },
  { x: -2, y: 8, r: 4 },
  { x: 5, y: -5, r: -10 },
  { x: -5, y: 3, r: 7 },
  { x: 3, y: 6, r: -5 },
  { x: -7, y: -4, r: 9 },
  { x: 7, y: 4, r: -7 },
  { x: -3, y: -7, r: 5 },
  { x: 2, y: 7, r: -9 },
  { x: -8, y: 2, r: 11 },
  { x: 6, y: -6, r: -3 },
  { x: -4, y: 5, r: 8 },
  { x: 4, y: -3, r: -11 },
  { x: 0, y: 0, r: 0 },
];

export default function AnimatedTagline() {
  return (
    <div className="flex flex-wrap justify-center gap-1 md:gap-2 py-8 max-w-3xl mx-auto" aria-hidden>
      {LETTERS.map((char, i) => {
        if (char === ' ') {
          return <span key={i} className="w-3 md:w-6" />;
        }
        const o = offsets[i % offsets.length];
        return (
          <span
            key={i}
            className="inline-block"
            style={{ transform: `translate(${o.x}px, ${o.y}px) rotate(${o.r}deg)` }}
          >
            <span className="tagline-letter inline-flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-lg bg-white shadow-md border border-slate-100 text-sm md:text-base font-bold text-playo-green">
              {char}
            </span>
          </span>
        );
      })}
    </div>
  );
}
