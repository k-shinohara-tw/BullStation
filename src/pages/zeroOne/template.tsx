import type { Dart, OutRule } from '../../types';
import {
  type PlayerCount,
  type StartScore,
  type BullMode,
  type RoundScoreCell,
  MAX_ROUNDS,
  DARTS_PER_ROUND,
} from './hooks';
import { DartControls } from '../../components/organisms/DartControls';

const PLAYER_COUNTS = [1, 2, 3, 4] as const;
const START_SCORES = [301, 501, 701, 901, 1101, 1501] as const;
const OUT_RULES: { value: OutRule; label: string }[] = [
  { value: 'open', label: 'シングルアウト' },
  { value: 'double', label: 'ダブルアウト' },
  { value: 'master', label: 'マスターアウト' },
];
const BULL_MODES = [
  { value: 'separate', label: 'セパブル' },
  { value: 'fat', label: 'ファットブル' },
] as const;

// ── Setup template ────────────────────────────────────────────────────────────

export interface ZeroOneSetupTemplateProps {
  playerCount: PlayerCount;
  startScore: StartScore;
  outRule: OutRule;
  bullMode: BullMode;
  onPlayerCountChange: (count: PlayerCount) => void;
  onStartScoreChange: (score: StartScore) => void;
  onOutRuleChange: (rule: OutRule) => void;
  onBullModeChange: (mode: BullMode) => void;
  onStartGame: () => void;
}

export const ZeroOneSetupTemplate = ({
  playerCount,
  startScore,
  outRule,
  bullMode,
  onPlayerCountChange,
  onStartScoreChange,
  onOutRuleChange,
  onBullModeChange,
  onStartGame,
}: ZeroOneSetupTemplateProps) => (
  <div className="w-full max-w-md bg-gray-800 rounded-2xl p-6 border border-gray-700">
    <h1 className="text-3xl font-bold text-yellow-400 text-center mb-6">01</h1>

    <section className="mb-6">
      <h2 className="text-sm text-gray-400 mb-3 text-center">Player Count</h2>
      <div className="grid grid-cols-4 gap-2">
        {PLAYER_COUNTS.map((count) => {
          const selected = playerCount === count;
          return (
            <button
              key={count}
              type="button"
              onClick={() => onPlayerCountChange(count)}
              className={`py-3 rounded-xl font-bold transition-colors border ${
                selected
                  ? 'bg-yellow-500 text-black border-yellow-400'
                  : 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600'
              }`}
              aria-pressed={selected}
            >
              {count}
            </button>
          );
        })}
      </div>
    </section>

    <section className="mb-4">
      <h2 className="text-sm text-gray-400 mb-3 text-center">Start Score</h2>
      <div className="grid grid-cols-2 gap-2">
        {START_SCORES.map((score) => {
          const selected = startScore === score;
          return (
            <button
              key={score}
              type="button"
              onClick={() => onStartScoreChange(score)}
              className={`py-3 rounded-xl font-bold transition-colors border ${
                selected
                  ? 'bg-yellow-500 text-black border-yellow-400'
                  : 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600'
              }`}
              aria-pressed={selected}
            >
              {score}
            </button>
          );
        })}
      </div>
    </section>

    <section className="mb-4">
      <h2 className="text-sm text-gray-400 mb-3 text-center">Out</h2>
      <div className="grid grid-cols-2 gap-2">
        {OUT_RULES.map((rule, index) => {
          const selected = outRule === rule.value;
          return (
            <button
              key={rule.value}
              type="button"
              onClick={() => onOutRuleChange(rule.value)}
              className={`py-3 rounded-xl font-bold transition-colors border ${
                index === OUT_RULES.length - 1 ? 'col-span-2 ' : ''
              }${
                selected
                  ? 'bg-yellow-500 text-black border-yellow-400'
                  : 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600'
              }`}
              aria-pressed={selected}
            >
              {rule.label}
            </button>
          );
        })}
      </div>
    </section>

    <section className="mb-4">
      <h2 className="text-sm text-gray-400 mb-3 text-center">Bull Rule</h2>
      <div className="grid grid-cols-2 gap-2">
        {BULL_MODES.map((mode) => {
          const selected = bullMode === mode.value;
          return (
            <button
              key={mode.value}
              type="button"
              onClick={() => onBullModeChange(mode.value)}
              className={`py-3 rounded-xl font-bold transition-colors border ${
                selected
                  ? 'bg-yellow-500 text-black border-yellow-400'
                  : 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600'
              }`}
              aria-pressed={selected}
            >
              {mode.label}
            </button>
          );
        })}
      </div>
    </section>

    <button
      type="button"
      onClick={onStartGame}
      className="w-full py-4 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg transition-colors mt-6"
    >
      ゲーム開始
    </button>
  </div>
);

// ── Game template — local sub-components ─────────────────────────────────────

interface RoundScoreGridProps {
  playerCount: PlayerCount;
  roundScores: RoundScoreCell[][];
  currentRound: number;
  isFinished: boolean;
  visibleRounds: number;
  activePlayerIndex: number;
}

const RoundScoreGrid = ({
  playerCount,
  roundScores,
  currentRound,
  isFinished,
  visibleRounds,
  activePlayerIndex,
}: RoundScoreGridProps) => (
  <aside className="w-[360px] shrink-0 bg-gray-900 rounded-xl border border-gray-700 p-3 max-h-[760px] overflow-auto">
    <p className="text-gray-400 text-sm font-bold mb-2">Round Scores</p>
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `56px repeat(${playerCount}, minmax(56px, 1fr))` }}
    >
      <div className="text-center text-xs text-gray-500 py-1">R</div>
      {Array.from({ length: playerCount }).map((_, playerIndex) => (
        <div
          key={`header-p-${playerIndex}`}
          className="text-center text-xs text-gray-400 py-1 font-bold"
        >
          P{playerIndex + 1}
        </div>
      ))}

      {Array.from({ length: visibleRounds }).map((_, roundIndex) => {
        const round = roundIndex + 1;
        return (
          <div key={`row-${round}`} className="contents">
            <div
              className={`text-center text-xs py-1 rounded ${
                round === currentRound && !isFinished
                  ? 'bg-yellow-500/20 text-yellow-300'
                  : 'text-gray-500'
              }`}
            >
              R{round}
            </div>
            {Array.from({ length: playerCount }).map((__, playerIndex) => {
              const score: RoundScoreCell = roundScores[roundIndex][playerIndex];
              const isCurrentCell =
                !isFinished && round === currentRound && playerIndex === activePlayerIndex;
              return (
                <div
                  key={`score-${round}-${playerIndex}`}
                  className={`text-center text-sm py-1 rounded border ${
                    isCurrentCell
                      ? 'border-yellow-500 bg-yellow-500/10 text-yellow-300'
                      : 'border-gray-700 bg-gray-800 text-white'
                  }`}
                >
                  {score === 'BUST' ? 'BUST' : (score ?? '-')}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  </aside>
);

interface GameOverOverlayProps {
  winnerPlayer: number | null;
  onRematch: () => void;
  onExitToHome: () => void;
}

const GameOverOverlay = ({ winnerPlayer, onRematch, onExitToHome }: GameOverOverlayProps) => (
  <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-6 text-center">
      <p className="text-yellow-400 text-3xl font-black mb-2">GAME OVER</p>
      <p className="text-white text-lg font-bold mb-6">
        {winnerPlayer !== null ? `Winner: Player ${winnerPlayer + 1}` : '勝者なし'}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onRematch}
          className="flex-1 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition-colors"
        >
          もう1戦
        </button>
        <button
          type="button"
          onClick={onExitToHome}
          className="flex-1 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold transition-colors"
        >
          終わり
        </button>
      </div>
    </div>
  </div>
);

// ── Game template ─────────────────────────────────────────────────────────────

export interface ZeroOneGameTemplateProps {
  playerCount: PlayerCount;
  outRule: OutRule;
  bullMode: BullMode;
  onExitToHome: () => void;
  selectedDarts: Dart[];
  roundScores: RoundScoreCell[][];
  currentRound: number;
  isFinished: boolean;
  winnerPlayer: number | null;
  currentRoundScore: number;
  visibleRounds: number;
  activePlayerIndex: number;
  currentPlayerTotal: number;
  currentPlayerRemaining: number;
  handleDartSelect: (dart: Dart) => void;
  handleUndo: () => void;
  handleClear: () => void;
  handleRoundChange: () => void;
  handleRematch: () => void;
}

export const ZeroOneGameTemplate = ({
  playerCount,
  outRule,
  bullMode,
  onExitToHome,
  selectedDarts,
  roundScores,
  currentRound,
  isFinished,
  winnerPlayer,
  currentRoundScore,
  visibleRounds,
  activePlayerIndex,
  currentPlayerTotal,
  currentPlayerRemaining,
  handleDartSelect,
  handleUndo,
  handleClear,
  handleRoundChange,
  handleRematch,
}: ZeroOneGameTemplateProps) => (
  <div className="relative w-full max-w-[1280px] bg-gray-800 rounded-2xl p-6 border border-gray-700">
    <div className="absolute top-4 right-4 text-right space-y-1">
      <p className="text-gray-300 text-sm font-bold">Out: {outRule}</p>
      <p className="text-gray-300 text-sm font-bold">
        Bull: {bullMode === 'fat' ? 'Fat Bull' : 'Separate Bull'}
      </p>
    </div>

    <div className="space-y-2 text-center mb-4">
      <p className="text-gray-400 text-sm">
        Round {currentRound} / {MAX_ROUNDS}
      </p>
      <p className="text-yellow-400 text-2xl font-black">Player {activePlayerIndex + 1}</p>
      <p className="text-white text-6xl font-black leading-none tabular-nums">
        {currentPlayerRemaining}
      </p>
      <p className="text-gray-500 text-xs uppercase tracking-widest">Remaining</p>
    </div>

    <div className="mt-6 flex gap-4 items-start">
      <RoundScoreGrid
        playerCount={playerCount}
        roundScores={roundScores}
        currentRound={currentRound}
        isFinished={isFinished}
        visibleRounds={visibleRounds}
        activePlayerIndex={activePlayerIndex}
      />

      <div className="flex-1 min-w-0">
        <DartControls
          selectedDarts={selectedDarts}
          onDartSelect={handleDartSelect}
          onUndo={handleUndo}
          onClear={handleClear}
          disabled={isFinished}
          slotCount={DARTS_PER_ROUND}
        />

        <div className="w-full max-w-[576px] mx-auto mt-3">
          <div className="relative flex items-center justify-center pt-3 border-t border-gray-700">
            <div className="text-center">
              <p className="text-gray-500 text-xs uppercase tracking-widest leading-none mb-1">
                Round Total
              </p>
              <p className="text-white text-5xl font-black leading-none tabular-nums">
                {currentRoundScore}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                P{activePlayerIndex + 1} Total: {currentPlayerTotal}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRoundChange}
              disabled={selectedDarts.length === 0 || isFinished}
              className="absolute right-0 px-6 py-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {isFinished ? 'Finished' : 'RoundChange'}
            </button>
          </div>
        </div>
      </div>
    </div>

    {isFinished && (
      <GameOverOverlay
        winnerPlayer={winnerPlayer}
        onRematch={handleRematch}
        onExitToHome={onExitToHome}
      />
    )}
  </div>
);
