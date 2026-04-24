import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import { useCountUp } from './hooks';
import { CountUpTemplate } from './template';

export const CountUp = () => {
  const navigate = useNavigate();
  const { showScores } = useSettings();
  const state = useCountUp();

  return (
    <CountUpTemplate {...state} showScores={showScores} onNavigateHome={() => navigate('/')} />
  );
};
