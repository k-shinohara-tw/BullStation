import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl',
  secondary: 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 rounded-xl',
  ghost: 'text-gray-400 hover:text-white',
};

// ghost は padding なし・font size のみ
const SIZES: Record<Size, string> = {
  sm: 'py-2 px-4 text-sm',
  md: 'py-3 px-5 text-base',
  lg: 'py-4 px-6 text-lg',
};

const GHOST_SIZES: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) => (
  <button
    className={[
      'font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed',
      VARIANTS[variant],
      variant === 'ghost' ? GHOST_SIZES[size] : SIZES[size],
      fullWidth ? 'w-full' : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ')}
    {...props}
  >
    {children}
  </button>
);
