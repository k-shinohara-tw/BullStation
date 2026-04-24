import type { Dart } from '../../types';
import { DartSlot } from './DartSlot';

interface DartSlotRowProps {
  selectedDarts: Dart[];
  count?: number;
}

export const DartSlotRow = ({ selectedDarts, count = 3 }: DartSlotRowProps) => (
  <div className="flex gap-2">
    {Array.from({ length: count }).map((_, i) => (
      <DartSlot key={i} dart={selectedDarts[i]} />
    ))}
  </div>
);
