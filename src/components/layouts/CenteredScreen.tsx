import type { ReactNode } from 'react';

interface CenteredScreenProps {
  children: ReactNode;
  maxWidth?: string;
}

export const CenteredScreen = ({ children, maxWidth = 'max-w-md' }: CenteredScreenProps) => (
  <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
    <div className={`w-full ${maxWidth}`}>{children}</div>
  </div>
);
