import { useState } from 'react';
import type { Dart, OutRule } from '../../types';

export type PlayerCount = 1 | 2 | 3 | 4;
export type StartScore = 301 | 501 | 701 | 901 | 1101 | 1501;
export type BullMode = 'separate' | 'fat';
export type RoundScoreCell = number | 'BUST' | null;

export const MAX_ROUNDS = 20;
export const DARTS_PER_ROUND = 3;

const canCheckoutByOutRule = (lastDart: Dart, outRule: OutRule): boolean => {
  if (outRule === 'open') return true;
  if (outRule === 'double') return lastDart.type === 'double' || lastDart.type === 'bullseye';
  return (
    lastDart.type === 'double' ||
    lastDart.type === 'triple' ||
    lastDart.type === 'bull' ||
    lastDart.type === 'bullseye'
  );
};

interface UseZeroOneGameParams {
  playerCount: PlayerCount;
  startScore: StartScore;
  outRule: OutRule;
  bullMode: BullMode;
}

export const useZeroOneGame = ({
  playerCount,
  startScore,
  outRule,
  bullMode,
}: UseZeroOneGameParams) => {
  const [selectedDarts, setSelectedDarts] = useState<Dart[]>([]);
  const [roundScores, setRoundScores] = useState<RoundScoreCell[][]>(() =>
    Array.from({ length: MAX_ROUNDS }, () => Array.from({ length: playerCount }, () => null))
  );
  const [currentRound, setCurrentRound] = useState(1);
  const [turnPlayerPos, setTurnPlayerPos] = useState(0);
  const [playerOrder, setPlayerOrder] = useState<number[]>(
    Array.from({ length: playerCount }, (_, i) => i)
  );
  const [isFinished, setIsFinished] = useState(false);
  const [winnerPlayer, setWinnerPlayer] = useState<number | null>(null);

  const scoreDartByBullMode = (dart: Dart): Dart => {
    if (bullMode === 'fat') {
      if (dart.type === 'bull' || dart.type === 'bullseye') return { ...dart, value: 50 };
      return dart;
    }
    if (dart.type === 'bull') return { ...dart, value: 25 };
    if (dart.type === 'bullseye') return { ...dart, value: 50 };
    return dart;
  };

  const roundCellToPoints = (cell: RoundScoreCell): number => (typeof cell === 'number' ? cell : 0);

  const currentRoundScore = selectedDarts.reduce((sum, dart) => sum + dart.value, 0);
  const visibleRounds = currentRound <= 10 ? 10 : currentRound <= 15 ? 15 : 20;
  const playerTotals = Array.from({ length: playerCount }, (_, playerIndex) =>
    roundScores.reduce((sum, row) => sum + roundCellToPoints(row[playerIndex]), 0)
  );
  const activePlayerIndex = playerOrder[turnPlayerPos];
  const currentPlayerTotal = playerTotals[activePlayerIndex] ?? 0;
  const currentPlayerRemaining = startScore - currentPlayerTotal;

  const handleDartSelect = (dart: Dart) => {
    if (isFinished || selectedDarts.length >= DARTS_PER_ROUND) return;
    setSelectedDarts((prev) => [...prev, scoreDartByBullMode(dart)]);
  };

  const handleUndo = () => {
    setSelectedDarts((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setSelectedDarts([]);
  };

  const advanceTurn = () => {
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
  };

  const handleRoundChange = () => {
    if (selectedDarts.length === 0 || isFinished) return;

    const remainingAfterThrow = startScore - currentPlayerTotal - currentRoundScore;
    const lastDart = selectedDarts[selectedDarts.length - 1];

    if (
      remainingAfterThrow < 0 ||
      (remainingAfterThrow === 0 && !canCheckoutByOutRule(lastDart, outRule))
    ) {
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
  };

  const handleRematch = () => {
    setRoundScores(
      Array.from({ length: MAX_ROUNDS }, () => Array.from({ length: playerCount }, () => null))
    );
    setSelectedDarts([]);
    setCurrentRound(1);
    setTurnPlayerPos(0);
    setWinnerPlayer(null);
    setIsFinished(false);
    setPlayerOrder((prev) => [...prev].reverse());
  };

  return {
    selectedDarts,
    roundScores,
    currentRound,
    isFinished,
    winnerPlayer,
    currentRoundScore,
    visibleRounds,
    playerTotals,
    activePlayerIndex,
    currentPlayerTotal,
    currentPlayerRemaining,
    handleDartSelect,
    handleUndo,
    handleClear,
    handleRoundChange,
    handleRematch,
  };
};
