import { useState, useEffect, useRef, useCallback } from 'react';
import type { Dart, Checkout } from '../../types';
import { isValidCheckout, generateCheckouts } from '../../utils/checkoutCalculator';
import { nextQuestion } from '../../utils/questionGenerator';
import { getHighScores, saveHighScore } from '../../utils/localStorage';
import { useSettings } from '../../contexts/SettingsContext';

export const TOTAL_QUESTIONS = 10;

export type Phase = 'ready' | 'playing' | 'result_q' | 'finished';

export interface QuestionResult {
  score: number;
  ok: boolean;
  selected: Dart[];
  checkouts: Checkout[];
}

export const useTimeAttack = () => {
  const { outRule, showScores } = useSettings();
  const [phase, setPhase] = useState<Phase>('ready');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<Dart[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [currentResult, setCurrentResult] = useState<QuestionResult | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startGame = () => {
    const firstScore = nextQuestion(outRule);
    setScore(firstScore);
    setSelected([]);
    setQuestionIndex(0);
    setResults([]);
    setElapsed(0);
    setPhase('playing');
    startTimeRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 100) / 10);
    }, 100);
  };

  const handleDartSelect = useCallback(
    (dart: Dart) => {
      if (phase !== 'playing') return;
      setSelected((prev) => (prev.length < 3 ? [...prev, dart] : prev));
    },
    [phase]
  );

  const handleConfirm = () => {
    const result = isValidCheckout(selected, score, outRule);
    const checkouts = generateCheckouts(score, outRule);
    const qr: QuestionResult = { score, ok: result.valid, selected, checkouts };
    const newResults = [...results, qr];
    setResults(newResults);
    setCurrentResult(qr);
    setPhase('result_q');

    if (newResults.length >= TOTAL_QUESTIONS) {
      if (timerRef.current) clearInterval(timerRef.current);
      const finalTime = Math.floor((Date.now() - startTimeRef.current) / 100) / 10;
      setElapsed(finalTime);
      const correct = newResults.filter((r) => r.ok).length;
      saveHighScore({ time: finalTime, correct, outRule, date: new Date().toISOString() });
    }
  };

  const handleNext = () => {
    if (results.length >= TOTAL_QUESTIONS) {
      setPhase('finished');
      return;
    }
    setScore(nextQuestion(outRule));
    setSelected([]);
    setCurrentResult(null);
    setPhase('playing');
  };

  const handleBack = () => {
    setSelected((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setSelected([]);
  };

  const correctCount = results.filter((r) => r.ok).length;
  const highScores = getHighScores().filter((h) => h.outRule === outRule);

  return {
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
    startGame,
    handleDartSelect,
    handleBack,
    handleClear,
    handleConfirm,
    handleNext,
  };
};
