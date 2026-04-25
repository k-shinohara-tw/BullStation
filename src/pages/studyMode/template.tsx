import type { Dart, Checkout, OutRule } from '../../types';
import type { Phase } from './hooks';
import { GameScreen } from '../../components/layouts/GameScreen';
import { TwoColumnLayout } from '../../components/layouts/TwoColumnLayout';
import { PageHeader } from '../../components/molecules/PageHeader';
import { DartBoard } from '../../components/organisms/DartBoard/DartBoard';
import { DartInput } from '../../components/molecules/DartInput';
import { OutRuleSelector } from '../../components/molecules/OutRuleSelector';
import { ScoreDisplay } from '../../components/molecules/ScoreDisplay';
import { VerdictBanner } from '../../components/molecules/VerdictBanner';

interface StudyModeTemplateProps {
  outRule: OutRule;
  showScores: boolean;
  score: number;
  selected: Dart[];
  phase: Phase;
  resultOk: boolean;
  resultReason: string;
  checkouts: Checkout[];
  stats: { correct: number; total: number };
  correctRate: number | null;
  onRuleChange: (rule: OutRule) => void;
  onDartSelect: (dart: Dart) => void;
  onBack: () => void;
  onClear: () => void;
  onConfirm: () => void;
  onNext: () => void;
  onNavigateHome: () => void;
}

interface ResultPanelProps {
  ok: boolean;
  reason: string;
  selectedDarts: Dart[];
  checkouts: Checkout[];
  onNext: () => void;
}

const ResultPanel = ({ ok, reason, selectedDarts, checkouts, onNext }: ResultPanelProps) => (
  <div className="flex flex-col gap-3">
    <VerdictBanner
      ok={ok}
      reason={!ok ? reason : undefined}
      detail={
        ok ? (
          <p className="text-sm text-gray-300 mt-1">
            {selectedDarts.map((d) => d.label).join(' → ')}
          </p>
        ) : undefined
      }
    />

    <div className="bg-gray-800 rounded-xl p-3">
      <p className="text-gray-400 text-xs mb-2">模範解答</p>
      <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
        {checkouts.slice(0, 5).map((co, i) => (
          <div key={i} className="text-sm">
            <div className="flex items-center gap-2">
              {co.isStar ? (
                <span className="text-yellow-400 text-xs">★</span>
              ) : (
                <span className="text-gray-600 text-xs">・</span>
              )}
              <span className="text-white">{co.darts.map((d) => d.label).join(' → ')}</span>
            </div>
            {co.isStar && co.reason && (
              <p className="text-yellow-400/70 text-xs ml-5 mt-0.5">{co.reason}</p>
            )}
          </div>
        ))}
      </div>
    </div>

    <button
      onClick={onNext}
      className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg transition-colors"
    >
      次の問題
    </button>
  </div>
);

export const StudyModeTemplate = ({
  outRule,
  showScores,
  score,
  selected,
  phase,
  resultOk,
  resultReason,
  checkouts,
  stats,
  correctRate,
  onRuleChange,
  onDartSelect,
  onBack,
  onClear,
  onConfirm,
  onNext,
  onNavigateHome,
}: StudyModeTemplateProps) => (
  <GameScreen
    header={
      <PageHeader
        title="通常学習"
        onBack={onNavigateHome}
        right={
          correctRate !== null ? (
            <span className="text-sm">
              <span className="text-gray-400">
                {stats.correct}/{stats.total}
              </span>
              <span className="text-yellow-400 ml-1">{correctRate}%</span>
            </span>
          ) : (
            <span className="w-16" />
          )
        }
      />
    }
  >
    <TwoColumnLayout
      main={
        <>
          <div className="w-full max-w-sm">
            <OutRuleSelector value={outRule} onChange={onRuleChange} />
          </div>
          <DartBoard
            onDartSelect={onDartSelect}
            selectedDarts={selected}
            disabled={phase === 'result'}
            showScores={showScores}
          />
        </>
      }
      side={
        <>
          <ScoreDisplay value={score} />
          {phase === 'question' ? (
            <DartInput
              selectedDarts={selected}
              onBack={onBack}
              onClear={onClear}
              onConfirm={onConfirm}
            />
          ) : (
            <ResultPanel
              ok={resultOk}
              reason={resultReason}
              selectedDarts={selected}
              checkouts={checkouts}
              onNext={onNext}
            />
          )}
        </>
      }
    />
  </GameScreen>
);
