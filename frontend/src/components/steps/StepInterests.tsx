import toast from 'react-hot-toast';
import { sectionTitleClass, sectionSubtitleClass } from '../../lib/formStyles';
import type { StudentType, Taxonomy } from '../../types';
import { STUDENT_TYPE_CAREER_CATEGORIES } from '../../types';
import SelectableGrid from '../SelectableGrid';
import StepNav from '../StepNav';

const CATEGORY_ICONS: Record<string, string> = {
  Technology: '💻',
  Health: '🩺',
  Engineering: '⚙️',
  Business: '📈',
  Arts: '🎭',
};

interface Props {
  taxonomy: Taxonomy;
  studentType: StudentType;
  activeCategory: string | null;
  selected: string[];
  onChangeCategory: (category: string | null) => void;
  onChangeSelected: (selected: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepInterests({
  taxonomy, studentType, activeCategory, selected, onChangeCategory, onChangeSelected, onNext, onBack,
}: Props) {
  const categories = Object.keys(taxonomy.career_interests);

  // Categories the student's chosen study type is allowed to pick from
  // (e.g. an Art student can't pick Engineering). If, for whatever reason,
  // no study type has been recorded yet, don't block anything here — that
  // required field is already enforced back on StepProfile.
  const allowedCategories = studentType ? STUDENT_TYPE_CAREER_CATEGORIES[studentType] ?? [] : categories;

  const toggleCategory = (category: string) => {
    if (activeCategory === category) {
      // Unchecking the active category clears everything.
      onChangeCategory(null);
      onChangeSelected([]);
      return;
    }

    // Block career categories that don't match the student's study type
    // (e.g. Art + Engineering, Science + Business, Commercial + Health).
    if (studentType && !allowedCategories.includes(category)) {
      toast.error(`${category} doesn't match your ${studentType} study type. Please choose a fitting career category.`);
      return;
    }

    // Switching category: previous category's selections are cleared,
    // only the newly-checked category becomes active (requirement #2).
    onChangeCategory(category);
    onChangeSelected([]);
  };

  const toggleLeaf = (leaf: string) => {
    onChangeSelected(selected.includes(leaf) ? selected.filter((s) => s !== leaf) : [...selected, leaf]);
  };

  const handleNext = () => {
    if (!activeCategory) {
      toast.error('Select a career interest category first.');
      return;
    }
    // Defense in depth: catches a stale mismatch too, e.g. the student
    // went Back and changed their study type after already picking a
    // career category under the old one.
    if (studentType && !allowedCategories.includes(activeCategory)) {
      toast.error(`${activeCategory} doesn't match your ${studentType} study type. Please choose a fitting career category.`);
      onChangeCategory(null);
      onChangeSelected([]);
      return;
    }
    if (selected.length === 0) {
      toast.error('Select at least one interest within your chosen category.');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className={sectionTitleClass}>Career Interests</h2>
        <p className={sectionSubtitleClass}>
          Choose <span className="text-amber-400 font-mono">one</span> category, then pick as many interests
          inside it as apply.
        </p>
      </div>

      <div className="space-y-3">
        {categories.map((category) => {
          const isActive = activeCategory === category;
          const isDisabled = activeCategory !== null && !isActive;
          const leaves = taxonomy.career_interests[category];

          return (
            <div
              key={category}
              className={`rounded-2xl border transition-all duration-200 ${
                isActive
                  ? 'border-amber-500/50 bg-amber-500/5'
                  : isDisabled
                  ? 'border-slate-800/60 bg-slate-900/30 opacity-50'
                  : 'border-slate-700/60 bg-slate-800/40'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                disabled={isDisabled}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left disabled:cursor-not-allowed active:scale-[0.99] transition-transform duration-100"
              >
                <span
                  className={`w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-all duration-200
                    ${isActive ? 'bg-amber-500 border-amber-500 scale-105' : 'border-slate-600'}`}
                >
                  {isActive && (
                    <svg className="w-3 h-3 text-slate-900 animate-popIn" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className="text-lg">{CATEGORY_ICONS[category] ?? '✦'}</span>
                <span className={`text-sm font-bold uppercase tracking-wider ${isActive ? 'text-amber-300' : 'text-slate-300'}`}>
                  {category}
                </span>
                {isDisabled && (
                  <span className="ml-auto text-[10px] text-slate-600 font-mono">locked</span>
                )}
              </button>

              {isActive && (
                <div className="px-4 pb-4 animate-fadeIn">
                  <SelectableGrid options={leaves} selected={selected} onToggle={toggleLeaf} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-2">
            Selected ({selected.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {selected.map((s) => (
              <span key={s} className="text-xs bg-amber-500/20 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-full font-mono">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <StepNav onBack={onBack} onNext={handleNext} />
    </div>
  );
}
