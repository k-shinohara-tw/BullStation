import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Dart, OutRule, Checkout } from '../types';
import DartBoard from '../components/DartBoard/DartBoard';
import DartInput from '../components/DartInput';
import OutRuleSelector from '../components/OutRuleSelector';
import { isValidCheckout, generateCheckouts } from '../utils/checkoutCalculator';
import { nextQuestion } from '../utils/questionGenerator';
import { saveOutRule } from '../utils/localStorage';

interface StudyModeProps {
  outRule: OutRule;
  onOutRuleChange: (r: OutRule) => void;
  showScores: boolean;
}

type Phase = 'question' | 'result';

interface SessionStats {
  total: number;
  correct: number;
}

export default function StudyMode({ outRule, onOutRuleChange, showScores }: StudyModeProps) {
  const navigate = useNavigate();
  const [score, setScore] = useState<number>(() => nextQuestion(outRule));
  const [selected, setSelected] = useState<Dart[]>([]);
  const [phase, setPhase] = useState<Phase>('question');
  const [resultOk, setResultOk] = useState(false);
  const [resultReason, setResultReason] = useState('');
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [stats, setStats] = useState<SessionStats>({ total: 0, correct: 0 });

  function handleRuleChange(r: OutRule) {
    onOutRuleChange(r);
    saveOutRule(r);
    setScore(nextQuestion(r));
    setSelected([]);
    setPhase('question');
  }

  const handleDartSelect = useCallback((dart: Dart) => {
    if (phase !== 'question') return;
    setSelected(prev => prev.length < 3 ? [...prev, dart] : prev);
  }, [phase]);

  function handleBack() {
    setSelected(prev => prev.slice(0, -1));
  }

  function handleClear() {
    setSelected([]);
  }

  function handleConfirm() {
    const result = isValidCheckout(selected, score, outRule);
    const solutions = generateCheckouts(score, outRule);
    setResultOk(result.valid);
    setResultReason(result.reason ?? '');
    setCheckouts(solutions);
    setStats(prev => ({
      total: prev.total + 1,
      correct: prev.correct + (result.valid ? 1 : 0),
    }));
    setPhase('result');
  }

  function handleNext() {
    setScore(nextQuestion(outRule));
    setSelected([]);
    setPhase('question');
  }

  const correctRate = stats.total > 0
    ? Math.round((stats.correct / stats.total) * 100)
    : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white text-sm">
          ← ホーム
        </button>
        <span className="text-gray-400 text-sm">通常学習</span>
        {correctRate !== null ? (
          <span className="text-sm">
            <span className="text-gray-400">{stats.correct}/{stats.total}</span>
            <span className="text-yellow-400 ml-1">{correctRate}%</span>
          </span>
        ) : (
          <span className="w-16" />
        )}
      </header>

      <div className="flex flex-1 gap-6 p-4 max-w-5xl mx-auto w-full">
        {/* Left: dartboard */}
        <div className="flex flex-col items-center gap-4 flex-1">
          {/* Out rule (compact) */}
          <div className="w-full max-w-sm">
            <OutRuleSelector value={outRule} onChange={handleRuleChange} />
          </div>

          <DartBoard
            onDartSelect={handleDartSelect}
            selectedDarts={selected}
            disabled={phase === 'result'}
            showScores={showScores}
          />
        </div>

        {/* Right: question + input + result */}
        <div className="flex flex-col gap-4 w-64 shrink-0">
          {/* Score */}
          <div className="text-center bg-gray-800 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">残り</p>
            <p className="text-6xl font-bold text-yellow-400">{score}</p>
            <p className="text-gray-500 text-sm mt-1">点</p>
          </div>

          {phase === 'question' ? (
            <DartInput
              selectedDarts={selected}
              onBack={handleBack}
              onClear={handleClear}
              onConfirm={handleConfirm}
            />
          ) : (
            <ResultPanel
              ok={resultOk}
              reason={resultReason}
              selectedDarts={selected}
              checkouts={checkouts}
              onNext={handleNext}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface ResultPanelProps {
  ok: boolean;
  reason: string;
  selectedDarts: Dart[];
  checkouts: Checkout[];
  onNext: () => void;
}

function ResultPanel({ ok, reason, selectedDarts, checkouts, onNext }: ResultPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Verdict */}
      <div className={`rounded-xl p-4 text-center ${ok ? 'bg-green-900/50 border border-green-600' : 'bg-red-900/50 border border-red-600'}`}>
        <p className={`text-2xl font-bold ${ok ? 'text-green-400' : 'text-red-400'}`}>
          {ok ? '正解!' : 'バースト'}
        </p>
        {!ok && <p className="text-red-300 text-xs mt-1">{reason}</p>}
        {ok && (
          <p className="text-sm text-gray-300 mt-1">
            {selectedDarts.map(d => d.label).join(' → ')}
          </p>
        )}
      </div>

      {/* Model answers */}
      <div className="bg-gray-800 rounded-xl p-3">
        <p className="text-gray-400 text-xs mb-2">模範解答</p>
        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
          {checkouts.slice(0, 5).map((co, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {i === 0 && <span className="text-yellow-400 text-xs">★</span>}
              {i > 0 && <span className="text-gray-600 text-xs">・</span>}
              <span className="text-white">{co.darts.map(d => d.label).join(' → ')}</span>
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
}
