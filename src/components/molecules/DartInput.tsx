import type { Dart } from '../../types';

interface DartInputProps {
  selectedDarts: Dart[];
  onBack: () => void;
  onClear: () => void;
  onConfirm: () => void;
  disabled?: boolean;
}

const SLOT_COUNT = 3;

export const DartInput = ({
  selectedDarts,
  onBack,
  onClear,
  onConfirm,
  disabled = false,
}: DartInputProps) => {
  const total = selectedDarts.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Dart slots */}
      <div className="flex gap-3 justify-center">
        {Array.from({ length: SLOT_COUNT }).map((_, i) => {
          const dart = selectedDarts[i];
          return (
            <div
              key={i}
              className={`w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all
                ${
                  dart
                    ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300'
                    : 'border-gray-600 bg-gray-800/50 text-gray-600'
                }`}
            >
              {dart ? (
                <>
                  <span className="text-xl font-bold">{dart.label}</span>
                  <span className="text-sm text-yellow-500">{dart.value}pt</span>
                </>
              ) : (
                <span className="text-2xl">—</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="text-center">
        <span className="text-gray-400 text-sm">合計: </span>
        <span className="text-white text-xl font-bold">{total > 0 ? `${total}pt` : '—'}</span>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onBack}
          disabled={disabled || selectedDarts.length === 0}
          className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium transition-colors"
        >
          戻る
        </button>
        <button
          onClick={onClear}
          disabled={disabled || selectedDarts.length === 0}
          className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium transition-colors"
        >
          クリア
        </button>
      </div>

      <button
        onClick={onConfirm}
        disabled={disabled || selectedDarts.length === 0}
        className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold text-lg transition-colors"
      >
        決定
      </button>
    </div>
  );
};
