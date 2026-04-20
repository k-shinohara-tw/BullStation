export type OutRule = 'open' | 'double' | 'master';

export type DartSegmentType = 'single' | 'double' | 'triple' | 'bull' | 'bullseye';

export interface Dart {
  type: DartSegmentType;
  number?: number;
  value: number;
  label: string;
}

export interface Checkout {
  darts: Dart[];
  total: number;
}

export interface HighScoreEntry {
  time: number;
  correct: number;
  outRule: OutRule;
  date: string;
}

export type GamePhase = 'question' | 'result';
