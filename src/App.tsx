import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import type { OutRule } from './types';
import { getSavedOutRule, getSavedShowScores } from './utils/localStorage';
import Home from './pages/Home';
import StudyMode from './pages/StudyMode';
import TimeAttack from './pages/TimeAttack';

export default function App() {
  const [outRule, setOutRule] = useState<OutRule>(getSavedOutRule);
  const [showScores, setShowScores] = useState<boolean>(getSavedShowScores);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home outRule={outRule} onOutRuleChange={setOutRule} showScores={showScores} onShowScoresChange={setShowScores} />} />
        <Route path="/study" element={<StudyMode outRule={outRule} onOutRuleChange={setOutRule} showScores={showScores} />} />
        <Route path="/timeattack" element={<TimeAttack outRule={outRule} showScores={showScores} />} />
      </Routes>
    </BrowserRouter>
  );
}
