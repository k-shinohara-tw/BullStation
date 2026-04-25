import type { Dart, Checkout, OutRule } from '../types';
import { ALL_DARTS } from './dartData';

export const isValidFinish = (dart: Dart, outRule: OutRule): boolean => {
  if (outRule === 'open') return true;
  if (outRule === 'double') return dart.type === 'double' || dart.type === 'bullseye';
  // master
  return dart.type === 'double' || dart.type === 'triple' || dart.type === 'bullseye';
};

// Safe doubles: missing the double and hitting the single still leaves a double path.
// e.g. D16(32) → miss → 16 → D8 → miss → 8 → D4 → …
const SAFE_DOUBLE_MAP = new Map<number, { remaining: number; nextDouble: number }>([
  [20, { remaining: 20, nextDouble: 10 }], // D20 → miss → 20 → D10
  [16, { remaining: 16, nextDouble: 8 }], // D16 → miss → 16 → D8
  [10, { remaining: 10, nextDouble: 5 }], // D10 → miss → 10 → D5
  [8, { remaining: 8, nextDouble: 4 }], // D8  → miss → 8  → D4
  [4, { remaining: 4, nextDouble: 2 }], // D4  → miss → 4  → D2
  [2, { remaining: 2, nextDouble: 1 }], // D2  → miss → 2  → D1
]);

// First dart should be a cricket number triple (T15–T20) or Bullseye.
const isCricketTripleOrBull = (dart: Dart): boolean =>
  (dart.type === 'triple' && dart.number! >= 15) || dart.type === 'bullseye';

const isStarCheckout = (checkout: Checkout, outRule: OutRule): boolean => {
  const first = checkout.darts[0];
  if (!isCricketTripleOrBull(first)) return false;

  // For double/master out, the finishing double must be in the safe-double map.
  if (outRule !== 'open') {
    const last = checkout.darts[checkout.darts.length - 1];
    if (last.type !== 'double') return false;
    return SAFE_DOUBLE_MAP.has(last.number!);
  }

  return true; // open out: first-dart condition alone is sufficient
};

const getStarReason = (checkout: Checkout, outRule: OutRule): string => {
  const first = checkout.darts[0];
  const last = checkout.darts[checkout.darts.length - 1];

  const firstPart =
    first.type === 'bullseye' ? 'ブル始動' : `${first.label}始動（クリケットナンバー）`;

  if (outRule !== 'open' && last.type === 'double') {
    const info = SAFE_DOUBLE_MAP.get(last.number!);
    if (info) {
      return `${firstPart} / ${last.label}仕上げ（外しても→${info.remaining}→D${info.nextDouble}）`;
    }
  }

  return firstPart;
};

const dartQuality = (dart: Dart): number => {
  if (dart.type === 'triple') return 1000 + dart.value;
  if (dart.type === 'double') return 800 + dart.value;
  if (dart.type === 'bullseye') return 850;
  if (dart.type === 'bull') return 600;
  return dart.value;
};

const checkoutQuality = (checkout: Checkout, outRule: OutRule): number => {
  const lengthScore = (4 - checkout.darts.length) * 100000;
  const starBonus = isStarCheckout(checkout, outRule) ? 10000 : 0;
  const firstScore = dartQuality(checkout.darts[0]);
  return lengthScore + starBonus + firstScore;
};

export const generateCheckouts = (score: number, outRule: OutRule): Checkout[] => {
  const results: Checkout[] = [];

  // 1 dart
  for (const d1 of ALL_DARTS) {
    if (d1.value === score && isValidFinish(d1, outRule)) {
      results.push({ darts: [d1], total: score });
    }
  }

  // 2 darts
  for (const d1 of ALL_DARTS) {
    if (d1.value >= score) continue;
    const rem1 = score - d1.value;
    for (const d2 of ALL_DARTS) {
      if (d2.value === rem1 && isValidFinish(d2, outRule)) {
        results.push({ darts: [d1, d2], total: score });
      }
    }
  }

  // 3 darts
  for (const d1 of ALL_DARTS) {
    if (d1.value >= score) continue;
    for (const d2 of ALL_DARTS) {
      const after2 = d1.value + d2.value;
      if (after2 >= score) continue;
      const rem2 = score - after2;
      for (const d3 of ALL_DARTS) {
        if (d3.value === rem2 && isValidFinish(d3, outRule)) {
          results.push({ darts: [d1, d2, d3], total: score });
        }
      }
    }
  }

  return results
    .sort((a, b) => checkoutQuality(b, outRule) - checkoutQuality(a, outRule))
    .slice(0, 10)
    .map(
      (co): Checkout =>
        isStarCheckout(co, outRule)
          ? { ...co, isStar: true, reason: getStarReason(co, outRule) }
          : co
    );
};

export const isValidCheckout = (
  selectedDarts: Dart[],
  targetScore: number,
  outRule: OutRule
): { valid: boolean; reason?: string } => {
  if (selectedDarts.length === 0) {
    return { valid: false, reason: '1本以上選択してください' };
  }

  const total = selectedDarts.reduce((sum, d) => sum + d.value, 0);
  if (total !== targetScore) {
    return { valid: false, reason: `合計 ${total} 点 — 残り ${targetScore} 点に合いません` };
  }

  const lastDart = selectedDarts[selectedDarts.length - 1];
  if (!isValidFinish(lastDart, outRule)) {
    const ruleLabel = outRule === 'double' ? 'ダブルアウト' : 'マスターアウト';
    return {
      valid: false,
      reason: `バースト — ${ruleLabel}では最後の1投が${outRule === 'double' ? 'ダブルまたはブル(D)' : 'ダブル・トリプルまたはブル(D)'}で終わる必要があります`,
    };
  }

  return { valid: true };
};

export const canCheckout = (score: number, outRule: OutRule): boolean =>
  generateCheckouts(score, outRule).length > 0;
