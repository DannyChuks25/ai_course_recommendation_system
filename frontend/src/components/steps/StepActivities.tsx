import { sectionTitleClass, sectionSubtitleClass } from '../../lib/formStyles';
import type { Taxonomy } from '../../types';
import SelectableGrid from '../SelectableGrid';
import StepNav from '../StepNav';

interface Props {
  taxonomy: Taxonomy;
  selected: string[];
  onChange: (v: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepActivities({ taxonomy, selected, onChange, onNext, onBack }: Props) {
  const toggle = (v: string) => onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className={sectionTitleClass}>Extracurricular Activities</h2>
        <p className={sectionSubtitleClass}>Optional — what do you do outside the classroom?</p>
      </div>

      <SelectableGrid options={taxonomy.extracurriculars} selected={selected} onToggle={toggle} />

      <StepNav onBack={onBack} onNext={onNext} />
    </div>
  );
}
