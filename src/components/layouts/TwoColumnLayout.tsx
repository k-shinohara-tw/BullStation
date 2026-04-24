import type { ReactNode } from 'react';

interface TwoColumnLayoutProps {
  /** 左カラム（ダーツボード側） */
  main: ReactNode;
  /** 右カラム（操作パネル側） */
  side: ReactNode;
  sideWidth?: string;
}

export const TwoColumnLayout = ({ main, side, sideWidth = 'w-64' }: TwoColumnLayoutProps) => (
  <div className="flex flex-1 gap-6 p-4 max-w-5xl mx-auto w-full">
    <div className="flex flex-col items-center gap-4 flex-1">{main}</div>
    <div className={`flex flex-col gap-4 ${sideWidth} shrink-0`}>{side}</div>
  </div>
);
