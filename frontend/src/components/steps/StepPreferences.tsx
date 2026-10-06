import { useState } from 'react';
import toast from 'react-hot-toast';
import { inputClass, labelClass, helpTextClass, sectionTitleClass, sectionSubtitleClass } from '../../lib/formStyles';
import type { Taxonomy, UniversityPreferences, University } from '../../types';
import UniversitySelect from '../UniversitySelect';
import StepNav from '../StepNav';

interface Props {
  taxonomy: Taxonomy;
  universities: University[];
  prefs: UniversityPreferences;
  onChange: (v: UniversityPreferences) => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const REQUIRED_FIELDS: { key: keyof UniversityPreferences; label: string }[] = [
  { key: 'preferred_university', label: 'Preferred University' },
  { key: 'preferred_state', label: 'Preferred State' },
  { key: 'preferred_zone', label: 'Geopolitical Zone' },
  { key: 'ownership', label: 'Ownership Type' },
  { key: 'tuition_budget_naira', label: 'Tuition Budget' },
  { key: 'hostel_preference', label: 'Hostel Preference' },
  { key: 'distance_preference', label: 'Distance from Home' },
];

export default function StepPreferences({ taxonomy, universities, prefs, onChange, onSubmit, onBack, isLoading }: Props) {
  const [errors, setErrors] = useState<Set<string>>(new Set());

  const set = <K extends keyof UniversityPreferences>(key: K, value: UniversityPreferences[K]) => {
    onChange({ ...prefs, [key]: value });
    if (errors.has(key)) {
      const next = new Set(errors);
      next.delete(key);
      setErrors(next);
    }
  };

  const handleUniversitySelect = (u: University) => {
    // Selecting a university auto-fills ownership + state, and updates
    // again every time a different university is picked (requirement #1).
    onChange({
      ...prefs,
      preferred_university: u.name,
      ownership: u.ownership,
      preferred_state: u.state,
      preferred_zone: u.zone,
    });
    setErrors((prev) => {
      const next = new Set(prev);
      next.delete('preferred_university');
      next.delete('ownership');
      next.delete('preferred_state');
      next.delete('preferred_zone');
      return next;
    });
  };

  const errorClass = (key: string) => (errors.has(key) ? 'border-red-500/70 focus:border-red-500' : '');

  const handleSubmit = () => {
    const missing = REQUIRED_FIELDS.filter(({ key }) => {
      const val = prefs[key];
      return val === undefined || val === null || val === '';
    });

    if (missing.length > 0) {
      setErrors(new Set(missing.map((m) => m.key)));
      toast.error(
        missing.length === 1
          ? `${missing[0].label} is required.`
          : `Please fill in: ${missing.map((m) => m.label).join(', ')}.`
      );
      return;
    }

    setErrors(new Set());
    onSubmit();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className={sectionTitleClass}>University Preferences</h2>
        <p className={sectionSubtitleClass}>All fields below are required so we can add accurate guidance notes.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>Preferred University</label>
          <UniversitySelect
            universities={universities}
            value={prefs.preferred_university}
            onSelect={handleUniversitySelect}
          />
          {errors.has('preferred_university') && (
            <p className="text-red-400 text-xs mt-1.5">Select a university from the list.</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Preferred State</label>
          <input
            type="text"
            readOnly
            placeholder="Auto-filled from university"
            value={prefs.preferred_state}
            className={`${inputClass} ${errorClass('preferred_state')} bg-slate-800/40 cursor-not-allowed`}
          />
        </div>

        <div>
          <label className={labelClass}>Geopolitical Zone</label>
          <select
            value={prefs.preferred_zone}
            onChange={(e) => set('preferred_zone', e.target.value)}
            className={`${inputClass} ${errorClass('preferred_zone')} cursor-pointer`}
          >
            <option value="">— Select —</option>
            {taxonomy.university_preferences.geopolitical_zones.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Ownership Type</label>
          <input
            type="text"
            readOnly
            placeholder="Auto-filled from university"
            value={prefs.ownership}
            className={`${inputClass} ${errorClass('ownership')} bg-slate-800/40 cursor-not-allowed`}
          />
        </div>

        <div>
          <label className={labelClass}>Tuition Budget (₦ / year)</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 300000"
            value={prefs.tuition_budget_naira}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*$/.test(val)) set('tuition_budget_naira', val ? parseInt(val, 10) : '');
            }}
            className={`${inputClass} ${errorClass('tuition_budget_naira')}`}
          />
        </div>

        <div>
          <label className={labelClass}>Hostel Preference</label>
          <select
            value={prefs.hostel_preference}
            onChange={(e) => set('hostel_preference', e.target.value)}
            className={`${inputClass} ${errorClass('hostel_preference')} cursor-pointer`}
          >
            <option value="">— Select —</option>
            {taxonomy.university_preferences.hostel_preferences.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Distance from Home</label>
          <select
            value={prefs.distance_preference}
            onChange={(e) => set('distance_preference', e.target.value)}
            className={`${inputClass} ${errorClass('distance_preference')} cursor-pointer`}
          >
            <option value="">— Select —</option>
            {taxonomy.university_preferences.distance_preferences.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <p className={helpTextClass}>
        These don't change the model's confidence score — they add plain-language guidance notes to your results.
      </p>

      <StepNav onBack={onBack} onNext={handleSubmit} isLoading={isLoading} nextLabel="Get Recommendations ✦" />
    </div>
  );
}
