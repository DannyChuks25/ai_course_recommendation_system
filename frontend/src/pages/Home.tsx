import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { icon: '📚', title: 'Rich Subject Profile', desc: 'Only enter the WAEC subjects you actually offered — grades feed real academic strength scores.' },
  { icon: '🧠', title: 'Aptitude Assessment', desc: 'A 24-question assessment measures logic, creativity, leadership and more.' },
  { icon: '🗺️', title: 'Career Interest Map', desc: 'Drill from broad fields like Technology or Health into specific paths like AI or Nursing.' },
  { icon: '🎯', title: 'Goal-Aware Ranking', desc: 'Rank your career goals — courses that match your #1 goal get a transparent boost.' },
  { icon: '🏛️', title: 'University Preferences', desc: 'Zone, ownership, budget and hostel preferences shape practical guidance notes.' },
  { icon: '💡', title: 'Explained Results', desc: 'Every recommendation comes with the real reasons behind it — no black box.' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-150 h-150 bg-amber-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-125 h-100 bg-orange-600/5 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Hero */}
        <div className="text-center py-24 animate-fadeInUp">
          <p className="text-amber-400 text-xs font-mono uppercase tracking-widest mb-4">✦ AI-Powered Course Guidance</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-6">
            Find the university course<br />built for <span className="text-amber-400">who you actually are</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
            Grades, aptitude, interests, work style, career goals, and university preferences —
            combined into one explained, evidence-backed recommendation.
          </p>
          <button
            onClick={() => navigate('/recommend')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-sm uppercase tracking-widest px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-[0_0_24px_rgba(251,191,36,0.35)] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
          >
            Start Your Assessment →
          </button>
          <p className="text-slate-600 text-xs font-mono mt-4">Takes about 8–10 minutes · 8 short steps</p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-24">
          {FEATURES.map((f, idx) => (
            <div
              key={f.title}
              style={{ animationDelay: `${idx * 70}ms` }}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 transition-all duration-200 hover:border-slate-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 animate-fadeInUp group"
            >
              <div className="text-2xl mb-3 transition-transform duration-200 group-hover:scale-110">{f.icon}</div>
              <h3 className="text-white font-bold text-sm mb-1.5">{f.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
