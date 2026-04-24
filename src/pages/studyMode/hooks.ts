import { useState, useCallback } from 'react';
import type { Dart, Checkout, OutRule } from '../../types';
import { isValidCheckout, generateCheckouts } from '../../utils/checkoutCalculator';
import { nextQuestion } from '../../utils/questionGenerator';
import { useSettings } from '../../contexts/SettingsContext';

export type Phase = 'question' | 'result';

interface SessionStats {
  total: number;
  correct: number;
}

export interface StudyState {
  outRule: OutRule;
  showScores: boolean;
  score: number;
  selected: Dart[];
  phase: Phase;
  resultOk: boolean;
  resultReason: string;
  checkouts: Checkout[];
  stats: SessionStats;
  correctRate: number | null;
}

export const useStudyMode = () => {
  const { outRule, setOutRule, showScores } = useSettings();
  const [score, setScore] = useState<number>(() => nextQuestion(outRule));
  const [selected, setSelected] = useState<Dart[]>([]);
  const [phase, setPhase] = useState<Phase>('question');
  const [resultOk, setResultOk] = useState(false);
  const [resultReason, setResultReason] = useState('');
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [stats, setStats] = useState<SessionStats>({ total: 0, correct: 0 });

  const handleRuleChange = (r: OutRule) => {
    setOutRule(r);
    setScore(nextQuestion(r));
    setSelected([]);
    setPhase('question');
  };

  const handleDartSelect = useCallback(
    (dart: Dart) => {
      if (phase !== 'question') return;
      setSelected((prev) => (prev.length < 3 ? [...prev, dart] : prev));
    },
    [phase]
  );

  const handleBack = () => {
    setSelected((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setSelected([]);
  };

  const handleConfirm = () => {
    const result = isValidCheckout(selected, score, outRule);
    const solutions = generateCheckouts(score, outRule);
    setResultOk(result.valid);
    setResultReason(result.reason ?? '');
    setCheckouts(solutions);
    setStats((prev) => ({
      total: prev.total + 1,
      correct: prev.correct + (result.valid ? 1 : 0),
    }));
    setPhase('result');
  };

  const handleNext = () => {
    setScore(nextQuestion(outRule));
    setSelected([]);
    setPhase('question');
  };

  const correctRate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : null;

  return {
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
    handleRuleChange,
    handleDartSelect,
    handleBack,
    handleClear,
    handleConfirm,
    handleNext,
  };
};
