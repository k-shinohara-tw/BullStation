import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Dart, OutRule, Checkout } from '../types';
import DartBoard from '../components/DartBoard/DartBoard';
import DartInput from '../components/DartInput';
import { isValidCheckout, generateCheckouts } from '../utils/checkoutCalculator';
import { nextQuestion } from '../utils/questionGenerator';
import { getHighScores, saveHighScore } from '../utils/localStorage';

const TOTAL_QUESTIONS = 10;

interface TimeAttackProps {
  outRule: OutRule;
  showScores: boolean;
}

type Phase = 'ready' | 'playing' | 'result_q' | 'finished';

interface QuestionResult {
  score: number;
  ok: boolean;
  selected: Dart[];
  checkouts: Checkout[];
}

export default function TimeAttack({ outRule, showScores }: TimeAttackProps) {
  const navigate = useNavigate();
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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function startGame() {
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
  }

  const handleDartSelect = useCallback((dart: Dart) => {
    if (phase !== 'playing') return;
    setSelected(prev => prev.length < 3 ? [...prev, dart] : prev);
  }, [phase]);

  function handleConfirm() {
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
      const correct = newResults.filter(r => r.ok).length;
      saveHighScore({ time: finalTime, correct, outRule, date: new Date().toISOString() });
    }
  }

  function handleNext() {
    if (results.length >= TOTAL_QUESTIONS) {
      setPhase('finished');
      return;
    }
    setScore(nextQuestion(outRule));
    setSelected([]);
    setCurrentResult(null);
    setPhase('playing');
  }

  const correctCount = results.filter(r => r.ok).length;
  const highScores = getHighScores().filter(h => h.outRule === outRule);

  if (phase === 'ready') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white text-sm mb-8 block">
            ← ホーム
          </button>
          <h2 className="text-3xl font-bold text-yellow-400 mb-2">タイムアタック</h2>
          <p className="text-gray-400 mb-1">10問を最速で解いてください</p>
          <p className="text-gray-500 text-sm mb-8">アウトルール: <span className="text-white">{outRule === 'open' ? 'オープン' : outRule === 'double' ? 'ダブル' : 'マスター'}</span></p>

          {highScores.length > 0 && (
            <div className="bg-gray-800 rounded-xl p-4 mb-6">
              <p className="text-gray-400 text-sm mb-2">ハイスコア</p>
              {highScores.slice(0, 3).map((h, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span className="text-gray-400">#{i + 1}</span>
                  <span className="text-yellow-400 font-bold">{h.time}秒</span>
                  <span className="text-gray-400">{h.correct}/{TOTAL_QUESTIONS}正解</span>
                  <span className="text-gray-600 text-xs">{new Date(h.date).toLocaleDateString('ja-JP')}</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={startGame}
            className="w-full py-4 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xl transition-colors"
          >
            スタート
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'finished') {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <h2 className="text-3xl font-bold text-yellow-400 mb-6">結果</h2>
          <div className="bg-gray-800 rounded-2xl p-6 mb-6">
            <p className="text-gray-400 text-sm mb-1">タイム</p>
            <p className="text-5xl font-bold text-white mb-4">{elapsed}<span className="text-2xl text-gray-400">秒</span></p>
            <p className="text-gray-400 text-sm mb-1">正解数</p>
            <p className="text-3xl font-bold text-yellow-400">{correctCount}<span className="text-gray-400 text-lg">/{TOTAL_QUESTIONS}</span></p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4 mb-6 text-left">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-2 py-1 text-sm border-b border-gray-700 last:border-0">
                <span className={r.ok ? 'text-green-400' : 'text-red-400'}>{r.ok ? '○' : '✗'}</span>
                <span className="text-gray-400 w-10">残{r.score}</span>
                <span className="text-white">{r.selected.map(d => d.label).join('→')}</span>
                {!r.ok && r.checkouts[0] && (
                  <span className="text-gray-500 text-xs ml-auto">{r.checkouts[0].darts.map(d => d.label).join('→')}</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={startGame} className="flex-1 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition-colors">
              もう一度
            </button>
            <button onClick={() => navigate('/')} className="flex-1 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold transition-colors">
              ホーム
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white text-sm">← ホーム</button>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{questionIndex + 1}/{TOTAL_QUESTIONS}</span>
          <span className="text-yellow-400 font-bold text-lg">{elapsed}s</span>
        </div>
        <span className="text-sm text-gray-400">{correctCount}正解</span>
      </header>

      <div className="flex flex-1 gap-6 p-4 max-w-5xl mx-auto w-full">
        {/* Dartboard */}
        <div className="flex flex-col items-center gap-4 flex-1">
          <DartBoard
            onDartSelect={handleDartSelect}
            showScores={showScores}
            selectedDarts={selected}
            disabled={phase === 'result_q'}
          />
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4 w-64 shrink-0">
          <div className="text-center bg-gray-800 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">残り</p>
            <p className="text-6xl font-bold text-yellow-400">{score}</p>
            <p className="text-gray-500 text-sm mt-1">点</p>
          </div>

          {phase === 'playing' ? (
            <DartInput
              selectedDarts={selected}
              onBack={() => setSelected(p => p.slice(0, -1))}
              onClear={() => setSelected([])}
              onConfirm={handleConfirm}
            />
          ) : currentResult && (
            <TAResultPanel result={currentResult} onNext={handleNext} isLast={results.length >= TOTAL_QUESTIONS} />
          )}
        </div>
      </div>
    </div>
  );
}

function TAResultPanel({ result, onNext, isLast }: { result: QuestionResult; onNext: () => void; isLast: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <div className={`rounded-xl p-4 text-center ${result.ok ? 'bg-green-900/50 border border-green-600' : 'bg-red-900/50 border border-red-600'}`}>
        <p className={`text-2xl font-bold ${result.ok ? 'text-green-400' : 'text-red-400'}`}>
          {result.ok ? '正解!' : 'バースト'}
        </p>
        {result.ok && (
          <p className="text-sm text-gray-300 mt-1">{result.selected.map(d => d.label).join(' → ')}</p>
        )}
      </div>

      {!result.ok && result.checkouts[0] && (
        <div className="bg-gray-800 rounded-xl p-3 text-sm">
          <p className="text-gray-400 text-xs mb-1">例: {result.checkouts[0].darts.map(d => d.label).join(' → ')}</p>
        </div>
      )}

      <button onClick={onNext} className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg transition-colors">
        {isLast ? '結果を見る' : '次の問題'}
      </button>
    </div>
  );
}
