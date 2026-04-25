export type OutRule = 'open' | 'double' | 'master';

export type DartSegmentType = 'single' | 'double' | 'triple' | 'bull' | 'bullseye';

export interface Dart {
  type: DartSegmentType;
  number?: number;
  value: number;
  label: string;
}

export interface DartMissInfo {
  dartLabel: string;
  remaining: number;
  note: string;
}

export interface Checkout {
  darts: Dart[];
  total: number;
  isStar?: boolean;
  reason?: string;
  missAnalysis?: DartMissInfo[];
}

export interface UserArrangementEval {
  darts: Dart[];
  total: number;
  isValid: boolean;
  isStar: boolean;
  starReason: string | null;
  invalidReason: string | null;
}

export interface HighScoreEntry {
  time: number;
  correct: number;
  outRule: OutRule;
  date: string;
}

export type GamePhase = 'question' | 'result';
