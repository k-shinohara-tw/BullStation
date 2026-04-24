import type { Dart } from '../../types';
import { CenteredScreen } from '../../components/layouts/CenteredScreen';
import { GameScreen } from '../../components/layouts/GameScreen';
import { PageHeader } from '../../components/molecules/PageHeader';
import { DartControls } from '../../components/organisms/DartControls';
import { TOTAL_ROUNDS, RATING_LEVELS, getRatingLevel } from './hooks';
import type { RoundData } from './hooks';

const DARTS_PER_ROUND = 3;
const FLIGHT_LABEL_LEVELS = new Set([18, 15, 12, 9, 7, 5, 3]);

const segmentColor = (level: number): string => {
  if (level <= 3) return '#0891b2';
  if (level <= 5) return '#0e7490';
  if (level <= 7) return '#7c3aed';
  if (level <= 9) return '#6d28d9';
  if (level <= 12) return '#ea580c';
  if (level <= 15) return '#c2410c';
  return '#dc2626';
};

// ── Local sub-components ──────────────────────────────────────────────────────

interface StatsBarProps {
  completedRounds: number;
  projectedScore: number;
  avgPerRound: number;
  currentLevel: number;
  currentFlight: string;
}

const StatsBar = ({
  completedRounds,
  projectedScore,
  avgPerRound,
  currentLevel,
  currentFlight,
}: StatsBarProps) => (
  <div className="flex items-center justify-center gap-8 px-5 py-3 bg-gray-800 border-b border-gray-700 shrink-0">
    <div className="text-center">
      <p className="text-gray-500 text-xs uppercase tracking-widest leading-none mb-1">
        予想スコア
      </p>
      <p className="text-white text-3xl font-black leading-none">
        {completedRounds > 0 ? projectedScore : '---'}
      </p>
    </div>
    <div className="h-10 w-px bg-gray-600" />
    <div className="text-center">
      <p className="text-gray-500 text-xs uppercase tracking-widest leading-none mb-1">平均 / R</p>
      <p className="text-white text-3xl font-black leading-none">
        {completedRounds > 0 ? avgPerRound.toFixed(1) : '---'}
      </p>
    </div>
    <div className="h-10 w-px bg-gray-600" />
    <div className="text-center">
      <p className="text-gray-500 text-xs uppercase tracking-widest leading-none mb-1">
        レーティング
      </p>
      <p
        className="text-3xl font-black leading-none"
        style={{ color: currentLevel > 0 ? segmentColor(currentLevel) : '#6b7280' }}
      >
        {currentLevel > 0 ? currentFlight : '---'}
      </p>
    </div>
  </div>
);

interface RoundListPanelProps {
  rounds: (RoundData | null)[];
  currentRound: number;
  selectedDarts: Dart[];
  currentRoundScore: number;
}

const RoundListPanel = ({
  rounds,
  currentRound,
  selectedDarts,
  currentRoundScore,
}: RoundListPanelProps) => (
  <div className="w-[120px] shrink-0 bg-gray-800 border-r border-gray-700 overflow-y-auto">
    {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => {
      const round = rounds[i];
      const isActive = i === currentRound;
      const isDone = round !== null;
      return (
        <div
          key={i}
          className={`px-3 py-2 border-b border-gray-700 last:border-0 min-h-[calc(100%/8)] ${
            isActive ? 'bg-yellow-500/10' : ''
          }`}
        >
          <span className={`text-xs font-bold ${isActive ? 'text-yellow-400' : 'text-gray-500'}`}>
            R{i + 1}
          </span>
          <p
            className={`text-3xl font-black leading-tight tabular-nums ${
              isActive ? 'text-yellow-300' : isDone ? 'text-white' : 'text-gray-600'
            }`}
          >
            {isDone ? round.total : isActive && currentRoundScore > 0 ? currentRoundScore : '—'}
          </p>
          {isDone ? (
            <div className="flex gap-x-2 mt-0.5">
              {round.darts.map((d, j) => (
                <span
                  key={j}
                  className="text-base font-black text-gray-400 leading-tight tabular-nums"
                >
                  {d.value}
                </span>
              ))}
            </div>
          ) : isActive && selectedDarts.length > 0 ? (
            <div className="flex gap-x-2 mt-0.5">
              {selectedDarts.map((d, j) => (
                <span
                  key={j}
                  className="text-base font-black text-yellow-600 leading-tight tabular-nums"
                >
                  {d.value}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      );
    })}
  </div>
);

interface RatingBarProps {
  currentLevel: number;
}

const RatingBar = ({ currentLevel }: RatingBarProps) => {
  const reversedLevels = [...RATING_LEVELS].reverse();
  return (
    <div className="w-[100px] shrink-0 bg-gray-800 border-l border-gray-700 flex flex-col py-1.5 px-2">
      {reversedLevels.map(({ level, flight }) => {
        const filled = currentLevel > 0 && level <= currentLevel;
        const isCurrent = currentLevel > 0 && level === currentLevel;
        const showFlight = FLIGHT_LABEL_LEVELS.has(level);
        return (
          <div key={level} className="flex items-center gap-1 flex-1" style={{ minHeight: 0 }}>
            <span
              className={`text-sm font-bold w-[34px] text-right leading-none shrink-0 ${
                filled ? 'text-white' : 'text-gray-600'
              }`}
            >
              {showFlight ? flight : ''}
            </span>
            <div
              className={`flex-1 h-full transition-colors duration-300 ${
                isCurrent ? 'ring-1 ring-white ring-inset' : ''
              }`}
              style={{
                backgroundColor: filled ? segmentColor(level) : '#1f2937',
                minHeight: '5px',
              }}
            />
            <span
              className={`text-sm font-bold w-[24px] text-left leading-none shrink-0 ${
                filled ? 'text-white' : 'text-gray-600'
              }`}
            >
              {level}
            </span>
          </div>
        );
      })}
    </div>
  );
};

interface ConfirmSectionProps {
  totalScore: number;
  currentRoundScore: number;
  selectedDarts: Dart[];
  currentRound: number;
  onConfirm: () => void;
}

const ConfirmSection = ({
  totalScore,
  currentRoundScore,
  selectedDarts,
  currentRound,
  onConfirm,
}: ConfirmSectionProps) => (
  <div className="relative flex items-center justify-center mt-auto pt-3 pb-2 shrink-0 border-t border-gray-700">
    <div className="text-center">
      <p className="text-gray-500 text-xs uppercase tracking-widest leading-none mb-1">
        合計スコア
      </p>
      <p className="text-white text-6xl font-black leading-none tabular-nums">
        {totalScore + currentRoundScore}
      </p>
      {currentRoundScore > 0 && (
        <p className="text-yellow-400 text-base font-bold mt-1">+{currentRoundScore}</p>
      )}
    </div>
    <button
      onClick={onConfirm}
      disabled={selectedDarts.length === 0}
      className="absolute right-0 px-6 py-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      {currentRound === TOTAL_ROUNDS - 1 ? 'RoundOver' : 'RoundChange'}
    </button>
  </div>
);

// ── Template ──────────────────────────────────────────────────────────────────

interface CountUpTemplateProps {
  rounds: (RoundData | null)[];
  currentRound: number;
  selectedDarts: Dart[];
  finished: boolean;
  completedRounds: number;
  totalScore: number;
  currentRoundScore: number;
  avgPerRound: number;
  projectedScore: number;
  currentLevel: number;
  currentFlight: string;
  showScores: boolean;
  handleDartSelect: (dart: Dart) => void;
  handleUndo: () => void;
  handleClear: () => void;
  handleConfirm: () => void;
  handleRestart: () => void;
  onNavigateHome: () => void;
}

export const CountUpTemplate = ({
  rounds,
  currentRound,
  selectedDarts,
  finished,
  completedRounds,
  totalScore,
  currentRoundScore,
  avgPerRound,
  projectedScore,
  currentLevel,
  currentFlight,
  showScores,
  handleDartSelect,
  handleUndo,
  handleClear,
  handleConfirm,
  handleRestart,
  onNavigateHome,
}: CountUpTemplateProps) => {
  if (finished) {
    const finalLevel = getRatingLevel(totalScore);
    const finalFlight = RATING_LEVELS[finalLevel - 1].flight;
    const finalColor = segmentColor(finalLevel);
    const avg = totalScore / TOTAL_ROUNDS;

    return (
      <CenteredScreen>
        <h2 className="text-4xl font-bold text-center text-yellow-400 mb-2">GAME OVER</h2>
        <p className="text-center text-gray-500 text-base mb-8">Count Up 終了</p>

        <div className="bg-gray-800 rounded-2xl p-8 mb-5 text-center">
          <p className="text-gray-400 text-sm mb-2">合計スコア</p>
          <p className="text-7xl font-bold mb-4" style={{ color: finalColor }}>
            {totalScore}
          </p>
          <span
            className="px-5 py-2 rounded-full text-base font-bold border"
            style={{ color: finalColor, borderColor: finalColor }}
          >
            {finalFlight} ({finalLevel})
          </span>
          <p className="text-gray-400 text-base mt-4">平均 {avg.toFixed(1)} pt / R</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-5 mb-7">
          {rounds.map((r, i) => (
            <div key={i} className="py-2 border-b border-gray-700 last:border-0">
              <div className="flex justify-between items-baseline">
                <span className="text-gray-400 text-base">Round {i + 1}</span>
                <span className="text-white font-bold text-base">{r?.total ?? 0}</span>
              </div>
              {r && (
                <p className="text-gray-500 text-sm mt-0.5">
                  {r.darts.map((d) => d.label).join('  ')}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={onNavigateHome}
            className="flex-1 py-4 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold text-base transition-colors"
          >
            ホーム
          </button>
          <button
            onClick={handleRestart}
            className="flex-1 py-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-base transition-colors"
          >
            もう一度
          </button>
        </div>
      </CenteredScreen>
    );
  }

  return (
    <GameScreen
      fixed
      header={
        <PageHeader
          title="Count Up"
          onBack={onNavigateHome}
          right={
            <div className="text-right">
              <span className="text-yellow-400 text-3xl font-black leading-none">
                R{currentRound + 1}
              </span>
              <span className="text-gray-500 text-base font-bold"> / {TOTAL_ROUNDS}</span>
            </div>
          }
        />
      }
    >
      <StatsBar
        completedRounds={completedRounds}
        projectedScore={projectedScore}
        avgPerRound={avgPerRound}
        currentLevel={currentLevel}
        currentFlight={currentFlight}
      />

      <div className="flex flex-1 min-h-0">
        <RoundListPanel
          rounds={rounds}
          currentRound={currentRound}
          selectedDarts={selectedDarts}
          currentRoundScore={currentRoundScore}
        />

        <div className="flex-1 min-w-0 flex flex-col py-2.5 px-2.5 overflow-auto">
          <DartControls
            selectedDarts={selectedDarts}
            onDartSelect={handleDartSelect}
            onUndo={handleUndo}
            onClear={handleClear}
            showScores={showScores}
            slotCount={DARTS_PER_ROUND}
          />
          <ConfirmSection
            totalScore={totalScore}
            currentRoundScore={currentRoundScore}
            selectedDarts={selectedDarts}
            currentRound={currentRound}
            onConfirm={handleConfirm}
          />
        </div>

        <RatingBar currentLevel={currentLevel} />
      </div>
    </GameScreen>
  );
};
