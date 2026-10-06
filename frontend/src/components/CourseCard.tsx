import { useState } from 'react';
import type { CourseRecommendation } from '../types';
import { displayConfidencePercent } from '../lib/confidence';

interface CourseCardProps {
  recommendation: CourseRecommendation;
}

// Bands are evaluated against the DISPLAYED percentage (post-transform),
// so the color always matches what the user actually reads on screen.
const getConfidenceColor = (displayPercent: number): string => {
  if (displayPercent >= 80) return 'text-emerald-400';
  if (displayPercent >= 65) return 'text-amber-400';
  if (displayPercent >= 50) return 'text-orange-400';
  return 'text-red-400';
};

const getConfidenceBarColor = (displayPercent: number): string => {
  if (displayPercent >= 80) return 'from-emerald-600 to-emerald-400';
  if (displayPercent >= 65) return 'from-amber-600 to-amber-400';
  if (displayPercent >= 50) return 'from-orange-600 to-orange-400';
  return 'from-red-600 to-red-400';
};

export default function CourseCard({ recommendation }: CourseCardProps) {
  const [expanded, setExpanded] = useState(recommendation.rank === 1);
  const rank = recommendation.rank;
  // Display-only transform (see lib/confidence.ts) — ordering/backend
  // logic still uses the untouched recommendation.confidence_score.
  const displayPercent = displayConfidencePercent(recommendation.confidence_score * 100);
  const confColor = getConfidenceColor(displayPercent);
  const barColor = getConfidenceBarColor(displayPercent);
  const isTop = rank <= 3;

  return (
    <div
      className={`group relative bg-slate-900 border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1
        ${rank === 1 ? 'border-amber-500/60 shadow-[0_0_20px_rgba(251,191,36,0.15)] hover:shadow-[0_0_28px_rgba(251,191,36,0.22)]' : 'border-slate-700/60 hover:border-slate-600 hover:shadow-lg hover:shadow-black/20'}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-black font-mono
          ${rank === 1 ? 'bg-amber-500 text-slate-900' :
            rank === 2 ? 'bg-slate-400 text-slate-900' :
            rank === 3 ? 'bg-amber-800 text-amber-100' :
            'bg-slate-800 text-slate-400 border border-slate-700'}`}
        >
          #{rank}
        </div>
        {isTop && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border font-mono tracking-wide
            ${rank === 1 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
              rank === 2 ? 'bg-slate-400/10 border-slate-400/30 text-slate-300' :
              'bg-amber-900/20 border-amber-800/30 text-amber-600'}`}
          >
            {rank === 1 ? '🏆 Top Pick' : rank === 2 ? '🥈 Runner-up' : '🥉 3rd Place'}
          </span>
        )}
      </div>

      <h3 className="text-white font-bold text-lg leading-snug mb-4 group-hover:text-amber-100 transition-colors duration-200">
        {recommendation.course}
      </h3>

      {/* Confidence */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 text-xs font-mono uppercase tracking-wider">Confidence</span>
          <span className={`text-sm font-black font-mono ${confColor}`}>{displayPercent.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full bg-linear-to-r ${barColor} rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${Math.max(displayPercent, 3)}%` }}
          />
        </div>
      </div>

      {/* Reasons */}
      {recommendation.reasons.length > 0 && (
        <ul className="space-y-1.5 mb-4">
          {recommendation.reasons.slice(0, 3).map((reason, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
              <svg className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {reason}
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-1.5 text-xs font-mono text-amber-400 hover:text-amber-300 transition-colors duration-150 border-t border-slate-800 pt-3 w-full"
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
        {expanded ? 'Show less' : 'Career pathways & skills'}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 animate-fadeIn">
          {recommendation.career_pathways.length > 0 && (
            <div>
              <p className="text-slate-500 text-[10px] font-mono uppercase tracking-wider mb-1.5">Pathways</p>
              <div className="flex flex-wrap gap-1.5">
                {recommendation.career_pathways.map((p) => (
                  <span key={p} className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full">{p}</span>
                ))}
              </div>
            </div>
          )}
          {recommendation.similar_careers.length > 0 && (
            <div>
              <p className="text-slate-500 text-[10px] font-mono uppercase tracking-wider mb-1.5">Similar careers</p>
              <div className="flex flex-wrap gap-1.5">
                {recommendation.similar_careers.map((c) => (
                  <span key={c} className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full">{c}</span>
                ))}
              </div>
            </div>
          )}
          {recommendation.recommended_skills.length > 0 && (
            <div>
              <p className="text-slate-500 text-[10px] font-mono uppercase tracking-wider mb-1.5">Skills to learn</p>
              <div className="flex flex-wrap gap-1.5">
                {recommendation.recommended_skills.map((s) => (
                  <span key={s} className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-amber-500/0 to-transparent opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}
