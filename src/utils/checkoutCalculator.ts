import type { Dart, Checkout, OutRule } from '../types';
import { ALL_DARTS } from './dartData';

export function isValidFinish(dart: Dart, outRule: OutRule): boolean {
  if (outRule === 'open') return true;
  if (outRule === 'double') return dart.type === 'double' || dart.type === 'bullseye';
  // master
  return dart.type === 'double' || dart.type === 'triple' || dart.type === 'bullseye';
}

function dartQuality(dart: Dart): number {
  // Higher = better (prefer high-value, preferred finish darts)
  if (dart.type === 'triple') return 1000 + dart.value;
  if (dart.type === 'double') return 800 + dart.value;
  if (dart.type === 'bullseye') return 850;
  if (dart.type === 'bull') return 600;
  return dart.value;
}

function checkoutQuality(checkout: Checkout): number {
  // Fewer darts is better, then quality of first dart
  const lengthScore = (4 - checkout.darts.length) * 100000;
  const firstScore = dartQuality(checkout.darts[0]);
  return lengthScore + firstScore;
}

export function generateCheckouts(score: number, outRule: OutRule): Checkout[] {
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
    .sort((a, b) => checkoutQuality(b) - checkoutQuality(a))
    .slice(0, 10); // 上位10件
}

export function isValidCheckout(
  selectedDarts: Dart[],
  targetScore: number,
  outRule: OutRule
): { valid: boolean; reason?: string } {
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
}

export function canCheckout(score: number, outRule: OutRule): boolean {
  return generateCheckouts(score, outRule).length > 0;
}
