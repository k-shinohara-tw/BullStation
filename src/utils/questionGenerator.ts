import type { OutRule } from '../types';
import { canCheckout } from './checkoutCalculator';
import { getQuestionHistory, addToQuestionHistory } from './localStorage';

function buildPool(outRule: OutRule): number[] {
  const pool: number[] = [];
  for (let i = 21; i <= 180; i++) {
    if (canCheckout(i, outRule)) pool.push(i);
  }
  return pool;
}

// Cache pools per rule to avoid recalculating
const poolCache = new Map<OutRule, number[]>();

export function getPool(outRule: OutRule): number[] {
  if (!poolCache.has(outRule)) {
    poolCache.set(outRule, buildPool(outRule));
  }
  return poolCache.get(outRule)!;
}

export function nextQuestion(outRule: OutRule): number {
  const pool = getPool(outRule);
  const history = getQuestionHistory();
  const candidates = pool.filter(n => !history.includes(n));
  const source = candidates.length > 0 ? candidates : pool;
  const score = source[Math.floor(Math.random() * source.length)];
  addToQuestionHistory(score);
  return score;
}
