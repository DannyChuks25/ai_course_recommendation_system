import toast from 'react-hot-toast';
import { labelClass, sectionTitleClass, sectionSubtitleClass } from '../../lib/formStyles';
import { GRADE_OPTIONS, MIN_SUBJECTS, MAX_SUBJECTS, SUBJECT_SECTIONS_BY_STUDENT_TYPE } from '../../types';
import type { StudentType, SubjectSection } from '../../types';
import StepNav from '../StepNav';

interface Props {
  studentType: StudentType;
  grades: Record<string, number>;
  onChange: (grades: Record<string, number>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepGrades({ studentType, grades, onChange, onNext, onBack }: Props) {
  const sections = studentType ? SUBJECT_SECTIONS_BY_STUDENT_TYPE[studentType] : [];
  const filledCount = Object.keys(grades).length;

  const countIn = (section: SubjectSection) => section.subjects.filter((s) => s in grades).length;

  const toggleSubject = (subject: string, section: SubjectSection) => {
    // Deselect
    if (subject in grades) {
      const next = { ...grades };
      delete next[subject];
      onChange(next);
      return;
    }

    // Single-pick section (trade): picking another subject replaces the current one.
    if (section.maxPick === 1) {
      const hadOne = countIn(section) > 0;
      if (!hadOne && filledCount >= MAX_SUBJECTS) {
        toast.error(`You can select at most ${MAX_SUBJECTS} subjects.`);
        return;
      }
      const next = { ...grades };
      section.subjects.forEach((s) => delete next[s]);
      next[subject] = 6;
      onChange(next);
      return;
    }

    if (filledCount >= MAX_SUBJECTS) {
      toast.error(`You can select at most ${MAX_SUBJECTS} subjects.`);
      return;
    }
    if (section.maxPick && countIn(section) >= section.maxPick) {
      toast.error(`Pick at most ${section.maxPick} subjects under ${section.title}.`);
      return;
    }
    onChange({ ...grades, [subject]: 6 });
  };

  const setGrade = (subject: string, value: number) => {
    onChange({ ...grades, [subject]: value });
  };

  const handleNext = () => {
    if (filledCount < MIN_SUBJECTS) {
      toast.error(`Select at least ${MIN_SUBJECTS} subjects you offered. (${filledCount}/${MIN_SUBJECTS})`);
      return;
    }
    if (filledCount > MAX_SUBJECTS) {
      toast.error(`Select at most ${MAX_SUBJECTS} subjects. Remove ${filledCount - MAX_SUBJECTS}.`);
      return;
    }
    const trade = sections.find((s) => s.key === 'trade');
    if (trade && countIn(trade) === 0) {
      toast.error('Please select your trade subject.');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className={sectionTitleClass}>WAEC / O'Level Subjects</h2>
        <p className={sectionSubtitleClass}>
          <span className="text-amber-400 font-mono">
            Select at least {MIN_SUBJECTS} subjects (maximum of {MAX_SUBJECTS}).
          </span>{' '}
          Then set your grade for each.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((filledCount / MIN_SUBJECTS) * 100, 100)}%` }}
          />
        </div>
        <span className={`text-xs font-mono font-bold ${filledCount >= MIN_SUBJECTS ? 'text-emerald-400' : 'text-slate-400'}`}>
          {filledCount} / {MAX_SUBJECTS} selected
        </span>
      </div>

      {sections.length === 0 && (
        <p className="text-slate-500 text-sm text-center py-6">
          Go back and choose your student type first.
        </p>
      )}

      {sections.map((section) => (
        <div key={section.key} className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">{section.title}</h3>
            <span className="text-[11px] text-slate-500 font-mono">
              {section.hint}
              {section.maxPick && section.maxPick > 1 ? ` (${countIn(section)}/${section.maxPick})` : ''}
            </span>
          </div>

          {section.subjects.map((subject) => {
            const offered = subject in grades;
            return (
              <div
                key={subject}
                className={`rounded-xl border px-4 py-3 transition-all duration-150 ${
                  offered ? 'bg-amber-500/10 border-amber-500/40' : 'bg-slate-800/40 border-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => toggleSubject(subject, section)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <span
                      className={`w-5 h-5 shrink-0 border-2 flex items-center justify-center transition-all duration-200
                        ${section.maxPick === 1 ? 'rounded-full' : 'rounded-md'}
                        ${offered ? 'bg-amber-500 border-amber-500 scale-105' : 'border-slate-600'}`}
                    >
                      {offered && (
                        <svg className="w-3 h-3 text-slate-900 animate-popIn" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className={`text-sm font-medium ${offered ? 'text-amber-200' : 'text-slate-300'}`}>
                      {subject}
                    </span>
                  </button>

                  {offered && (
                    <select
                      value={grades[subject]}
                      onChange={(e) => setGrade(subject, parseInt(e.target.value, 10))}
                      className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {GRADE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {filledCount >= MIN_SUBJECTS && (
        <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-900/20 border border-emerald-800/40 rounded-xl px-4 py-2.5 animate-scaleIn">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-mono text-xs">Minimum subject requirement met!</span>
        </div>
      )}

      <p className={labelClass + ' normal-case font-normal tracking-normal text-slate-500'}>
        Grade scale: A1=6, B2=5, B3=4, C4=3, C5=2, C6/F=1 — anything below C6 just leave unselected.
      </p>

      <StepNav onBack={onBack} onNext={handleNext} />
    </div>
  );
}
