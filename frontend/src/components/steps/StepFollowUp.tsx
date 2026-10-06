import { sectionTitleClass, sectionSubtitleClass } from '../../lib/formStyles';
import type { Taxonomy } from '../../types';
import StepNav from '../StepNav';

interface Props {
  taxonomy: Taxonomy;
  activeCategory: string | null;
  answers: Record<string, boolean>;
  onChange: (answers: Record<string, boolean>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepFollowUp({ taxonomy, activeCategory, answers, onChange, onNext, onBack }: Props) {
  const questions = activeCategory ? taxonomy.follow_up_questions[activeCategory] ?? [] : [];

  const setAnswer = (id: string, value: boolean) => {
    onChange({ ...answers, [id]: value });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className={sectionTitleClass}>A Few Quick Questions</h2>
        <p className={sectionSubtitleClass}>
          These help narrow things down within <span className="text-amber-400">{activeCategory}</span> before we
          rank your goals. Optional — skip any that don't apply.
        </p>
      </div>

      <div className="space-y-3">
        {questions.map((q) => {
          const answer = answers[q.id];
          return (
            <div
              key={q.id}
              className="bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3.5 flex items-center justify-between gap-4 transition-colors duration-200 hover:border-slate-600 animate-fadeInUp"
            >
              <p className="text-sm text-slate-200 flex-1">{q.text}</p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setAnswer(q.id, true)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono border transition-all duration-150 active:scale-90
                    ${answer === true
                      ? 'bg-amber-500 border-amber-500 text-slate-900 scale-105'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setAnswer(q.id, false)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono border transition-all duration-150 active:scale-90
                    ${answer === false
                      ? 'bg-slate-600 border-slate-600 text-white scale-105'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                >
                  No
                </button>
              </div>
            </div>
          );
        })}
        {questions.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-6">No follow-up questions for this category.</p>
        )}
      </div>

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}
