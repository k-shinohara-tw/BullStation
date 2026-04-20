import { useNavigate } from 'react-router-dom';
import type { OutRule } from '../types';
import OutRuleSelector from '../components/OutRuleSelector';
import { saveOutRule, saveShowScores } from '../utils/localStorage';

interface HomeProps {
  outRule: OutRule;
  onOutRuleChange: (r: OutRule) => void;
  showScores: boolean;
  onShowScoresChange: (v: boolean) => void;
}

export default function Home({ outRule, onOutRuleChange, showScores, onShowScoresChange }: HomeProps) {
  const navigate = useNavigate();

  function handleRuleChange(r: OutRule) {
    onOutRuleChange(r);
    saveOutRule(r);
  }

  function handleToggle() {
    const next = !showScores;
    onShowScoresChange(next);
    saveShowScores(next);
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">BullStation</h1>
          <p className="text-gray-400">ダーツ練習ツール</p>
        </div>

        {/* Out Rule */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-2 text-center">アウトルール</p>
          <OutRuleSelector value={outRule} onChange={handleRuleChange} />
        </div>

        {/* Board display toggle */}
        <div className="mb-8 flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
          <div>
            <p className="text-white text-sm font-medium">ボード表示</p>
            <p className="text-gray-500 text-xs mt-0.5">
              {showScores ? '各エリアのスコアを表示' : '外枠の番号を表示'}
            </p>
          </div>
          <button
            onClick={handleToggle}
            className={`relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none
              ${showScores ? 'bg-yellow-500' : 'bg-gray-600'}`}
            aria-label="ボード表示切替"
          >
            <span
              className={`absolute top-[2px] w-6 h-6 bg-white rounded-full shadow transition-all duration-200
                ${showScores ? 'left-[30px]' : 'left-[2px]'}`}
            />
          </button>
        </div>

        {/* Mode buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/study')}
            className="w-full py-4 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xl transition-colors"
          >
            通常学習モード
          </button>
          <button
            onClick={() => navigate('/timeattack')}
            className="w-full py-4 rounded-2xl bg-gray-700 hover:bg-gray-600 text-white font-bold text-xl transition-colors border border-gray-600"
          >
            タイムアタック
            <span className="block text-sm font-normal text-gray-400 mt-1">10問・最速タイムに挑戦</span>
          </button>
          <button
            onClick={() => navigate('/countup')}
            className="w-full py-4 rounded-2xl bg-gray-700 hover:bg-gray-600 text-white font-bold text-xl transition-colors border border-gray-600"
          >
            カウントアップ
            <span className="block text-sm font-normal text-gray-400 mt-1">8ラウンド・スコアを最大化</span>
          </button>
        </div>

        <p className="text-center text-gray-600 text-xs mt-8">出題範囲: 21〜180</p>
      </div>
    </div>
  );
}
