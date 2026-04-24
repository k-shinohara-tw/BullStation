import type { OutRule } from '../../types';
import { CenteredScreen } from '../../components/layouts/CenteredScreen';
import { OutRuleSelector } from '../../components/molecules/OutRuleSelector';
import { Toggle } from '../../components/atoms/Toggle';

interface HomeTemplateProps {
  outRule: OutRule;
  showScores: boolean;
  onOutRuleChange: (rule: OutRule) => void;
  onShowScoresChange: (value: boolean) => void;
  onNavigate: (path: string) => void;
}

export const HomeTemplate = ({
  outRule,
  showScores,
  onOutRuleChange,
  onShowScoresChange,
  onNavigate,
}: HomeTemplateProps) => (
  <CenteredScreen>
    <div className="text-center mb-10">
      <h1 className="text-4xl font-bold text-yellow-400 mb-2">BullStation</h1>
      <p className="text-gray-400">ダーツ練習ツール</p>
    </div>

    <div className="mb-6">
      <p className="text-gray-400 text-sm mb-2 text-center">アウトルール</p>
      <OutRuleSelector value={outRule} onChange={onOutRuleChange} />
    </div>

    <div className="mb-8 flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
      <div>
        <p className="text-white text-sm font-medium">ボード表示</p>
        <p className="text-gray-500 text-xs mt-0.5">
          {showScores ? '各エリアのスコアを表示' : '外枠の番号を表示'}
        </p>
      </div>
      <Toggle checked={showScores} onChange={onShowScoresChange} ariaLabel="ボード表示切替" />
    </div>

    <div className="flex flex-col gap-4">
      <button
        onClick={() => onNavigate('/study')}
        className="w-full py-4 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xl transition-colors"
      >
        通常学習モード
      </button>
      <button
        onClick={() => onNavigate('/timeattack')}
        className="w-full py-4 rounded-2xl bg-gray-700 hover:bg-gray-600 text-white font-bold text-xl transition-colors border border-gray-600"
      >
        タイムアタック
        <span className="block text-sm font-normal text-gray-400 mt-1">10問・最速タイムに挑戦</span>
      </button>
      <button
        onClick={() => onNavigate('/countup')}
        className="w-full py-4 rounded-2xl bg-gray-700 hover:bg-gray-600 text-white font-bold text-xl transition-colors border border-gray-600"
      >
        カウントアップ
        <span className="block text-sm font-normal text-gray-400 mt-1">
          8ラウンド・スコアを最大化
        </span>
      </button>
      <button
        onClick={() => onNavigate('/zeroone')}
        className="w-full py-4 rounded-2xl bg-gray-700 hover:bg-gray-600 text-white font-bold text-xl transition-colors border border-gray-600"
      >
        01
        <span className="block text-sm font-normal text-gray-400 mt-1">0に</span>
      </button>
    </div>

    <p className="text-center text-gray-600 text-xs mt-8">出題範囲: 21〜180</p>
  </CenteredScreen>
);
