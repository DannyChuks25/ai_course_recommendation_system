// Shared style tokens so every wizard step looks consistent with the
// original dark-slate / amber-accent / monospace-label visual language.

export const inputClass =
  'w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm font-mono ' +
  'hover:border-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 ' +
  'focus:shadow-[0_0_0_4px_rgba(251,191,36,0.08)] placeholder-slate-500 transition-all duration-200 ' +
  'appearance-none focus:scale-[1.005]';

export const labelClass = 'block text-xs font-semibold uppercase tracking-widest text-slate-400 font-mono mb-2';

export const helpTextClass = 'text-slate-600 text-xs mt-1.5 font-mono';

export const primaryButtonClass =
  'flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-sm uppercase tracking-widest ' +
  'py-3.5 rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(251,191,36,0.35)] hover:-translate-y-0.5 ' +
  'active:scale-[0.98] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ' +
  'flex items-center justify-center gap-2';

export const secondaryButtonClass =
  'flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 font-bold text-sm ' +
  'uppercase tracking-widest py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 ' +
  'active:scale-[0.98] active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0';

export const sectionTitleClass = 'text-2xl font-black text-white mb-1 tracking-tight';
export const sectionSubtitleClass = 'text-slate-400 text-sm';

export const pillBase =
  'relative group text-left rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0';
export const pillSelected =
  'bg-amber-500/15 border-amber-500/60 shadow-[0_0_16px_rgba(251,191,36,0.12)]';
export const pillUnselected =
  'bg-slate-800/60 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800';
