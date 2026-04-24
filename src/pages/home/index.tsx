import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';
import { HomeTemplate } from './template';

export const Home = () => {
  const navigate = useNavigate();
  const { outRule, setOutRule, showScores, setShowScores } = useSettings();

  return (
    <HomeTemplate
      outRule={outRule}
      showScores={showScores}
      onOutRuleChange={setOutRule}
      onShowScoresChange={setShowScores}
      onNavigate={navigate}
    />
  );
};
