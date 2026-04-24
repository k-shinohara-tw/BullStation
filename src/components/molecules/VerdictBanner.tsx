import type { ReactNode } from 'react';

interface VerdictBannerProps {
  ok: boolean;
  /** バースト時の理由テキスト（任意） */
  reason?: string;
  /** 正解時に追加表示するコンテンツ（投げた矢列など） */
  detail?: ReactNode;
}

export const VerdictBanner = ({ ok, reason, detail }: VerdictBannerProps) => (
  <div
    className={`rounded-xl p-4 text-center ${
      ok ? 'bg-green-900/50 border border-green-600' : 'bg-red-900/50 border border-red-600'
    }`}
  >
    <p className={`text-2xl font-bold ${ok ? 'text-green-400' : 'text-red-400'}`}>
      {ok ? '正解!' : 'バースト'}
    </p>
    {!ok && reason && <p className="text-red-300 text-xs mt-1">{reason}</p>}
    {ok && detail && <div>{detail}</div>}
  </div>
);
