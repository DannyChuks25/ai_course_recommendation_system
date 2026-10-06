import { useRef } from 'react';
import toast from 'react-hot-toast';
import { sectionTitleClass, sectionSubtitleClass } from '../../lib/formStyles';
import type { Taxonomy } from '../../types';
import RatingScale from '../RatingScale';
import StepNav from '../StepNav';

interface Props {
  taxonomy: Taxonomy;
  answers: Record<string, number>;
  onChange: (answers: Record<string, number>) => void;
  onNext: () => void;
  onBack: () => void;
}

function categoryLabel(cat: string): string {
  return cat
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

export default function StepAptitude({ taxonomy, answers, onChange, onNext, onBack }: Props) {
  const total = taxonomy.aptitude.questions.length;
  const answered = Object.keys(answers).length;

  // One ref per question row, so we can scroll a specific row into view.
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleAnswer = (id: string, value: number) => {
    // onChange({ ...answers, [id]: value });
    const next = { ...answers, [id]: value };
    onChange(next);

    // Find the next question (in list order) that still has no answer,
    // and smoothly scroll it into view — this is what replaces the old
    // "scroll to top" behavior with "scroll to the next input".
    const currentIndex = taxonomy.aptitude.questions.findIndex((q) => q.id === id);
    const nextUnanswered = taxonomy.aptitude.questions
      .slice(currentIndex + 1)
      .find((q) => next[q.id] === undefined);

    if (nextUnanswered) {
      rowRefs.current[nextUnanswered.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNext = () => {
    const firstUnanswered = taxonomy.aptitude.questions.find((q) => answers[q.id] === undefined);
    if (firstUnanswered) {
      const remaining = total - answered;
      toast.error(
        `Please answer every question before continuing — ${remaining} question${remaining === 1 ? '' : 's'} left.`
      );
      document
        .getElementById(`aptitude-${firstUnanswered.id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return; // block navigation until every question is answered
    }
    onNext();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className={sectionTitleClass}>Aptitude Assessment</h2>
        <p className={sectionSubtitleClass}>
          Rate how much each statement sounds like you.{' '}
          <span className="text-amber-400 font-mono">{answered}/{total} answered</span>
        </p>
      </div>

      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-300"
          style={{ width: `${(answered / total) * 100}%` }}
        />
      </div>

      <div className="flex justify-between text-[11px] text-slate-500 font-mono px-1">
        <span>1 = Strongly Disagree</span>
        <span>5 = Strongly Agree</span>
      </div>

      <div className="max-h-112 overflow-y-auto space-y-3 pr-1">
        {taxonomy.aptitude.questions.map((q) => {
          const isUnanswered = answers[q.id] === undefined;
          return (
            <div
              key={q.id}
              ref={(el) => { rowRefs.current[q.id] = el; }}
              id={`aptitude-${q.id}`}
              className={`rounded-xl px-4 py-3.5 border scroll-mt-4 transition-colors duration-200 ${
                isUnanswered ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-800/60 border-emerald-800/40'
              }`}
            >
              <p className="text-[10px] text-amber-500/80 font-mono uppercase tracking-wider mb-1">
                {categoryLabel(q.category)}
              </p>
              <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                <p className="text-sm text-slate-200 flex-1 min-w-56">{q.text}</p>
                <RatingScale
                  value={answers[q.id]}
                  onChange={(v) => handleAnswer(q.id, v)}
                  scale={taxonomy.aptitude.rating_scale}
                />
              </div>
            </div>
          );
        })}
      </div>


      <StepNav onBack={onBack} onNext={handleNext} />
    </div>
  );
}
