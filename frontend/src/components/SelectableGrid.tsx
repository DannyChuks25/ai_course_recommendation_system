import { pillBase, pillSelected, pillUnselected } from '../lib/formStyles';

interface SelectableGridProps {
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
  columns?: string; // tailwind grid-cols classes
  icons?: Record<string, string>;
}

export default function SelectableGrid({
  options,
  selected,
  onToggle,
  columns = 'grid-cols-2 sm:grid-cols-3',
  icons,
}: SelectableGridProps) {
  return (
    <div className={`grid ${columns} gap-3`}>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`${pillBase} ${isSelected ? pillSelected : pillUnselected}`}
          >
            {icons?.[option] && <div className="text-2xl mb-2">{icons[option]}</div>}
            <p
              className={`text-xs font-semibold leading-snug transition-colors duration-200 ${
                isSelected ? 'text-amber-300' : 'text-slate-300'
              }`}
            >
              {option}
            </p>
            {isSelected && (
              <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center animate-popIn">
                <svg className="w-2.5 h-2.5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
