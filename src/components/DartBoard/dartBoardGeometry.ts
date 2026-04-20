import { BOARD_NUMBERS } from '../../utils/dartData';

export const CX = 200;
export const CY = 200;
export const SECTOR_ANGLE = 360 / 20;

// Radii (normalized to 200px board radius)
export const R = {
  bullseye: 13,
  bull: 30,
  singleInner: 97,  // inner single (between bull and triple)
  tripleInner: 110,
  tripleOuter: 124,
  singleOuter: 183,
  doubleInner: 183,
  doubleOuter: 200,
};

export function polarToXY(angleDeg: number, radius: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [CX + radius * Math.cos(rad), CY + radius * Math.sin(rad)];
}

export function arcPath(
  startAngle: number,
  endAngle: number,
  innerR: number,
  outerR: number
): string {
  const [x1, y1] = polarToXY(startAngle, outerR);
  const [x2, y2] = polarToXY(endAngle, outerR);
  const [x3, y3] = polarToXY(endAngle, innerR);
  const [x4, y4] = polarToXY(startAngle, innerR);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${x1} ${y1}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}`,
    'Z',
  ].join(' ');
}

export interface SectorInfo {
  number: number;
  sectorIndex: number;
  startAngle: number;
  endAngle: number;
  midAngle: number;
  labelX: number;
  labelY: number;
  isEven: boolean;
}

export const SECTORS: SectorInfo[] = BOARD_NUMBERS.map((number, i) => {
  const startAngle = i * SECTOR_ANGLE - SECTOR_ANGLE / 2;
  const endAngle = startAngle + SECTOR_ANGLE;
  const midAngle = startAngle + SECTOR_ANGLE / 2;
  const [labelX, labelY] = polarToXY(midAngle, R.doubleOuter + 14);
  return { number, sectorIndex: i, startAngle, endAngle, midAngle, labelX, labelY, isEven: i % 2 === 0 };
});
