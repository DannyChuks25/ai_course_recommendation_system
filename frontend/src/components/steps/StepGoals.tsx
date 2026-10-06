import toast from 'react-hot-toast';
import { sectionTitleClass, sectionSubtitleClass } from '../../lib/formStyles';
import type { Taxonomy } from '../../types';
import PriorityRankList from '../PriorityRankList';
import StepNav from '../StepNav';

const REQUIRED_GOALS = 5;

interface Props {
  taxonomy: Taxonomy;
  activeCategory: string | null;
  selected: string[];
  onChange: (v: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepGoals({ taxonomy, activeCategory, selected, onChange, onNext, onBack }: Props) {
  // Goals are scoped to whichever single category the student picked in
  // StepInterests — this is what makes the list specific (e.g. "Surgeon",
  // "Dentist") instead of one generic flat list (requirement #3).
  const goalOptions = activeCategory ? taxonomy.career_goals[activeCategory] ?? [] : [];

  const handleNext = () => {
    // if (selected.length !== REQUIRED_GOALS) {
    //   toast.error(
    //     selected.length < REQUIRED_GOALS
    //       ? `Rank exactly ${REQUIRED_GOALS} career goals — you've picked ${selected.length}.`
    //       : `Only ${REQUIRED_GOALS} career goals allowed — remove ${selected.length - REQUIRED_GOALS}.`
    //   );
    //   return;
    // }
    // No category selected 
    if (!activeCategory) { 
      toast.error('Please select a career interest first.');     
      return; 
    } 
    // No goals selected 
    if (selected.length === 0) { 
      toast.error(`Please select and rank ${REQUIRED_GOALS} career goals.`); return; 
    } 
    // Fewer than required 
    if (selected.length < REQUIRED_GOALS) { 
      toast.error( `Please rank exactly ${REQUIRED_GOALS} career goals — you've picked ${selected.length}.` ); 
      return; 
    }
    // More than required 
    if (selected.length > REQUIRED_GOALS) { 
      toast.error( `Only ${REQUIRED_GOALS} career goals are allowed — remove ${ selected.length - REQUIRED_GOALS }.` ); 
      return; 
    }

    onNext();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className={sectionTitleClass}>Career Goals</h2>
        <p className={sectionSubtitleClass}>
          Based on your interest in <span className="text-amber-400">{activeCategory}</span> — pick and rank{' '}
          <span className="text-amber-400 font-mono">exactly {REQUIRED_GOALS}</span> long-term goals.
        </p>
      </div>

      <PriorityRankList options={goalOptions} selected={selected} onChange={onChange} max={REQUIRED_GOALS} />

      <StepNav onBack={onBack} onNext={handleNext} />
    </div>
  );
}
