import type { Dart } from '../../../types';
import {
  makeSingleDart,
  makeDoubleDart,
  makeTripleDart,
  BULL_DART,
  BULLSEYE_DART,
} from '../../../utils/dartData';
import { CX, CY, R, arcPath, SECTORS, polarToXY } from './dartBoardGeometry';

interface DartBoardProps {
  onDartSelect: (dart: Dart) => void;
  selectedDarts: Dart[];
  disabled?: boolean;
  showScores?: boolean;
}

const COLORS = {
  singleEven: '#1a1a1a',
  singleOdd: '#f5e6c8',
  tripleEven: '#c0392b',
  tripleOdd: '#27ae60',
  doubleEven: '#c0392b',
  doubleOdd: '#27ae60',
  bull: '#27ae60',
  bullseye: '#c0392b',
  wire: '#888',
  label: '#f5e6c8',
};

// Mid-radius of each ring for score labels
const MID_R = {
  innerSingle: (R.bull + R.singleInner) / 2,
  triple: (R.tripleInner + R.tripleOuter) / 2,
  outerSingle: (R.tripleOuter + R.doubleInner) / 2,
  double: (R.doubleInner + R.doubleOuter) / 2,
};

export const DartBoard = ({
  onDartSelect,
  selectedDarts,
  disabled = false,
  showScores = false,
}: DartBoardProps) => {
  const dartDisplayKey = (d: Dart): string => {
    if (d.type === 'bull') return 'bull';
    if (d.type === 'bullseye') return 'bullseye';
    return `${d.type}_${d.number}`;
  };

  const selectedKeys = new Set(selectedDarts.map(dartDisplayKey));

  const highlight = (key: string): string =>
    selectedKeys.has(key) ? 'opacity-50 brightness-150' : '';

  const cursorClass = disabled ? 'cursor-not-allowed' : 'cursor-pointer';

  return (
    <svg
      viewBox="-25 -25 450 450"
      className={`w-full max-w-[480px] select-none ${cursorClass}`}
      style={{ filter: disabled ? 'grayscale(40%)' : undefined }}
    >
      {/* Background */}
      <circle cx={CX} cy={CY} r={R.doubleOuter + 8} fill="#111" />

      {SECTORS.map(({ number, startAngle, endAngle, midAngle, labelX, labelY, isEven }) => {
        const singleKey = `single_${number}`;
        const doubleKey = `double_${number}`;
        const tripleKey = `triple_${number}`;

        const [isx, isy] = polarToXY(midAngle, MID_R.innerSingle);
        const [trx, try_] = polarToXY(midAngle, MID_R.triple);
        const [osx, osy] = polarToXY(midAngle, MID_R.outerSingle);
        const [dbx, dby] = polarToXY(midAngle, MID_R.double);

        return (
          <g key={number}>
            {/* Inner single */}
            <path
              d={arcPath(startAngle, endAngle, R.bull, R.singleInner)}
              fill={isEven ? COLORS.singleEven : COLORS.singleOdd}
              stroke={COLORS.wire}
              strokeWidth="0.5"
              className={`${highlight(singleKey)} transition-opacity`}
              onClick={() => !disabled && onDartSelect(makeSingleDart(number))}
            />
            {/* Triple ring */}
            <path
              d={arcPath(startAngle, endAngle, R.tripleInner, R.tripleOuter)}
              fill={isEven ? COLORS.tripleEven : COLORS.tripleOdd}
              stroke={COLORS.wire}
              strokeWidth="0.5"
              className={`${highlight(tripleKey)} transition-opacity`}
              onClick={() => !disabled && onDartSelect(makeTripleDart(number))}
            />
            {/* Outer single */}
            <path
              d={arcPath(startAngle, endAngle, R.tripleOuter, R.doubleInner)}
              fill={isEven ? COLORS.singleEven : COLORS.singleOdd}
              stroke={COLORS.wire}
              strokeWidth="0.5"
              className={`${highlight(singleKey)} transition-opacity`}
              onClick={() => !disabled && onDartSelect(makeSingleDart(number))}
            />
            {/* Double ring */}
            <path
              d={arcPath(startAngle, endAngle, R.doubleInner, R.doubleOuter)}
              fill={isEven ? COLORS.doubleEven : COLORS.doubleOdd}
              stroke={COLORS.wire}
              strokeWidth="0.5"
              className={`${highlight(doubleKey)} transition-opacity`}
              onClick={() => !disabled && onDartSelect(makeDoubleDart(number))}
            />

            {showScores ? (
              <>
                {/* Inner single score */}
                <text
                  x={isx}
                  y={isy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
                  fontWeight="bold"
                  fill={isEven ? '#f5e6c8' : '#1a1a1a'}
                  className="pointer-events-none"
                >
                  {number}
                </text>
                {/* Triple score */}
                <text
                  x={trx}
                  y={try_}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="6.5"
                  fontWeight="bold"
                  fill="white"
                  className="pointer-events-none"
                >
                  {number * 3}
                </text>
                {/* Outer single score */}
                <text
                  x={osx}
                  y={osy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill={isEven ? '#f5e6c8' : '#1a1a1a'}
                  className="pointer-events-none"
                >
                  {number}
                </text>
                {/* Double score */}
                <text
                  x={dbx}
                  y={dby}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="7"
                  fontWeight="bold"
                  fill="white"
                  className="pointer-events-none"
                >
                  {number * 2}
                </text>
              </>
            ) : (
              /* Outer number label */
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fontWeight="bold"
                fill={COLORS.label}
                className="pointer-events-none"
              >
                {number}
              </text>
            )}
          </g>
        );
      })}

      {/* Outer bull (25) */}
      <circle
        cx={CX}
        cy={CY}
        r={R.bull}
        fill={COLORS.bull}
        stroke={COLORS.wire}
        strokeWidth="0.5"
        className={`${highlight('bull')} transition-opacity ${cursorClass}`}
        onClick={() => !disabled && onDartSelect(BULL_DART)}
      />

      {/* Bullseye (50) */}
      <circle
        cx={CX}
        cy={CY}
        r={R.bullseye}
        fill={COLORS.bullseye}
        stroke={COLORS.wire}
        strokeWidth="0.5"
        className={`${highlight('bullseye')} transition-opacity ${cursorClass}`}
        onClick={() => !disabled && onDartSelect(BULLSEYE_DART)}
      />

      {/* Center labels */}
      <text
        x={CX}
        y={CY - 7}
        textAnchor="middle"
        fontSize="7"
        fill="white"
        className="pointer-events-none"
      >
        Bull
      </text>
      <text
        x={CX}
        y={CY + 7}
        textAnchor="middle"
        fontSize="7"
        fill="white"
        className="pointer-events-none"
      >
        D
      </text>
    </svg>
  );
};
