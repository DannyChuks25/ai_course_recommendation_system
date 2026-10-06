import { primaryButtonClass, secondaryButtonClass } from '../lib/formStyles';

interface StepNavProps {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  isLoading?: boolean;
  showBack?: boolean;
}

export default function StepNav({ onBack, onNext, nextLabel = 'Continue →', isLoading, showBack = true }: StepNavProps) {
  return (
    <div className="flex gap-3 pt-2">
      {showBack && (
        <button type="button" onClick={onBack} disabled={isLoading} className={secondaryButtonClass}>
          ← Back
        </button>
      )}
      <button type="button" onClick={onNext} disabled={isLoading} className={primaryButtonClass}>
        {isLoading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Processing…
          </>
        ) : (
          nextLabel
        )}
      </button>
    </div>
  );
}
