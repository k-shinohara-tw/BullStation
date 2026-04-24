import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  onBack: () => void;
  right?: ReactNode;
  backLabel?: string;
}

export const PageHeader = ({ title, onBack, right, backLabel = '← ホーム' }: PageHeaderProps) => (
  <div className="flex items-center justify-between px-5 py-3 bg-gray-800 border-b border-gray-700 shrink-0">
    <button
      type="button"
      onClick={onBack}
      className="text-gray-400 hover:text-white text-base transition-colors shrink-0"
    >
      {backLabel}
    </button>
    <span className="text-white font-bold tracking-wide text-lg">{title}</span>
    <div className="shrink-0 min-w-[64px] text-right">{right}</div>
  </div>
);
