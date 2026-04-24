import type { Dart } from '../../types';

interface DartSlotProps {
  dart?: Dart;
}

export const DartSlot = ({ dart }: DartSlotProps) => (
  <div
    className={`flex-1 rounded-xl py-2 text-center border transition-colors ${
      dart ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-700 bg-gray-900'
    }`}
  >
    {dart ? (
      <>
        <p className="text-yellow-400 font-bold text-base leading-tight">{dart.label}</p>
        <p className="text-gray-400 text-sm">{dart.value} pt</p>
      </>
    ) : (
      <p className="text-gray-600 text-lg leading-none pt-1">—</p>
    )}
  </div>
);
