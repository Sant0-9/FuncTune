import type { ReactNode } from 'react';

interface HudFrameProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export const HudFrame = ({ children, title, className = '' }: HudFrameProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* SVG Border Frame */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="hudGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ff88" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#00ff88" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00ff88" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Main border path */}
        <path
          d={`
            M 20,0
            L calc(100% - 20px),0
            L 100%,20
            L 100%,calc(100% - 20px)
            L calc(100% - 20px),100%
            L 20,100%
            L 0,calc(100% - 20px)
            L 0,20
            Z
          `}
          fill="none"
          stroke="url(#borderGrad)"
          strokeWidth="1"
          filter="url(#hudGlow)"
          vectorEffect="non-scaling-stroke"
        />

        {/* Corner accents - using absolute positioning */}
        {/* Top-left */}
        <path
          d="M 0,30 L 0,10 L 10,0 L 30,0"
          fill="none"
          stroke="#00ff88"
          strokeWidth="2"
          filter="url(#hudGlow)"
        />

        {/* Top-right */}
        <path
          d="M calc(100% - 30px),0 L calc(100% - 10px),0 L 100%,10 L 100%,30"
          fill="none"
          stroke="#00ff88"
          strokeWidth="2"
          filter="url(#hudGlow)"
        />

        {/* Bottom-left */}
        <path
          d="M 0,calc(100% - 30px) L 0,calc(100% - 10px) L 10,100% L 30,100%"
          fill="none"
          stroke="#00ff88"
          strokeWidth="2"
          filter="url(#hudGlow)"
        />

        {/* Bottom-right */}
        <path
          d="M calc(100% - 30px),100% L calc(100% - 10px),100% L 100%,calc(100% - 10px) L 100%,calc(100% - 30px)"
          fill="none"
          stroke="#00ff88"
          strokeWidth="2"
          filter="url(#hudGlow)"
        />
      </svg>

      {/* Background */}
      <div
        className="absolute inset-0 rounded-sm"
        style={{
          background: 'linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)',
          clipPath: 'polygon(20px 0, calc(100% - 20px) 0, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0 calc(100% - 20px), 0 20px)',
        }}
      />

      {/* Title bar */}
      {title && (
        <div
          className="absolute -top-3 left-8 px-4 py-1 text-xs font-mono uppercase tracking-widest"
          style={{
            background: '#1a1a1a',
            color: '#00ff88',
            textShadow: '0 0 10px #00ff88',
          }}
        >
          {title}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 p-6">{children}</div>
    </div>
  );
};

// Simple panel without complex SVG
export const HudPanel = ({
  children,
  title,
  className = '',
}: HudFrameProps) => {
  return (
    <div
      className={`relative ${className}`}
      style={{
        background: 'linear-gradient(180deg, #1a1a1a 0%, #141414 100%)',
        border: '1px solid #2a2a2a',
        borderRadius: '4px',
      }}
    >
      {/* Corner decorations */}
      <div
        className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl"
        style={{ borderColor: '#00ff88' }}
      />
      <div
        className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 rounded-tr"
        style={{ borderColor: '#00ff88' }}
      />
      <div
        className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 rounded-bl"
        style={{ borderColor: '#00ff88' }}
      />
      <div
        className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br"
        style={{ borderColor: '#00ff88' }}
      />

      {/* Title */}
      {title && (
        <div
          className="absolute -top-3 left-6 px-3 text-xs font-mono uppercase tracking-wider"
          style={{
            background: '#1a1a1a',
            color: '#00ff88',
            textShadow: '0 0 8px #00ff8855',
          }}
        >
          {title}
        </div>
      )}

      {/* Content */}
      <div className="p-4">{children}</div>
    </div>
  );
};

// Preset button component
interface PresetButtonProps {
  name: string;
  isActive: boolean;
  onClick: () => void;
}

export const PresetButton = ({ name, isActive, onClick }: PresetButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="relative px-6 py-3 font-mono uppercase tracking-wider text-sm transition-all duration-200"
      style={{
        background: isActive
          ? 'linear-gradient(180deg, #002211 0%, #001a0d 100%)'
          : 'linear-gradient(180deg, #1a1a1a 0%, #141414 100%)',
        border: `1px solid ${isActive ? '#00ff88' : '#2a2a2a'}`,
        color: isActive ? '#00ff88' : '#666',
        textShadow: isActive ? '0 0 10px #00ff88' : 'none',
        boxShadow: isActive ? '0 0 20px #00ff8833, inset 0 0 20px #00ff8811' : 'none',
      }}
    >
      {/* Corner cuts */}
      <span
        className="absolute top-0 left-0 w-2 h-2"
        style={{
          background: 'linear-gradient(135deg, transparent 50%, #1a1a1a 50%)',
        }}
      />
      <span
        className="absolute top-0 right-0 w-2 h-2"
        style={{
          background: 'linear-gradient(-135deg, transparent 50%, #1a1a1a 50%)',
        }}
      />
      <span
        className="absolute bottom-0 left-0 w-2 h-2"
        style={{
          background: 'linear-gradient(45deg, transparent 50%, #1a1a1a 50%)',
        }}
      />
      <span
        className="absolute bottom-0 right-0 w-2 h-2"
        style={{
          background: 'linear-gradient(-45deg, transparent 50%, #1a1a1a 50%)',
        }}
      />
      {name}
    </button>
  );
};

// Initialize overlay button
interface InitButtonProps {
  onClick: () => void;
}

export const InitButton = ({ onClick }: InitButtonProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* Animated background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(#00ff88 1px, transparent 1px),
            linear-gradient(90deg, #00ff88 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <button
        onClick={onClick}
        className="relative group"
        style={{ outline: 'none' }}
      >
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 animate-pulse rounded-full"
          style={{
            background: 'radial-gradient(circle, #00ff8833 0%, transparent 70%)',
            transform: 'scale(2)',
          }}
        />

        {/* Button container */}
        <div
          className="relative px-12 py-6 font-mono uppercase tracking-widest text-lg transition-all duration-300"
          style={{
            background: 'linear-gradient(180deg, #0a1a10 0%, #051a0a 100%)',
            border: '2px solid #00ff88',
            color: '#00ff88',
            textShadow: '0 0 20px #00ff88, 0 0 40px #00ff88',
            boxShadow: '0 0 30px #00ff8844, inset 0 0 30px #00ff8822',
            clipPath: 'polygon(15px 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0 calc(100% - 15px), 0 15px)',
          }}
        >
          <span className="relative z-10">INITIALIZE SYSTEM</span>

          {/* Scan line animation */}
          <div
            className="absolute inset-0 overflow-hidden opacity-30"
            style={{
              clipPath: 'polygon(15px 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0 calc(100% - 15px), 0 15px)',
            }}
          >
            <div
              className="absolute w-full h-8 animate-pulse"
              style={{
                background: 'linear-gradient(180deg, transparent, #00ff8855, transparent)',
                animation: 'scan 2s linear infinite',
              }}
            />
          </div>
        </div>

        {/* Corner brackets */}
        <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: '#00ff88' }} />
        <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: '#00ff88' }} />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: '#00ff88' }} />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: '#00ff88' }} />
      </button>

      {/* Instructions */}
      <div
        className="absolute bottom-12 text-center text-sm font-mono"
        style={{ color: '#00ff8877' }}
      >
        Click to enable audio engine
      </div>
    </div>
  );
};
