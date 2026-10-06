import { useEffect, useMemo, useRef, useState } from 'react';
import { inputClass } from '../lib/formStyles';
import type { University } from '../types';

interface UniversitySelectProps {
  universities: University[];
  value: string;
  onSelect: (university: University) => void;
}

export default function UniversitySelect({ universities, value, onSelect }: UniversitySelectProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep the visible text in sync if the value changes from outside
  // (e.g. cleared elsewhere in the form).
  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return universities;
    return universities.filter(
      (u) => u.name.toLowerCase().includes(q) || u.state.toLowerCase().includes(q)
    );
  }, [query, universities]);

  const handlePick = (u: University) => {
    setQuery(u.name);
    setOpen(false);
    onSelect(u);
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        placeholder="Search Nigerian universities…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className={inputClass}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />

      {open && (
        <div className="absolute z-20 mt-1.5 w-full max-h-64 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl animate-scaleIn origin-top">
          {filtered.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-4">No universities match "{query}".</p>
          )}
          {filtered.map((u) => (
            <button
              key={u.name}
              type="button"
              onClick={() => handlePick(u)}
              className="w-full text-left px-4 py-2.5 hover:bg-slate-800 transition-colors duration-100 flex items-center justify-between gap-3 border-b border-slate-800/60 last:border-b-0"
            >
              <span className="text-sm text-slate-200">{u.name}</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-0.5 shrink-0">
                {u.ownership}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
