import { useRef, useEffect, useCallback, useState } from 'react';

interface KnobProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: number;
  color?: string;
}

export const Knob = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  size = 80,
  color = '#00ff88',
}: KnobProps) => {
  const knobRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragDataRef = useRef({ startY: 0, startValue: 0 });

  // Calculate normalized value (0-1)
  const normalizedValue = Math.max(0, Math.min(1, (value - min) / (max - min)));

  // SVG arc calculation
  const radius = (size / 2) - 8;
  const strokeWidth = 4;
  const center = size / 2;

  // Arc spans 270 degrees (-135 to 135)
  const startAngle = -225;
  const endAngle = 45;
  const angleRange = endAngle - startAngle;
  const currentAngle = startAngle + normalizedValue * angleRange;

  // Convert angle to radians for SVG path
  const degToRad = (deg: number) => (deg * Math.PI) / 180;

  // Calculate arc path
  const describeArc = (
    cx: number,
    cy: number,
    r: number,
    startAng: number,
    endAng: number
  ) => {
    const start = {
      x: cx + r * Math.cos(degToRad(startAng)),
      y: cy + r * Math.sin(degToRad(startAng)),
    };
    const end = {
      x: cx + r * Math.cos(degToRad(endAng)),
      y: cy + r * Math.sin(degToRad(endAng)),
    };
    const largeArcFlag = endAng - startAng <= 180 ? 0 : 1;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  // Indicator line position
  const indicatorLength = radius - 12;
  const indicatorEnd = {
    x: center + indicatorLength * Math.cos(degToRad(currentAngle)),
    y: center + indicatorLength * Math.sin(degToRad(currentAngle)),
  };

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      dragDataRef.current = {
        startY: e.clientY,
        startValue: value,
      };
    },
    [value]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaY = dragDataRef.current.startY - e.clientY;
      const sensitivity = 200;
      const range = max - min;
      const deltaValue = (deltaY / sensitivity) * range;
      const newValue = Math.max(
        min,
        Math.min(max, dragDataRef.current.startValue + deltaValue)
      );

      onChange(newValue);
    },
    [isDragging, min, max, onChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Store current values in ref for wheel handler
  const valueRef = useRef(value);
  valueRef.current = value;

  // Scroll wheel event listener (must use native listener for passive: false)
  useEffect(() => {
    const svg = knobRef.current;
    if (!svg) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const range = max - min;
      const sensitivity = 0.005;
      const delta = -e.deltaY * sensitivity * range;
      const newValue = Math.max(min, Math.min(max, valueRef.current + delta));
      onChange(newValue);
    };

    svg.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      svg.removeEventListener('wheel', handleWheel);
    };
  }, [min, max, onChange]);

  // Global mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Calculate the background arc (full range)
  const bgArcPath = describeArc(center, center, radius, startAngle, endAngle);

  // Calculate the value arc (current value)
  const valueArcPath =
    normalizedValue > 0.01
      ? describeArc(center, center, radius, startAngle, currentAngle)
      : '';

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <svg
        ref={knobRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        onMouseDown={handleMouseDown}
        className="cursor-ns-resize"
        style={{ touchAction: 'none' }}
      >
        {/* Outer glow */}
        <defs>
          <filter id={`glow-${label}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id={`knobGrad-${label}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2a2a2a" />
            <stop offset="50%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>
        </defs>

        {/* Knob body */}
        <circle
          cx={center}
          cy={center}
          r={radius - strokeWidth}
          fill={`url(#knobGrad-${label})`}
          stroke="#333"
          strokeWidth="1"
        />

        {/* Background arc track */}
        <path
          d={bgArcPath}
          fill="none"
          stroke="#2a2a2a"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Value arc */}
        {valueArcPath && (
          <path
            d={valueArcPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter={`url(#glow-${label})`}
            style={{
              transition: isDragging ? 'none' : 'stroke-dashoffset 0.1s ease-out',
            }}
          />
        )}

        {/* Center dot */}
        <circle cx={center} cy={center} r={4} fill="#333" />

        {/* Indicator line */}
        <line
          x1={center}
          y1={center}
          x2={indicatorEnd.x}
          y2={indicatorEnd.y}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          filter={`url(#glow-${label})`}
        />

        {/* Tick marks */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const tickAngle = startAngle + tick * angleRange;
          const outerR = radius + 4;
          const innerR = radius + 1;
          const outer = {
            x: center + outerR * Math.cos(degToRad(tickAngle)),
            y: center + outerR * Math.sin(degToRad(tickAngle)),
          };
          const inner = {
            x: center + innerR * Math.cos(degToRad(tickAngle)),
            y: center + innerR * Math.sin(degToRad(tickAngle)),
          };
          return (
            <line
              key={tick}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="#555"
              strokeWidth={1}
            />
          );
        })}
      </svg>

      {/* Label */}
      <span
        className="text-xs font-medium tracking-wider uppercase"
        style={{ color: '#808080' }}
      >
        {label}
      </span>

      {/* Value display */}
      <span
        className="text-xs font-mono tabular-nums"
        style={{ color: color, textShadow: `0 0 8px ${color}` }}
      >
        {value.toFixed(2)}
      </span>
    </div>
  );
};
