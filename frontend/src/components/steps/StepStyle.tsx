import { sectionTitleClass, sectionSubtitleClass } from '../../lib/formStyles';
import type { Taxonomy } from '../../types';
import SelectableGrid from '../SelectableGrid';
import toast from 'react-hot-toast';
import StepNav from '../StepNav';

interface Props {
  taxonomy: Taxonomy;
  workStyle: string[];
  learningStyle: string[];
  onChangeWork: (v: string[]) => void;
  onChangeLearning: (v: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepStyle({
  taxonomy, workStyle, learningStyle, onChangeWork, onChangeLearning, onNext, onBack,
}: Props) {
  const toggleWork = (v: string) => onChangeWork(workStyle.includes(v) ? workStyle.filter((s) => s !== v) : [...workStyle, v]);
  const toggleLearning = (v: string) => onChangeLearning(learningStyle.includes(v) ? learningStyle.filter((s) => s !== v) : [...learningStyle, v]);

  const handleNext = () => {  
    // Require at least one style to be selected
    if (workStyle.length === 0 && learningStyle.length === 0) { toast.error('Please select at least one work or learning style.'); 
      return; 
    } 
    
    onNext(); 
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className={sectionTitleClass}>Work &amp; Learning Style</h2>
        <p className={sectionSubtitleClass}>These are optional, but they sharpen your explanations and pathway suggestions.</p>
      </div>

      <div>
        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">What kind of work do you enjoy?</p>
        <SelectableGrid options={taxonomy.work_styles} selected={workStyle} onToggle={toggleWork} columns="grid-cols-2 sm:grid-cols-3" />
      </div>

      <div>
        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">How do you prefer to learn?</p>
        <SelectableGrid options={taxonomy.learning_styles} selected={learningStyle} onToggle={toggleLearning} columns="grid-cols-2 sm:grid-cols-3" />
      </div>

      <StepNav onBack={onBack} onNext={handleNext} />
    </div>
  );
}
