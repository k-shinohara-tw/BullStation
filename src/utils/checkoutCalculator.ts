import type { Dart, Checkout, OutRule, DartMissInfo, UserArrangementEval } from '../types';
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

// Common arrange targets: D20, D18, D16, D12 finish points
const GOOD_ARRANGE_SCORES = new Set([40, 36, 32, 24]);

// Preferred finish doubles for 01 theory: safe-chain doubles + D18 (common target)
const PREFERRED_FINISH_DOUBLES = new Set([20, 18, 16, 10, 8, 4, 2]);

// "Practical setup": single first dart → preferred double (or bull) finish.
// This pattern is more reliable than all-triple combinations even if it takes one more dart.
const isPracticalSetup = (checkout: Checkout): boolean => {
  if (checkout.darts.length !== 2) return false;
  const first = checkout.darts[0];
  const last = checkout.darts[1];
  if (first.type !== 'single') return false;
  if (last.type === 'bullseye') return true;
  return last.type === 'double' && PREFERRED_FINISH_DOUBLES.has(last.number!);
};

const getSingleValue = (dart: Dart): number | null => {
  if (dart.type === 'triple' && dart.number !== undefined) return dart.number;
  if (dart.type === 'double' && dart.number !== undefined) return dart.number;
  return null;
};

// Label for a well-known arrange score
const arrangeLabel = (remaining: number): string => {
  if (remaining === 40) return 'D20仕上げ';
  if (remaining === 36) return 'D18仕上げ';
  if (remaining === 32) return 'D16仕上げ';
  if (remaining === 24) return 'D12仕上げ';
  return '';
};

const analyzeMisses = (checkout: Checkout): DartMissInfo[] => {
  const result: DartMissInfo[] = [];
  const { darts, total } = checkout;

  for (let i = 0; i < darts.length; i++) {
    const dart = darts[i];
    const singleVal = getSingleValue(dart);
    if (singleVal === null) continue; // already single or bull — skip

    const scoreUsedSoFar = darts.slice(0, i).reduce((s, d) => s + d.value, 0);
    const remaining = total - scoreUsedSoFar - singleVal;
    if (remaining <= 0) continue;

    const isLastDart = i === darts.length - 1;
    const dartsLeft = darts.length - i - 1;

    let note = '';

    if (isLastDart) {
      // Finishing dart miss: show if remaining leaves a direct double or bull
      if (remaining === 50) {
        note = `外しても残り50→ブル仕上げ可`;
      } else if (remaining % 2 === 0 && remaining >= 2 && remaining <= 40) {
        const dNum = remaining / 2;
        const safeInfo = SAFE_DOUBLE_MAP.get(dNum);
        note = `外しても残り${remaining}→D${dNum}仕上げ可`;
        if (safeInfo) {
          note += `（外しても→${safeInfo.remaining}→D${safeInfo.nextDouble}）`;
        }
      }
    } else {
      // Mid-checkout miss: show useful next-dart opportunities
      if (remaining === 50) {
        note = `残り50→ブル仕上げ可`;
      } else if (remaining >= 51 && remaining <= 70 && dartsLeft >= 2) {
        const singleNeeded = remaining - 50;
        note = `残り${remaining}→S${singleNeeded}+ブル仕上げ可`;
      } else if (GOOD_ARRANGE_SCORES.has(remaining)) {
        note = `残り${remaining}（${arrangeLabel(remaining)}）`;
      } else if (dartsLeft === 1 && remaining >= 51 && remaining <= 70) {
        const neededFor50 = remaining - 50;
        if (neededFor50 >= 1 && neededFor50 <= 20) {
          note = `残り${remaining}→S${neededFor50}で50残し（ブル仕上げ）`;
        }
      }
      if (!note && dartsLeft === 1) {
        for (const arr of GOOD_ARRANGE_SCORES) {
          const needed = remaining - arr;
          if (needed >= 1 && needed <= 20) {
            note = `残り${remaining}→S${needed}で${arr}残し（${arrangeLabel(arr)}）`;
            break;
          }
        }
      }
    }

    if (note) {
      result.push({ dartLabel: dart.label, remaining, note });
    }
  }

  return result;
};

// First dart should be a cricket number triple (T15–T20) or Bullseye.
const isCricketTripleOrBull = (dart: Dart): boolean =>
  (dart.type === 'triple' && dart.number! >= 15) || dart.type === 'bullseye';

export const isStarCheckout = (checkout: Checkout, outRule: OutRule): boolean => {
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

export const getStarReason = (checkout: Checkout, outRule: OutRule): string => {
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

const PRACTICAL_SETUP_BONUS = 15000;

const checkoutQuality = (checkout: Checkout, outRule: OutRule): number => {
  const lengthScore = (4 - checkout.darts.length) * 100000;
  const starBonus = isStarCheckout(checkout, outRule) ? 10000 : 0;
  const practicalBonus = isPracticalSetup(checkout) ? PRACTICAL_SETUP_BONUS : 0;
  const firstScore = dartQuality(checkout.darts[0]);
  return lengthScore + starBonus + practicalBonus + firstScore;
};

export const evaluateUserArrangement = (
  selectedDarts: Dart[],
  targetScore: number,
  outRule: OutRule
): UserArrangementEval => {
  const total = selectedDarts.reduce((s, d) => s + d.value, 0);
  const validationResult = isValidCheckout(selectedDarts, targetScore, outRule);
  const checkout: Checkout = { darts: selectedDarts, total };
  const star = validationResult.valid && isStarCheckout(checkout, outRule);
  return {
    darts: selectedDarts,
    total,
    isValid: validationResult.valid,
    isStar: star,
    starReason: star ? getStarReason(checkout, outRule) : null,
    invalidReason: validationResult.valid ? null : (validationResult.reason ?? null),
  };
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
    .map((co): Checkout => {
      const misses = analyzeMisses(co);
      const base: Checkout = misses.length > 0 ? { ...co, missAnalysis: misses } : co;
      return isStarCheckout(co, outRule)
        ? { ...base, isStar: true, reason: getStarReason(co, outRule) }
        : base;
    });
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
