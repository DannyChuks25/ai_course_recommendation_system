import React from 'react';

interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

const StepProgressBar: React.FC<StepProgressBarProps> = ({ currentStep, totalSteps, stepLabels }) => {
  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full mb-10">
      {/* Top label */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold tracking-widest uppercase text-amber-400 font-mono">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-xs text-slate-400 font-mono">{stepLabels[currentStep - 1]}</span>
      </div>

      {/* Track */}
      <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-linear-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progressPercent === 0 ? 8 : progressPercent}%` }}
        />
        {/* Shimmer */}
        <div
          className="absolute top-0 h-full w-20 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer"
          style={{ left: `${progressPercent === 0 ? 8 : progressPercent}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-between mt-3">
        {stepLabels.map((label, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          return (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold font-mono transition-all duration-300
                  ${isCompleted
                    ? 'bg-amber-500 border-amber-500 text-slate-900 animate-popIn'
                    : isActive
                    ? 'bg-slate-900 border-amber-400 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.4)] scale-110 animate-popIn'
                    : 'bg-slate-900 border-slate-700 text-slate-600'
                  }`}
              >
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : stepNum}
              </div>
              <span className={`text-xs hidden sm:block font-medium transition-colors duration-300
                ${isActive ? 'text-amber-400' : isCompleted ? 'text-slate-300' : 'text-slate-600'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgressBar;
