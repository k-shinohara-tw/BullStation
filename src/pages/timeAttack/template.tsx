import type { Dart, OutRule, HighScoreEntry } from '../../types';
import { CenteredScreen } from '../../components/layouts/CenteredScreen';
import { GameScreen } from '../../components/layouts/GameScreen';
import { TwoColumnLayout } from '../../components/layouts/TwoColumnLayout';
import { PageHeader } from '../../components/molecules/PageHeader';
import { DartBoard } from '../../components/organisms/DartBoard/DartBoard';
import { DartInput } from '../../components/molecules/DartInput';
import { ScoreDisplay } from '../../components/molecules/ScoreDisplay';
import { VerdictBanner } from '../../components/molecules/VerdictBanner';
import { TOTAL_QUESTIONS } from './hooks';
import type { Phase, QuestionResult } from './hooks';

interface TimeAttackTemplateProps {
  outRule: OutRule;
  showScores: boolean;
  phase: Phase;
  questionIndex: number;
  score: number;
  selected: Dart[];
  elapsed: number;
  results: QuestionResult[];
  currentResult: QuestionResult | null;
  correctCount: number;
  highScores: HighScoreEntry[];
  onStart: () => void;
  onDartSelect: (dart: Dart) => void;
  onBack: () => void;
  onClear: () => void;
  onConfirm: () => void;
  onNext: () => void;
  onNavigateHome: () => void;
}

interface TAResultPanelProps {
  result: QuestionResult;
  onNext: () => void;
  isLast: boolean;
}

const TAResultPanel = ({ result, onNext, isLast }: TAResultPanelProps) => (
  <div className="flex flex-col gap-3">
    <VerdictBanner
      ok={result.ok}
      detail={
        result.ok ? (
          <p className="text-sm text-gray-300 mt-1">
            {result.selected.map((d) => d.label).join(' → ')}
          </p>
        ) : undefined
      }
    />

    {!result.ok && result.checkouts[0] && (
      <div className="bg-gray-800 rounded-xl p-3 text-sm">
        <p className="text-gray-400 text-xs mb-1">
          例: {result.checkouts[0].darts.map((d) => d.label).join(' → ')}
        </p>
      </div>
    )}

    <button
      onClick={onNext}
      className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg transition-colors"
    >
      {isLast ? '結果を見る' : '次の問題'}
    </button>
  </div>
);

const OUT_RULE_LABEL: Record<OutRule, string> = {
  open: 'オープン',
  double: 'ダブル',
  master: 'マスター',
};

export const TimeAttackTemplate = ({
  outRule,
  showScores,
  phase,
  questionIndex,
  score,
  selected,
  elapsed,
  results,
  currentResult,
  correctCount,
  highScores,
  onStart,
  onDartSelect,
  onBack,
  onClear,
  onConfirm,
  onNext,
  onNavigateHome,
}: TimeAttackTemplateProps) => {
  if (phase === 'ready') {
    return (
      <CenteredScreen>
        <div className="text-center">
          <button
            onClick={onNavigateHome}
            className="text-gray-400 hover:text-white text-sm mb-8 block mx-auto"
          >
            ← ホーム
          </button>
          <h2 className="text-3xl font-bold text-yellow-400 mb-2">タイムアタック</h2>
          <p className="text-gray-400 mb-1">10問を最速で解いてください</p>
          <p className="text-gray-500 text-sm mb-8">
            アウトルール: <span className="text-white">{OUT_RULE_LABEL[outRule]}</span>
          </p>

          {highScores.length > 0 && (
            <div className="bg-gray-800 rounded-xl p-4 mb-6">
              <p className="text-gray-400 text-sm mb-2">ハイスコア</p>
              {highScores.slice(0, 3).map((h, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span className="text-gray-400">#{i + 1}</span>
                  <span className="text-yellow-400 font-bold">{h.time}秒</span>
                  <span className="text-gray-400">
                    {h.correct}/{TOTAL_QUESTIONS}正解
                  </span>
                  <span className="text-gray-600 text-xs">
                    {new Date(h.date).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={onStart}
            className="w-full py-4 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xl transition-colors"
          >
            スタート
          </button>
        </div>
      </CenteredScreen>
    );
  }

  if (phase === 'finished') {
    return (
      <CenteredScreen>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-yellow-400 mb-6">結果</h2>

          <div className="bg-gray-800 rounded-2xl p-6 mb-6">
            <p className="text-gray-400 text-sm mb-1">タイム</p>
            <p className="text-5xl font-bold text-white mb-4">
              {elapsed}
              <span className="text-2xl text-gray-400">秒</span>
            </p>
            <p className="text-gray-400 text-sm mb-1">正解数</p>
            <p className="text-3xl font-bold text-yellow-400">
              {correctCount}
              <span className="text-gray-400 text-lg">/{TOTAL_QUESTIONS}</span>
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 mb-6 text-left">
            {results.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-2 py-1 text-sm border-b border-gray-700 last:border-0"
              >
                <span className={r.ok ? 'text-green-400' : 'text-red-400'}>{r.ok ? '○' : '✗'}</span>
                <span className="text-gray-400 w-10">残{r.score}</span>
                <span className="text-white">{r.selected.map((d) => d.label).join('→')}</span>
                {!r.ok && r.checkouts[0] && (
                  <span className="text-gray-500 text-xs ml-auto">
                    {r.checkouts[0].darts.map((d) => d.label).join('→')}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onStart}
              className="flex-1 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition-colors"
            >
              もう一度
            </button>
            <button
              onClick={onNavigateHome}
              className="flex-1 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold transition-colors"
            >
              ホーム
            </button>
          </div>
        </div>
      </CenteredScreen>
    );
  }

  return (
    <GameScreen
      header={
        <PageHeader
          title={
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">
                {questionIndex + 1}/{TOTAL_QUESTIONS}
              </span>
              <span className="text-yellow-400 font-bold text-lg">{elapsed}s</span>
            </div>
          }
          onBack={onNavigateHome}
          right={<span className="text-sm text-gray-400">{correctCount}正解</span>}
        />
      }
    >
      <TwoColumnLayout
        main={
          <DartBoard
            onDartSelect={onDartSelect}
            showScores={showScores}
            selectedDarts={selected}
            disabled={phase === 'result_q'}
          />
        }
        side={
          <>
            <ScoreDisplay value={score} />
            {phase === 'playing' ? (
              <DartInput
                selectedDarts={selected}
                onBack={onBack}
                onClear={onClear}
                onConfirm={onConfirm}
              />
            ) : (
              currentResult && (
                <TAResultPanel
                  result={currentResult}
                  onNext={onNext}
                  isLast={results.length >= TOTAL_QUESTIONS}
                />
              )
            )}
          </>
        }
      />
    </GameScreen>
  );
};
