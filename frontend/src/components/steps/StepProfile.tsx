import toast from 'react-hot-toast';
import { inputClass, labelClass, helpTextClass, sectionTitleClass, sectionSubtitleClass } from '../../lib/formStyles';
import { STUDENT_TYPE_OPTIONS } from '../../types';
import type { StudentType } from '../../types';
import StepNav from '../StepNav';

export interface ProfileData {
  student_type: StudentType;
  jamb_score: string;
}

interface Props {
  data: ProfileData;
  onChange: (data: ProfileData) => void;
  onNext: () => void;
}

export default function StepProfile({ data, onChange, onNext }: Props) {
  const handleNext = () => {
    if (!data.student_type) {
      toast.error('Please select your student type.');
      return;
    }
    if (!data.jamb_score.trim() || !/^\d+$/.test(data.jamb_score.trim())) {
      toast.error('Enter a valid JAMB score.');
      return;
    }
    const score = parseInt(data.jamb_score, 10);
    if (score < 100 || score > 400) {
      toast.error('JAMB score must be between 100 and 400.');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className={sectionTitleClass}>Academic Profile</h2>
        <p className={sectionSubtitleClass}>Tell us about your academic background to get started.</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className={labelClass}>Student Type</label>
          <div className="grid grid-cols-3 gap-3">
            {STUDENT_TYPE_OPTIONS.map((opt) => {
              const selected = data.student_type === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ ...data, student_type: opt.value })}
                  className={`text-left rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0
                    ${selected
                      ? 'bg-amber-500/15 border-amber-500/60 shadow-[0_0_16px_rgba(251,191,36,0.12)]'
                      : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                >
                  <div className={`text-2xl mb-2 transition-transform duration-200 ${selected ? 'scale-110' : ''}`}>{opt.icon}</div>
                  <p className={`text-xs font-semibold ${selected ? 'text-amber-300' : 'text-slate-300'}`}>{opt.label}</p>
                </button>
              );
            })}
          </div>
          {data.student_type && (
            <p className={helpTextClass + ' animate-fadeIn'}>
              {STUDENT_TYPE_OPTIONS.find((o) => o.value === data.student_type)?.blurb}
            </p>
          )}
        </div>

        <div>
          <label className={labelClass}>JAMB UTME Score</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="e.g. 280"
            value={data.jamb_score}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*$/.test(val)) onChange({ ...data, jamb_score: val });
            }}
            className={inputClass}
          />
          <p className={helpTextClass}>Enter your total JAMB score (100–400).</p>
        </div>
      </div>

      <StepNav onNext={handleNext} showBack={false} />
    </div>
  );
}
