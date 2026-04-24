import type { OutRule, HighScoreEntry } from '../types';

const KEYS = {
  outRule: 'am_out_rule',
  history: 'am_question_history',
  highScores: 'am_high_scores',
  showScores: 'am_show_scores',
} as const;

export const getSavedOutRule = (): OutRule =>
  (localStorage.getItem(KEYS.outRule) as OutRule) ?? 'master';

export const saveOutRule = (rule: OutRule): void => {
  localStorage.setItem(KEYS.outRule, rule);
};

export const getQuestionHistory = (): number[] => {
  try {
    return JSON.parse(localStorage.getItem(KEYS.history) ?? '[]');
  } catch {
    return [];
  }
};

export const addToQuestionHistory = (score: number): void => {
  const history = getQuestionHistory();
  const next = [...history, score].slice(-10);
  localStorage.setItem(KEYS.history, JSON.stringify(next));
};

export const getHighScores = (): HighScoreEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(KEYS.highScores) ?? '[]');
  } catch {
    return [];
  }
};

export const getSavedShowScores = (): boolean => localStorage.getItem(KEYS.showScores) === 'true';

export const saveShowScores = (value: boolean): void => {
  localStorage.setItem(KEYS.showScores, String(value));
};

export const saveHighScore = (entry: HighScoreEntry): void => {
  const scores = getHighScores();
  scores.push(entry);
  scores.sort((a, b) => a.time - b.time);
  localStorage.setItem(KEYS.highScores, JSON.stringify(scores.slice(0, 10)));
};
