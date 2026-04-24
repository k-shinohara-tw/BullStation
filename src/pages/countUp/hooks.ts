import { useState, useCallback, useEffect } from 'react';
import type { Dart } from '../../types';

export const TOTAL_ROUNDS = 8;
const DARTS_PER_ROUND = 3;

export interface RoundData {
  darts: Dart[];
  total: number;
}

export const RATING_LEVELS = [
  { level: 1, flight: 'C', minScore: 0 },
  { level: 2, flight: 'C', minScore: 320 },
  { level: 3, flight: 'C', minScore: 360 },
  { level: 4, flight: 'CC', minScore: 400 },
  { level: 5, flight: 'CC', minScore: 440 },
  { level: 6, flight: 'B', minScore: 480 },
  { level: 7, flight: 'B', minScore: 520 },
  { level: 8, flight: 'BB', minScore: 560 },
  { level: 9, flight: 'BB', minScore: 600 },
  { level: 10, flight: 'A', minScore: 640 },
  { level: 11, flight: 'A', minScore: 680 },
  { level: 12, flight: 'A', minScore: 720 },
  { level: 13, flight: 'AA', minScore: 760 },
  { level: 14, flight: 'AA', minScore: 816 },
  { level: 15, flight: 'AA', minScore: 872 },
  { level: 16, flight: 'SA', minScore: 928 },
  { level: 17, flight: 'SA', minScore: 984 },
  { level: 18, flight: 'SA', minScore: 1040 },
] as const;

export const getRatingLevel = (score: number): number => {
  let lv = 1;
  for (const r of RATING_LEVELS) {
    if (score >= r.minScore) lv = r.level;
  }
  return lv;
};

export const useCountUp = () => {
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

  const handleDartSelect = (dart: Dart) => {
    if (selectedDarts.length >= DARTS_PER_ROUND) return;
    // Count up rules: outer bull counts as 50
    const d = dart.type === 'bull' ? { ...dart, value: 50 } : dart;
    setSelectedDarts((prev) => [...prev, d]);
  };

  const handleUndo = () => {
    setSelectedDarts((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setSelectedDarts([]);
  };

  const handleConfirm = useCallback(() => {
    if (selectedDarts.length === 0) return;
    const newRounds = [...rounds];
    newRounds[currentRound] = { darts: [...selectedDarts], total: currentRoundScore };
    setRounds(newRounds);
    setSelectedDarts([]);
    if (currentRound + 1 >= TOTAL_ROUNDS) {
      setFinished(true);
    } else {
      setCurrentRound((prev) => prev + 1);
    }
  }, [selectedDarts, rounds, currentRound, currentRoundScore]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleConfirm();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleConfirm]);

  const handleRestart = () => {
    setRounds(Array(TOTAL_ROUNDS).fill(null));
    setCurrentRound(0);
    setSelectedDarts([]);
    setFinished(false);
  };

  return {
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
    handleDartSelect,
    handleUndo,
    handleClear,
    handleConfirm,
    handleRestart,
  };
};
