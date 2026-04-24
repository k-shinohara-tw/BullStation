import type { ReactNode } from 'react';

interface GameScreenProps {
  header: ReactNode;
  children: ReactNode;
  /** h-screen + overflow-hidden でスクロールなし固定レイアウトにする */
  fixed?: boolean;
}

export const GameScreen = ({ header, children, fixed = false }: GameScreenProps) => (
  <div
    className={`${fixed ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-gray-900 text-white flex flex-col`}
  >
    {header}
    {children}
  </div>
);
