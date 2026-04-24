import type { Dart, DartSegmentType } from '../types';

export const BOARD_NUMBERS = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
];

const makeDart = (type: DartSegmentType, number?: number): Dart => {
  if (type === 'bull') return { type, value: 25, label: 'Bull' };
  if (type === 'bullseye') return { type, value: 50, label: 'Bull(D)' };
  const n = number!;
  if (type === 'single') return { type, number: n, value: n, label: `${n}` };
  if (type === 'double') return { type, number: n, value: n * 2, label: `D${n}` };
  return { type, number: n, value: n * 3, label: `T${n}` };
};

export const ALL_DARTS: Dart[] = [
  ...Array.from({ length: 20 }, (_, i) => makeDart('single', i + 1)),
  ...Array.from({ length: 20 }, (_, i) => makeDart('double', i + 1)),
  ...Array.from({ length: 20 }, (_, i) => makeDart('triple', i + 1)),
  makeDart('bull'),
  makeDart('bullseye'),
];

export const dartKey = (d: Dart): string => {
  if (d.type === 'bull' || d.type === 'bullseye') return d.type;
  return `${d.type}_${d.number}`;
};

export const DART_BY_VALUE = new Map<string, Dart>(ALL_DARTS.map((d) => [dartKey(d), d]));

export const makeSingleDart = (n: number): Dart => makeDart('single', n);
export const makeDoubleDart = (n: number): Dart => makeDart('double', n);
export const makeTripleDart = (n: number): Dart => makeDart('triple', n);
export const BULL_DART: Dart = makeDart('bull');
export const BULLSEYE_DART: Dart = makeDart('bullseye');
