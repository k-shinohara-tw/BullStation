import type { Dart } from '../../types';
import { DartBoard } from './DartBoard/DartBoard';
import { DartSlotRow } from '../molecules/DartSlotRow';
import { DartActionButtons } from '../molecules/DartActionButtons';

interface DartControlsProps {
  selectedDarts: Dart[];
  onDartSelect: (dart: Dart) => void;
  onUndo: () => void;
  onClear: () => void;
  disabled?: boolean;
  showScores?: boolean;
  slotCount?: number;
}

export const DartControls = ({
  selectedDarts,
  onDartSelect,
  onUndo,
  onClear,
  disabled = false,
  showScores = false,
  slotCount = 3,
}: DartControlsProps) => (
  <div className="flex flex-col gap-2">
    <div className="w-full max-w-[576px] mx-auto">
      <DartBoard
        onDartSelect={onDartSelect}
        selectedDarts={selectedDarts}
        disabled={disabled || selectedDarts.length >= slotCount}
        showScores={showScores}
      />
    </div>
    <div className="w-full max-w-[576px] mx-auto flex flex-col gap-2">
      <DartSlotRow selectedDarts={selectedDarts} count={slotCount} />
      <DartActionButtons
        onUndo={onUndo}
        onClear={onClear}
        isEmpty={selectedDarts.length === 0}
        disabled={disabled}
      />
    </div>
  </div>
);
