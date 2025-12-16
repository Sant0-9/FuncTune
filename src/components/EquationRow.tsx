import { useState, useRef, useEffect, useMemo } from 'react';
import type { Equation } from '../store/synthStore';
import { Knob } from './Knob';
import { validateFormula } from '../utils/formulaValidator';

interface EquationRowProps {
  equation: Equation;
  onFormulaChange: (formula: string) => void;
  onVolumeChange: (volume: number) => void;
  onToggle: () => void;
  onRemove: () => void;
  onDuplicate?: () => void;
  onCopy?: () => void;
  canRemove: boolean;
}

export const EquationRow = ({
  equation,
  onFormulaChange,
  onVolumeChange,
  onToggle,
  onRemove,
  onDuplicate,
  onCopy,
  canRemove,
}: EquationRowProps) => {
  const [localFormula, setLocalFormula] = useState(equation.formula);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Validate formula and get error state
  const validation = useMemo(() => validateFormula(localFormula), [localFormula]);
  const hasError = !validation.isValid;

  // Sync external changes
  useEffect(() => {
    if (!isFocused) {
      setLocalFormula(equation.formula);
    }
  }, [equation.formula, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalFormula(value);

    // Debounce the update to audio
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onFormulaChange(value);
    }, 300);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Immediate update on blur
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    onFormulaChange(localFormula);
  };

  return (
    <div
      className="flex items-center gap-4 p-3 rounded"
      style={{
        background: equation.enabled
          ? 'linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)'
          : 'rgba(0,0,0,0.2)',
        borderLeft: `3px solid ${equation.enabled ? equation.color : '#333'}`,
        opacity: equation.enabled ? 1 : 0.5,
      }}
    >
      {/* Enable/Disable toggle */}
      <button
        onClick={onToggle}
        className="w-8 h-8 flex items-center justify-center rounded transition-all"
        style={{
          background: equation.enabled ? equation.color + '22' : 'transparent',
          border: `1px solid ${equation.enabled ? equation.color : '#333'}`,
        }}
        title={equation.enabled ? 'Disable equation' : 'Enable equation'}
      >
        <div
          className="w-3 h-3 rounded-full transition-all"
          style={{
            background: equation.enabled ? equation.color : '#333',
            boxShadow: equation.enabled ? `0 0 10px ${equation.color}` : 'none',
          }}
        />
      </button>

      {/* Formula input */}
      <div className="flex-1">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={localFormula}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            spellCheck={false}
            className="w-full px-4 py-2 font-mono text-sm rounded outline-none transition-all"
            style={{
              background: isFocused ? '#0a0a0a' : '#111',
              border: `1px solid ${hasError ? '#ff4444' : isFocused ? equation.color : '#2a2a2a'}`,
              color: hasError ? '#ff8888' : '#e0e0e0',
              boxShadow: hasError
                ? '0 0 10px #ff444433'
                : isFocused ? `0 0 10px ${equation.color}33` : 'none',
            }}
            placeholder="sin(t * freq * 2 * PI)"
          />
          {/* Equation label */}
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono opacity-50"
            style={{ color: hasError ? '#ff4444' : equation.color }}
          >
            f{equation.id}(t)
          </span>
        </div>
        {/* Error message */}
        {hasError && validation.error && (
          <div
            className="mt-1 px-2 text-xs font-mono flex items-center gap-1"
            style={{ color: '#ff6666' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 3.5V6.5M6 8V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {validation.error}
          </div>
        )}
        {/* Preview value at t=0 */}
        {!hasError && validation.previewValue !== null && isFocused && (
          <div
            className="mt-1 px-2 text-xs font-mono"
            style={{ color: '#666' }}
          >
            f(0) = {validation.previewValue.toFixed(4)}
          </div>
        )}
      </div>

      {/* Volume knob */}
      <div className="flex-shrink-0">
        <Knob
          label="MIX"
          value={equation.volume}
          onChange={onVolumeChange}
          min={0}
          max={1}
          size={50}
          color={equation.color}
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {/* Copy button */}
        {onCopy && (
          <button
            onClick={onCopy}
            className="w-7 h-7 flex items-center justify-center rounded transition-all hover:bg-white/5"
            style={{
              background: 'transparent',
              border: '1px solid #333',
              color: '#666',
            }}
            title="Copy formula"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <path d="M2 9V2.5C2 2.22 2.22 2 2.5 2H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {/* Duplicate button */}
        {onDuplicate && (
          <button
            onClick={onDuplicate}
            className="w-7 h-7 flex items-center justify-center rounded transition-all hover:bg-white/5"
            style={{
              background: 'transparent',
              border: '1px solid #333',
              color: '#666',
            }}
            title="Duplicate equation"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="4" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
              <rect x="6" y="3" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M4 7H5M4.5 6.5V7.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {/* Remove button */}
        <button
          onClick={onRemove}
          disabled={!canRemove}
          className="w-7 h-7 flex items-center justify-center rounded transition-all"
          style={{
            background: 'transparent',
            border: '1px solid #333',
            color: canRemove ? '#ff4444' : '#333',
            cursor: canRemove ? 'pointer' : 'not-allowed',
          }}
          title="Remove equation"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 2L10 10M10 2L2 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Add equation button
interface AddEquationButtonProps {
  onClick: () => void;
}

export const AddEquationButton = ({ onClick }: AddEquationButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full py-3 rounded font-mono text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2"
      style={{
        background: 'transparent',
        border: '1px dashed #333',
        color: '#555',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 2V14M2 8H14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      Add Equation
    </button>
  );
};
