interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  ariaLabel?: string;
}

export const Toggle = ({ checked, onChange, ariaLabel }: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    onClick={() => onChange(!checked)}
    className={`relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none ${
      checked ? 'bg-yellow-500' : 'bg-gray-600'
    }`}
  >
    <span
      className={`absolute top-[2px] w-6 h-6 bg-white rounded-full shadow transition-all duration-200 ${
        checked ? 'left-[30px]' : 'left-[2px]'
      }`}
    />
  </button>
);
