interface DartActionButtonsProps {
  onUndo: () => void;
  onClear: () => void;
  isEmpty: boolean;
  disabled?: boolean;
}

export const DartActionButtons = ({
  onUndo,
  onClear,
  isEmpty,
  disabled = false,
}: DartActionButtonsProps) => (
  <div className="flex gap-2">
    <button
      type="button"
      onClick={onUndo}
      disabled={disabled || isEmpty}
      className="flex-1 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-base font-bold disabled:opacity-30 transition-colors"
    >
      戻す
    </button>
    <button
      type="button"
      onClick={onClear}
      disabled={disabled || isEmpty}
      className="flex-1 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-base font-bold disabled:opacity-30 transition-colors"
    >
      クリア
    </button>
  </div>
);
