import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import { Home } from './pages/home';
import { StudyMode } from './pages/studyMode';
import { TimeAttack } from './pages/timeAttack';
import { CountUp } from './pages/countUp';
import { ZeroOne } from './pages/zeroOne';

export const App = () => (
  <SettingsProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/study" element={<StudyMode />} />
        <Route path="/timeattack" element={<TimeAttack />} />
        <Route path="/countup" element={<CountUp />} />
        <Route path="/zeroone" element={<ZeroOne />} />
      </Routes>
    </BrowserRouter>
  </SettingsProvider>
);
