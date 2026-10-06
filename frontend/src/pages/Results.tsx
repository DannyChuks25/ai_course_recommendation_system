import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import CourseCard from '../components/CourseCard';
import { displayConfidenceLabel } from '../lib/confidence';
import type { PredictionRequest, PredictionResponse } from '../types';

interface LocationState {
  recommendations: PredictionResponse;
  formData?: PredictionRequest;
}

function InsightList({ title, icon, items, tone }: { title: string; icon: string; items: string[]; tone: 'good' | 'warn' | 'neutral' }) {
  const toneClass =
    tone === 'good' ? 'border-emerald-800/40 bg-emerald-900/10' :
    tone === 'warn' ? 'border-amber-800/40 bg-amber-900/10' :
    'border-slate-800 bg-slate-900';
  const dotClass = tone === 'good' ? 'bg-emerald-400' : tone === 'warn' ? 'bg-amber-400' : 'bg-slate-500';

  return (
    <div className={`rounded-2xl border p-5 ${toneClass}`}>
      <p className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3">
        {icon} {title}
      </p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-200">
            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dotClass}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  useEffect(() => {
    if (!state?.recommendations) {
      toast.error('No recommendations found. Please complete the form.');
      navigate('/recommend');
    }
  }, [state, navigate]);

  // React Router doesn't reset scroll position on navigation, so without
  // this the page lands wherever the long, multi-step Recommend form was
  // last scrolled to instead of at the top.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  if (!state?.recommendations) return null;

  const { recommendations, formData } = state;
  const top = recommendations.top_recommendation;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-150 h-100 bg-amber-600/4 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-125 h-100 bg-orange-600/4 rounded-full blur-[100px]" />
      </div>

      <header className="relative z-10 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm sticky top-0 animate-fadeIn">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/recommend')} className="text-slate-500 hover:text-amber-400 transition-all duration-200 hover:-translate-x-0.5" aria-label="Go back">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-white font-black text-lg tracking-tight">Your Recommendations</h1>
              <p className="text-slate-500 text-xs font-mono">{recommendations.top_five.length} courses matched your profile</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/recommend')}
            className="hidden sm:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs font-mono uppercase tracking-wider px-4 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
          >
            Try Again
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Hero: top pick */}
        <div className="mb-10 animate-fadeInUp">
          <p className="text-amber-400 text-xs font-mono uppercase tracking-widest mb-2">✦ AI Analysis Complete</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-6">
            {top.course}
            <span className="text-amber-400"> is your top match</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Top Match', value: displayConfidenceLabel(top.confidence_score), sub: 'confidence score', icon: '🏆' },
              { label: 'Courses Found', value: recommendations.top_five.length.toString(), sub: 'in your top 3', icon: '📋' },
              { label: 'JAMB Score', value: formData?.jamb_score?.toString() ?? '—', sub: 'UTME total', icon: '📝' },
              { label: 'Profile Type', value: formData?.student_type ?? '—', sub: 'student stream', icon: '🎓' },
            ].map((stat, idx) => (
              <div
                key={stat.label}
                style={{ animationDelay: `${idx * 60}ms` }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-start gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700 animate-fadeInUp"
              >
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="text-white font-black text-lg capitalize">{stat.value}</p>
                  <p className="text-slate-500 text-xs font-mono">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-amber-900/20 border border-amber-800/40 rounded-xl px-4 py-3 flex items-start gap-2.5">
            <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-amber-200 text-sm">{recommendations.note}</p>
          </div>
        </div>

        {/* Strengths / weaknesses / improvement areas */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="animate-fadeInUp" style={{ animationDelay: '80ms' }}>
            <InsightList title="Strengths" icon="💪" items={recommendations.student_strengths} tone="good" />
          </div>
          <div className="animate-fadeInUp" style={{ animationDelay: '140ms' }}>
            <InsightList title="Weaker Areas" icon="⚠️" items={recommendations.student_weaknesses} tone="warn" />
          </div>
          <div className="animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            <InsightList title="Suggested Improvements" icon="🎯" items={recommendations.improvement_areas} tone="neutral" />
          </div>
        </div> */}

        {/* University preference notes */}
        {recommendations.university_preference_notes.length > 0 && (
          <div className="mb-10 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3">🏛️ University Preference Notes</p>
            <ul className="space-y-2">
              {recommendations.university_preference_notes.map((note, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-slate-600 text-xs font-mono uppercase tracking-widest">Top 3 Recommendations</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Results grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendations.top_five.map((course, idx) => (
            <div key={`${course.course}-${idx}`} className="animate-fadeInUp" style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}>
              <CourseCard recommendation={course} />
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl px-8 py-6">
            <div className="text-left">
              <p className="text-white font-bold text-sm">Not satisfied with these results?</p>
              <p className="text-slate-400 text-xs mt-0.5">Adjust your profile for better recommendations.</p>
            </div>
            <button
              onClick={() => navigate('/recommend')}
              className="whitespace-nowrap bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-[0_0_16px_rgba(251,191,36,0.3)] hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
            >
              Retake Assessment
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
