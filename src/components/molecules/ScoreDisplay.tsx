interface ScoreDisplayProps {
  value: number;
  label?: string;
  unit?: string;
  valueColor?: string;
}

export const ScoreDisplay = ({
  value,
  label = '残り',
  unit = '点',
  valueColor = 'text-yellow-400',
}: ScoreDisplayProps) => (
  <div className="text-center bg-gray-800 rounded-2xl p-6">
    {label && <p className="text-gray-400 text-sm mb-1">{label}</p>}
    <p className={`text-6xl font-bold ${valueColor}`}>{value}</p>
    {unit && <p className="text-gray-500 text-sm mt-1">{unit}</p>}
  </div>
);
