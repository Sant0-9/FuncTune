import { useRef, useEffect, useCallback } from 'react';
import type { Variable } from '../store/synthStore';

interface VariableSliderProps {
  variable: Variable;
  onChange: (value: number) => void;
  color?: string;
}

export const VariableSlider = ({
  variable,
  onChange,
  color = '#00ff88',
}: VariableSliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const valueRef = useRef(variable.value);
  valueRef.current = variable.value;

  const handleInteraction = useCallback(
    (clientX: number) => {
      const slider = sliderRef.current;
      if (!slider) return;

      const rect = slider.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      const newValue = variable.min + percent * (variable.max - variable.min);

      // Round to step
      const stepped = Math.round(newValue / variable.step) * variable.step;
      onChange(stepped);
    },
    [variable.min, variable.max, variable.step, onChange]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDragging.current = true;
      handleInteraction(e.clientX);
    },
    [handleInteraction]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        handleInteraction(e.clientX);
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleInteraction]);

  // Wheel handler
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const range = variable.max - variable.min;
      const delta = -e.deltaY * 0.001 * range;
      const newValue = Math.max(
        variable.min,
        Math.min(variable.max, valueRef.current + delta)
      );
      const stepped = Math.round(newValue / variable.step) * variable.step;
      onChange(stepped);
    };

    slider.addEventListener('wheel', handleWheel, { passive: false });
    return () => slider.removeEventListener('wheel', handleWheel);
  }, [variable.min, variable.max, variable.step, onChange]);

  const percent = ((variable.value - variable.min) / (variable.max - variable.min)) * 100;

  // Format value display
  const formatValue = (val: number) => {
    if (variable.step >= 1) return val.toFixed(0);
    if (variable.step >= 0.1) return val.toFixed(1);
    return val.toFixed(2);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Variable name */}
      <span
        className="w-12 text-right font-mono text-sm font-bold"
        style={{ color }}
      >
        {variable.name}
      </span>

      {/* Slider track */}
      <div
        ref={sliderRef}
        className="flex-1 h-6 relative cursor-ew-resize rounded"
        style={{ background: '#111' }}
        onMouseDown={handleMouseDown}
      >
        {/* Background track */}
        <div
          className="absolute inset-0 rounded"
          style={{
            background: `linear-gradient(90deg, ${color}22 0%, transparent 100%)`,
          }}
        />

        {/* Filled portion */}
        <div
          className="absolute top-0 left-0 h-full rounded-l"
          style={{
            width: `${percent}%`,
            background: `linear-gradient(90deg, ${color}44 0%, ${color}22 100%)`,
          }}
        />

        {/* Handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-5 rounded"
          style={{
            left: `calc(${percent}% - 6px)`,
            background: color,
            boxShadow: `0 0 10px ${color}`,
          }}
        />

        {/* Grid lines */}
        <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-px h-full"
              style={{ background: '#2a2a2a' }}
            />
          ))}
        </div>
      </div>

      {/* Value display */}
      <span
        className="w-16 text-right font-mono text-xs tabular-nums"
        style={{ color: '#666' }}
      >
        {formatValue(variable.value)}
      </span>
    </div>
  );
};
