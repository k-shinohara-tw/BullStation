
import type { OutRule } from '../types';

interface OutRuleSelectorProps {
  value: OutRule;
  onChange: (rule: OutRule) => void;
}

const OPTIONS: { value: OutRule; label: string; desc: string }[] = [
  { value: 'open', label: 'オープン', desc: '何でも上がり可' },
  { value: 'double', label: 'ダブル', desc: 'D/Bull(D)で上がり' },
  { value: 'master', label: 'マスター', desc: 'D/T/Bull(D)で上がり' },
];

export default function OutRuleSelector({ value, onChange }: OutRuleSelectorProps) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors border
            ${value === opt.value
              ? 'bg-yellow-500 border-yellow-500 text-black'
              : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-yellow-600'
            }`}
        >
          <div className="font-bold">{opt.label}</div>
          <div className={`text-xs mt-0.5 ${value === opt.value ? 'text-black/70' : 'text-gray-500'}`}>
            {opt.desc}
          </div>
        </button>
      ))}
    </div>
  );
}
