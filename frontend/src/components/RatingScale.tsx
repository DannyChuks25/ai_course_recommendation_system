interface RatingScaleProps {
  value?: number;
  onChange: (value: number) => void;
  scale: Record<string, string>; // e.g. {"1":"Strongly Disagree", ..., "5":"Strongly Agree"}
}

export default function RatingScale({ value, onChange, scale }: RatingScaleProps) {
  const options = Object.keys(scale)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {options.map((n) => {
        const selected = value === n;
        return (
          <button
            key={n}
            type="button"
            title={scale[String(n)]}
            aria-label={scale[String(n)]}
            aria-pressed={selected}
            onClick={() => onChange(n)}
            className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-lg border text-xs font-black font-mono transition-all duration-150 active:scale-90
              ${selected
                ? 'bg-amber-500 border-amber-500 text-slate-900 shadow-[0_0_12px_rgba(251,191,36,0.35)] scale-105'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 hover:scale-105'
              }`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
