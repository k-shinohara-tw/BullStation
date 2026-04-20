import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Dart } from '../types';
import DartBoard from '../components/DartBoard/DartBoard';

const TOTAL_ROUNDS = 8;
const DARTS_PER_ROUND = 3;

interface RoundData {
  darts: Dart[];
  total: number;
}

// 18-level rating based on Darts Live flight table (01 stats × 8 rounds)
// Flights: C(1-3) → CC(4-5) → B(6-7) → BB(8-9) → A(10-12) → AA(13-15) → SA(16-18)
const RATING_LEVELS = [
  { level: 1,  flight: 'C',  minScore: 0    },
  { level: 2,  flight: 'C',  minScore: 320  },
  { level: 3,  flight: 'C',  minScore: 360  },
  { level: 4,  flight: 'CC', minScore: 400  },
  { level: 5,  flight: 'CC', minScore: 440  },
  { level: 6,  flight: 'B',  minScore: 480  },
  { level: 7,  flight: 'B',  minScore: 520  },
  { level: 8,  flight: 'BB', minScore: 560  },
  { level: 9,  flight: 'BB', minScore: 600  },
  { level: 10, flight: 'A',  minScore: 640  },
  { level: 11, flight: 'A',  minScore: 680  },
  { level: 12, flight: 'A',  minScore: 720  },
  { level: 13, flight: 'AA', minScore: 760  },
  { level: 14, flight: 'AA', minScore: 816  },
  { level: 15, flight: 'AA', minScore: 872  },
  { level: 16, flight: 'SA', minScore: 928  },
  { level: 17, flight: 'SA', minScore: 984  },
  { level: 18, flight: 'SA', minScore: 1040 },
] as const;

function getRatingLevel(score: number): number {
  let lv = 1;
  for (const r of RATING_LEVELS) {
    if (score >= r.minScore) lv = r.level;
  }
  return lv;
}

function segmentColor(level: number): string {
  if (level <= 3)  return '#0891b2';
  if (level <= 5)  return '#0e7490';
  if (level <= 7)  return '#7c3aed';
  if (level <= 9)  return '#6d28d9';
  if (level <= 12) return '#ea580c';
  if (level <= 15) return '#c2410c';
  return '#dc2626';
}

// Show flight label at the highest level of each flight group
const FLIGHT_LABEL_LEVELS = new Set([18, 15, 12, 9, 7, 5, 3]);

interface CountUpProps {
  showScores: boolean;
}

export default function CountUp({ showScores }: CountUpProps) {
  const navigate = useNavigate();
  const [rounds, setRounds] = useState<(RoundData | null)[]>(Array(TOTAL_ROUNDS).fill(null));
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedDarts, setSelectedDarts] = useState<Dart[]>([]);
  const [finished, setFinished] = useState(false);

  const completedRounds = rounds.filter(Boolean).length;
  const totalScore = rounds.reduce<number>((sum, r) => sum + (r?.total ?? 0), 0);
  const currentRoundScore = selectedDarts.reduce((sum, d) => sum + d.value, 0);
  const avgPerRound = completedRounds > 0 ? totalScore / completedRounds : 0;
  const projectedScore = completedRounds > 0 ? Math.round(avgPerRound * TOTAL_ROUNDS) : 0;
  const currentLevel = completedRounds > 0 ? getRatingLevel(projectedScore) : 0;
  const currentFlight = currentLevel > 0 ? RATING_LEVELS[currentLevel - 1].flight : '---';

  function handleDartSelect(dart: Dart) {
    if (selectedDarts.length >= DARTS_PER_ROUND) return;
    // Count up rules: outer bull counts as 50
    const d = dart.type === 'bull' ? { ...dart, value: 50 } : dart;
    setSelectedDarts(prev => [...prev, d]);
  }

  function handleUndo() {
    setSelectedDarts(prev => prev.slice(0, -1));
  }

  function handleClear() {
    setSelectedDarts([]);
  }

  function handleConfirm() {
    if (selectedDarts.length === 0) return;
    const newRounds = [...rounds];
    newRounds[currentRound] = { darts: [...selectedDarts], total: currentRoundScore };
    setRounds(newRounds);
    setSelectedDarts([]);
    if (currentRound + 1 >= TOTAL_ROUNDS) {
      setFinished(true);
    } else {
      setCurrentRound(prev => prev + 1);
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter') handleConfirm();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedDarts, currentRound, rounds, finished]);

  function handleRestart() {
    setRounds(Array(TOTAL_ROUNDS).fill(null));
    setCurrentRound(0);
    setSelectedDarts([]);
    setFinished(false);
  }

  // ── Result screen ──────────────────────────────────────────────────────────
  if (finished) {
    const finalLevel = getRatingLevel(totalScore);
    const finalFlight = RATING_LEVELS[finalLevel - 1].flight;
    const finalColor = segmentColor(finalLevel);
    const avg = totalScore / TOTAL_ROUNDS;

    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-bold text-center text-yellow-400 mb-2">GAME OVER</h2>
          <p className="text-center text-gray-500 text-base mb-8">Count Up 終了</p>

          <div className="bg-gray-800 rounded-2xl p-8 mb-5 text-center">
            <p className="text-gray-400 text-sm mb-2">合計スコア</p>
            <p className="text-7xl font-bold mb-4" style={{ color: finalColor }}>{totalScore}</p>
            <span className="px-5 py-2 rounded-full text-base font-bold border" style={{ color: finalColor, borderColor: finalColor }}>
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
                    {r.darts.map(d => d.label).join('  ')}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button onClick={() => navigate('/')} className="flex-1 py-4 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold text-base transition-colors">
              ホーム
            </button>
            <button onClick={handleRestart} className="flex-1 py-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-base transition-colors">
              もう一度
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Playing screen ─────────────────────────────────────────────────────────
  const reversedLevels = [...RATING_LEVELS].reverse();

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-800 border-b border-gray-700 shrink-0">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white text-base transition-colors shrink-0">
          ← ホーム
        </button>
        <span className="text-white font-bold tracking-wide text-lg">Count Up</span>
        <div className="text-right shrink-0">
          <span className="text-yellow-400 text-3xl font-black leading-none">R{currentRound + 1}</span>
          <span className="text-gray-500 text-base font-bold"> / {TOTAL_ROUNDS}</span>
        </div>
      </div>

      {/* ── Prediction bar ── */}
      <div className="flex items-center justify-center gap-8 px-5 py-3 bg-gray-800 border-b border-gray-700 shrink-0">
        <div className="text-center">
          <p className="text-gray-500 text-xs uppercase tracking-widest leading-none mb-1">予想スコア</p>
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
          <p className="text-gray-500 text-xs uppercase tracking-widest leading-none mb-1">レーティング</p>
          <p className="text-3xl font-black leading-none" style={{ color: currentLevel > 0 ? segmentColor(currentLevel) : '#6b7280' }}>
            {currentLevel > 0 ? currentFlight : '---'}
          </p>
        </div>
      </div>

      {/* ── Main: [Left round list] [Board + dart input] [Right rating bar] ── */}
      <div className="flex flex-1 min-h-0">

        {/* Left: Round list with individual dart scores */}
        <div className="w-[120px] shrink-0 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => {
            const round = rounds[i];
            const isActive = i === currentRound;
            const isDone = round !== null;
            return (
              <div
                key={i}
                className={`px-3 py-2 border-b border-gray-700 last:border-0 min-h-[calc(100%/8)]
                  ${isActive ? 'bg-yellow-500/10' : ''}`}
              >
                {/* R label */}
                <span className={`text-xs font-bold ${isActive ? 'text-yellow-400' : 'text-gray-500'}`}>
                  R{i + 1}
                </span>
                {/* Round total – text-3xl */}
                <p className={`text-3xl font-black leading-tight tabular-nums
                  ${isActive ? 'text-yellow-300' : isDone ? 'text-white' : 'text-gray-600'}`}>
                  {isDone ? round.total : (isActive && currentRoundScore > 0 ? currentRoundScore : '—')}
                </p>
                {/* Individual dart values – text-base */}
                {isDone ? (
                  <div className="flex gap-x-2 mt-0.5">
                    {round.darts.map((d, j) => (
                      <span key={j} className="text-base font-black text-gray-400 leading-tight tabular-nums">{d.value}</span>
                    ))}
                  </div>
                ) : isActive && selectedDarts.length > 0 ? (
                  <div className="flex gap-x-2 mt-0.5">
                    {selectedDarts.map((d, j) => (
                      <span key={j} className="text-base font-black text-yellow-600 leading-tight tabular-nums">{d.value}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Center: DartBoard + dart input + total */}
        <div className="flex-1 min-w-0 flex flex-col py-2.5 px-2.5 overflow-auto">
          {/* Board */}
          <div className="w-full max-w-[576px] mx-auto">
            <DartBoard
              onDartSelect={handleDartSelect}
              selectedDarts={selectedDarts}
              disabled={selectedDarts.length >= DARTS_PER_ROUND}
              showScores={showScores}
            />
          </div>

          {/* Dart slots + undo/clear */}
          <div className="w-full max-w-[576px] mx-auto shrink-0 mt-1.5">
            <div className="flex gap-2 mb-2">
              {Array.from({ length: DARTS_PER_ROUND }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-xl py-2 text-center border transition-colors
                    ${selectedDarts[i] ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-700 bg-gray-800'}`}
                >
                  {selectedDarts[i] ? (
                    <>
                      <p className="text-yellow-400 font-bold text-base leading-tight">{selectedDarts[i].label}</p>
                      <p className="text-gray-400 text-sm">{selectedDarts[i].value}pt</p>
                    </>
                  ) : (
                    <p className="text-gray-600 text-lg leading-none pt-1">—</p>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleUndo}
                disabled={selectedDarts.length === 0}
                className="flex-1 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-base font-bold disabled:opacity-30 transition-colors"
              >
                戻す
              </button>
              <button
                onClick={handleClear}
                disabled={selectedDarts.length === 0}
                className="flex-1 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-base font-bold disabled:opacity-30 transition-colors"
              >
                クリア
              </button>
            </div>
          </div>

          {/* Total score + confirm (between left/right panels at bottom) */}
          <div className="relative flex items-center justify-center mt-auto pt-3 pb-2 shrink-0 border-t border-gray-700">
            <div className="text-center">
              <p className="text-gray-500 text-xs uppercase tracking-widest leading-none mb-1">合計スコア</p>
              <p className="text-white text-6xl font-black leading-none tabular-nums">
                {totalScore + currentRoundScore}
              </p>
              {currentRoundScore > 0 && (
                <p className="text-yellow-400 text-base font-bold mt-1">+{currentRoundScore}</p>
              )}
            </div>
            <button
              onClick={handleConfirm}
              disabled={selectedDarts.length === 0}
              className="absolute right-0 px-6 py-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {currentRound === TOTAL_ROUNDS - 1 ? 'RoundOver' : 'RoundChange'}
            </button>
          </div>
        </div>

        {/* Right: Vertical rating bar */}
        <div className="w-[100px] shrink-0 bg-gray-800 border-l border-gray-700 flex flex-col py-1.5 px-2">
          {reversedLevels.map(({ level, flight }) => {
            const filled = currentLevel > 0 && level <= currentLevel;
            const isCurrent = currentLevel > 0 && level === currentLevel;
            const showFlight = FLIGHT_LABEL_LEVELS.has(level);

            return (
              <div key={level} className="flex items-center gap-1 flex-1" style={{ minHeight: 0 }}>
                {/* Flight label (left) */}
                <span className={`text-sm font-bold w-[34px] text-right leading-none shrink-0
                  ${filled ? 'text-white' : 'text-gray-600'}`}>
                  {showFlight ? flight : ''}
                </span>
                {/* Bar segment */}
                <div
                  className={`flex-1 h-full transition-colors duration-300
                    ${isCurrent ? 'ring-1 ring-white ring-inset' : ''}`}
                  style={{
                    backgroundColor: filled ? segmentColor(level) : '#1f2937',
                    minHeight: '5px',
                  }}
                />
                {/* Level number (right) */}
                <span className={`text-sm font-bold w-[24px] text-left leading-none shrink-0
                  ${filled ? 'text-white' : 'text-gray-600'}`}>
                  {level}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
