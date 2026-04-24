import { useNavigate } from 'react-router-dom';
import { useStudyMode } from './hooks';
import { StudyModeTemplate } from './template';

export const StudyMode = () => {
  const navigate = useNavigate();
  const state = useStudyMode();

  return (
    <StudyModeTemplate
      {...state}
      onRuleChange={state.handleRuleChange}
      onDartSelect={state.handleDartSelect}
      onBack={state.handleBack}
      onClear={state.handleClear}
      onConfirm={state.handleConfirm}
      onNext={state.handleNext}
      onNavigateHome={() => navigate('/')}
    />
  );
};
