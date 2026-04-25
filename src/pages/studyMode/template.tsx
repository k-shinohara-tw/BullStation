import type { Dart, Checkout, OutRule, UserArrangementEval } from '../../types';
import type { Phase } from './hooks';
import { GameScreen } from '../../components/layouts/GameScreen';
import { TwoColumnLayout } from '../../components/layouts/TwoColumnLayout';
import { PageHeader } from '../../components/molecules/PageHeader';
import { DartBoard } from '../../components/organisms/DartBoard/DartBoard';
import { DartInput } from '../../components/molecules/DartInput';
import { OutRuleSelector } from '../../components/molecules/OutRuleSelector';
import { ScoreDisplay } from '../../components/molecules/ScoreDisplay';

interface StudyModeTemplateProps {
  outRule: OutRule;
  showScores: boolean;
  score: number;
  selected: Dart[];
  phase: Phase;
  checkouts: Checkout[];
  userEval: UserArrangementEval | null;
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

interface UserArrangementSectionProps {
  userEval: UserArrangementEval;
}

const UserArrangementSection = ({ userEval }: UserArrangementSectionProps) => {
  const icon = userEval.isStar ? '★' : userEval.isValid ? '✓' : '✗';
  const iconColor = userEval.isStar
    ? 'text-yellow-400'
    : userEval.isValid
      ? 'text-green-400'
      : 'text-red-400';

  return (
    <div className="bg-gray-800 rounded-xl p-3">
      <p className="text-gray-400 text-xs mb-2">あなたのアレンジ</p>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${iconColor}`}>{icon}</span>
        <span className="text-white text-sm">{userEval.darts.map((d) => d.label).join(' → ')}</span>
      </div>
      {userEval.isStar && userEval.starReason && (
        <p className="text-yellow-400/70 text-xs mt-1">{userEval.starReason}</p>
      )}
      {!userEval.isValid && userEval.invalidReason && (
        <p className="text-red-400/80 text-xs mt-1">{userEval.invalidReason}</p>
      )}
    </div>
  );
};

interface ResultPanelProps {
  userEval: UserArrangementEval | null;
  checkouts: Checkout[];
  onNext: () => void;
}

const ResultPanel = ({ userEval, checkouts, onNext }: ResultPanelProps) => (
  <div className="flex flex-col gap-3">
    {userEval && <UserArrangementSection userEval={userEval} />}

    <div className="bg-gray-800 rounded-xl p-3">
      <p className="text-gray-400 text-xs mb-2">模範解答</p>
      <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto">
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
            {co.missAnalysis &&
              co.missAnalysis.map((m, mi) => (
                <p key={mi} className="text-gray-500 text-xs ml-5 mt-0.5">
                  {m.dartLabel}外し: {m.note}
                </p>
              ))}
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
  checkouts,
  userEval,
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
            <ResultPanel userEval={userEval} checkouts={checkouts} onNext={onNext} />
          )}
        </>
      }
    />
  </GameScreen>
);
