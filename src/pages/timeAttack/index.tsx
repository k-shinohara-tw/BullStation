import { useNavigate } from 'react-router-dom';
import { useTimeAttack } from './hooks';
import { TimeAttackTemplate } from './template';

export const TimeAttack = () => {
  const navigate = useNavigate();
  const state = useTimeAttack();

  return (
    <TimeAttackTemplate
      {...state}
      onStart={state.startGame}
      onDartSelect={state.handleDartSelect}
      onBack={state.handleBack}
      onClear={state.handleClear}
      onConfirm={state.handleConfirm}
      onNext={state.handleNext}
      onNavigateHome={() => navigate('/')}
    />
  );
};
