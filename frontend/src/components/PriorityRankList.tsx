interface PriorityRankListProps {
  options: string[];
  selected: string[]; // order = priority, first = highest
  onChange: (next: string[]) => void;
  max?: number;
}

export default function PriorityRankList({ options, selected, onChange, max = 5 }: PriorityRankListProps) {
  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((o) => o !== option));
    } else {
      if (selected.length >= max) return;
      onChange([...selected, option]);
    }
  };

  const move = (option: string, dir: -1 | 1) => {
    const idx = selected.indexOf(option);
    const next = [...selected];
    const swapWith = idx + dir;
    if (swapWith < 0 || swapWith >= next.length) return;
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    onChange(next);
  };

  const unselected = options.filter((o) => !selected.includes(o));

  return (
    <div className="space-y-5">
      {selected.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-2">
            Your priority order (1 = highest)
          </p>
          <div className="space-y-2">
            {selected.map((option, idx) => (
              <div
                key={option}
                className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/40 rounded-xl px-3 py-2.5 animate-scaleIn transition-shadow duration-200 hover:shadow-[0_0_16px_rgba(251,191,36,0.08)]"
              >
                <span className="w-6 h-6 shrink-0 rounded-full bg-amber-500 text-slate-900 text-xs font-black font-mono flex items-center justify-center transition-transform duration-200">
                  {idx + 1}
                </span>
                <span className="flex-1 text-sm text-amber-200 font-semibold">{option}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Move ${option} up`}
                    disabled={idx === 0}
                    onClick={() => move(option, -1)}
                    className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-30 hover:border-amber-500/60 flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-90 disabled:hover:scale-100"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${option} down`}
                    disabled={idx === selected.length - 1}
                    onClick={() => move(option, 1)}
                    className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-30 hover:border-amber-500/60 flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-90 disabled:hover:scale-100"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${option}`}
                    onClick={() => toggle(option)}
                    className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-500 hover:text-red-400 hover:border-red-500/50 flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-90"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {unselected.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-2">
            {selected.length === 0 ? `Pick up to ${max}` : 'Add another'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {unselected.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggle(option)}
                disabled={selected.length >= max}
                className="text-left text-xs font-semibold text-slate-300 bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2.5 hover:border-slate-500 hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
