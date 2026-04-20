import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Dart, OutRule } from '../types';
import DartBoard from '../components/DartBoard/DartBoard';

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

type PlayerCount = (typeof PLAYER_COUNTS)[number];
type StartScore = (typeof START_SCORES)[number];
type BullMode = (typeof BULL_MODES)[number]['value'];

const DARTS_PER_ROUND = 3;

interface ZeroOneSetupProps {
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

function ZeroOneSetup({
  playerCount,
  startScore,
  outRule,
  bullMode,
  onPlayerCountChange,
  onStartScoreChange,
  onOutRuleChange,
  onBullModeChange,
  onStartGame,
}: ZeroOneSetupProps) {
  return (
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
}

interface ZeroOneMainProps {
  playerCount: PlayerCount;
  startScore: StartScore;
  outRule: OutRule;
  bullMode: BullMode;
  onExitToHome: () => void;
}

type RoundScoreCell = number | 'BUST' | null;

function canCheckoutByOutRule(lastDart: Dart, outRule: OutRule): boolean {
  if (outRule === 'open') return true;
  if (outRule === 'double') return lastDart.type === 'double' || lastDart.type === 'bullseye';
  return (
    lastDart.type === 'double' ||
    lastDart.type === 'triple' ||
    lastDart.type === 'bull' ||
    lastDart.type === 'bullseye'
  );
}

function ZeroOneMain({ playerCount, startScore, outRule, bullMode, onExitToHome }: ZeroOneMainProps) {
  const MAX_ROUNDS = 20;
  const [selectedDarts, setSelectedDarts] = useState<Dart[]>([]);
  const [roundScores, setRoundScores] = useState<RoundScoreCell[][]>(() =>
    Array.from({ length: MAX_ROUNDS }, () => Array.from({ length: playerCount }, () => null)),
  );
  const [currentRound, setCurrentRound] = useState(1);
  const [turnPlayerPos, setTurnPlayerPos] = useState(0);
  const [playerOrder, setPlayerOrder] = useState<number[]>(
    Array.from({ length: playerCount }, (_, i) => i),
  );
  const [isFinished, setIsFinished] = useState(false);
  const [winnerPlayer, setWinnerPlayer] = useState<number | null>(null);

  function scoreDartByBullMode(dart: Dart): Dart {
    if (bullMode === 'fat') {
      if (dart.type === 'bull' || dart.type === 'bullseye') return { ...dart, value: 50 };
      return dart;
    }
    if (dart.type === 'bull') return { ...dart, value: 25 };
    if (dart.type === 'bullseye') return { ...dart, value: 50 };
    return dart;
  }

  function handleDartSelect(dart: Dart) {
    if (isFinished || selectedDarts.length >= DARTS_PER_ROUND) return;
    const scoredDart = scoreDartByBullMode(dart);
    setSelectedDarts((prev) => [...prev, scoredDart]);
  }

  function handleUndo() {
    setSelectedDarts((prev) => prev.slice(0, -1));
  }

  function handleClear() {
    setSelectedDarts([]);
  }

  function advanceTurn() {
    if (turnPlayerPos + 1 < playerCount) {
      setTurnPlayerPos((prev) => prev + 1);
      return;
    }

    if (currentRound < MAX_ROUNDS) {
      setTurnPlayerPos(0);
      setCurrentRound((prev) => prev + 1);
      return;
    }

    setIsFinished(true);
  }

  function roundCellToPoints(cell: RoundScoreCell): number {
    return typeof cell === 'number' ? cell : 0;
  }

  function handleRoundChange() {
    if (selectedDarts.length === 0 || isFinished) return;

    const activePlayerIndex = playerOrder[turnPlayerPos];
    const playerStartRemaining = startScore - currentPlayerTotal;
    const remainingAfterThrow = playerStartRemaining - currentRoundScore;
    const lastDart = selectedDarts[selectedDarts.length - 1];

    // Bust: score below 0, or 0 reached without valid checkout dart.
    if (remainingAfterThrow < 0 || (remainingAfterThrow === 0 && !canCheckoutByOutRule(lastDart, outRule))) {
      setRoundScores((prev) => {
        const next = prev.map((row) => [...row]);
        next[currentRound - 1][activePlayerIndex] = 'BUST';
        return next;
      });
      setSelectedDarts([]);
      advanceTurn();
      return;
    }

    setRoundScores((prev) => {
      const next = prev.map((row) => [...row]);
      next[currentRound - 1][activePlayerIndex] = currentRoundScore;
      return next;
    });

    if (remainingAfterThrow === 0) {
      setWinnerPlayer(activePlayerIndex);
      setIsFinished(true);
      setSelectedDarts([]);
      return;
    }

    setSelectedDarts([]);
    advanceTurn();
  }

  const currentRoundScore = selectedDarts.reduce((sum, dart) => sum + dart.value, 0);
  const visibleRounds = currentRound <= 10 ? 10 : currentRound <= 15 ? 15 : 20;
  const playerTotals = Array.from({ length: playerCount }, (_, playerIndex) =>
    roundScores.reduce((sum, row) => sum + roundCellToPoints(row[playerIndex]), 0),
  );
  const activePlayerIndex = playerOrder[turnPlayerPos];
  const currentPlayerTotal = playerTotals[activePlayerIndex] ?? 0;
  const currentPlayerRemaining = startScore - currentPlayerTotal;

  function handleRematch() {
    setRoundScores(Array.from({ length: MAX_ROUNDS }, () => Array.from({ length: playerCount }, () => null)));
    setSelectedDarts([]);
    setCurrentRound(1);
    setTurnPlayerPos(0);
    setWinnerPlayer(null);
    setIsFinished(false);
    setPlayerOrder((prev) => [...prev].reverse());
  }

  return (
    <div className="relative w-full max-w-[1280px] bg-gray-800 rounded-2xl p-6 border border-gray-700">
      <div className="absolute top-4 right-4 text-right space-y-1">
        <p className="text-gray-300 text-sm font-bold">Out: {outRule}</p>
        <p className="text-gray-300 text-sm font-bold">
          Bull: {bullMode === 'fat' ? 'Fat Bull' : 'Separate Bull'}
        </p>
      </div>

      <div className="space-y-2 text-center mb-4">
        <p className="text-gray-400 text-sm">Round {currentRound} / {MAX_ROUNDS}</p>
        <p className="text-yellow-400 text-2xl font-black">Player {activePlayerIndex + 1}</p>
        <p className="text-white text-6xl font-black leading-none tabular-nums">{currentPlayerRemaining}</p>
        <p className="text-gray-500 text-xs uppercase tracking-widest">Remaining</p>
      </div>

      <div className="mt-6 flex gap-4 items-start">
        <aside className="w-[360px] shrink-0 bg-gray-900 rounded-xl border border-gray-700 p-3 max-h-[760px] overflow-auto">
          <p className="text-gray-400 text-sm font-bold mb-2">Round Scores</p>
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `56px repeat(${playerCount}, minmax(56px, 1fr))` }}
          >
            <div className="text-center text-xs text-gray-500 py-1">R</div>
            {Array.from({ length: playerCount }).map((_, playerIndex) => (
              <div key={`header-p-${playerIndex}`} className="text-center text-xs text-gray-400 py-1 font-bold">
                P{playerIndex + 1}
              </div>
            ))}

            {Array.from({ length: visibleRounds }).map((_, roundIndex) => {
              const round = roundIndex + 1;
              return (
                <div key={`row-${round}`} className="contents">
                  <div
                    key={`round-label-${round}`}
                    className={`text-center text-xs py-1 rounded ${
                      round === currentRound && !isFinished ? 'bg-yellow-500/20 text-yellow-300' : 'text-gray-500'
                    }`}
                  >
                    R{round}
                  </div>
                  {Array.from({ length: playerCount }).map((__, playerIndex) => {
                    const score = roundScores[roundIndex][playerIndex];
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
                        {score === 'BUST' ? 'BUST' : score ?? '-'}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="w-full max-w-[576px] mx-auto">
            <DartBoard
              onDartSelect={handleDartSelect}
              selectedDarts={selectedDarts}
              disabled={isFinished || selectedDarts.length >= DARTS_PER_ROUND}
              showScores={false}
            />
          </div>

          <div className="w-full max-w-[576px] mx-auto mt-3">
            <div className="flex gap-2 mb-2">
              {Array.from({ length: DARTS_PER_ROUND }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-xl py-2 text-center border transition-colors ${
                    selectedDarts[i]
                      ? 'border-yellow-500 bg-yellow-500/10'
                      : 'border-gray-700 bg-gray-900'
                  }`}
                >
                  {selectedDarts[i] ? (
                    <>
                      <p className="text-yellow-400 font-bold text-base leading-tight">{selectedDarts[i].label}</p>
                      <p className="text-gray-400 text-sm">{selectedDarts[i].value} pt</p>
                    </>
                  ) : (
                    <p className="text-gray-600 text-lg leading-none pt-1">-</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={handleUndo}
                disabled={selectedDarts.length === 0 || isFinished}
                className="flex-1 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-base font-bold disabled:opacity-30 transition-colors"
              >
                戻す
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={selectedDarts.length === 0 || isFinished}
                className="flex-1 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-base font-bold disabled:opacity-30 transition-colors"
              >
                クリア
              </button>
            </div>

            <div className="relative flex items-center justify-center pt-3 border-t border-gray-700">
              <div className="text-center">
                <p className="text-gray-500 text-xs uppercase tracking-widest leading-none mb-1">Round Total</p>
                <p className="text-white text-5xl font-black leading-none tabular-nums">{currentRoundScore}</p>
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
        <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-6 text-center">
            <p className="text-yellow-400 text-3xl font-black mb-2">GAME OVER</p>
            <p className="text-white text-lg font-bold mb-6">
              {winnerPlayer !== null ? `Winner: Player ${winnerPlayer + 1}` : '勝者なし'}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleRematch}
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
      )}
    </div>
  );
}

export default function ZeroOne() {
  const navigate = useNavigate();
  const [playerCount, setPlayerCount] = useState<PlayerCount>(1);
  const [startScore, setStartScore] = useState<StartScore>(501);
  const [outRule, setOutRule] = useState<OutRule>('open');
  const [bullMode, setBullMode] = useState<BullMode>('fat');
  const [isGameStarted, setIsGameStarted] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 bg-gray-800 border-b border-gray-700 shrink-0">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white text-base transition-colors shrink-0"
        >
          ← ホームへ
        </button>
        <span className="text-white font-bold tracking-wide text-lg">01</span>
        <div className="w-[64px] shrink-0" />
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        {isGameStarted ? (
          <ZeroOneMain
            playerCount={playerCount}
            startScore={startScore}
            outRule={outRule}
            bullMode={bullMode}
            onExitToHome={() => navigate('/')}
          />
        ) : (
          <ZeroOneSetup
            playerCount={playerCount}
            startScore={startScore}
            outRule={outRule}
            bullMode={bullMode}
            onPlayerCountChange={setPlayerCount}
            onStartScoreChange={setStartScore}
            onOutRuleChange={setOutRule}
            onBullModeChange={setBullMode}
            onStartGame={() => setIsGameStarted(true)}
          />
        )}
      </div>
    </div>
  );
}
