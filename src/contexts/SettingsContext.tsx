import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { OutRule } from '../types';
import {
  getSavedOutRule,
  getSavedShowScores,
  saveOutRule,
  saveShowScores,
} from '../utils/localStorage';

interface SettingsContextValue {
  outRule: OutRule;
  setOutRule: (rule: OutRule) => void;
  showScores: boolean;
  setShowScores: (show: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [outRule, setOutRuleState] = useState<OutRule>(getSavedOutRule);
  const [showScores, setShowScoresState] = useState<boolean>(getSavedShowScores);

  const setOutRule = (rule: OutRule) => {
    saveOutRule(rule);
    setOutRuleState(rule);
  };

  const setShowScores = (show: boolean) => {
    saveShowScores(show);
    setShowScoresState(show);
  };

  return (
    <SettingsContext.Provider value={{ outRule, setOutRule, showScores, setShowScores }}>
      {children}
    </SettingsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = (): SettingsContextValue => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
