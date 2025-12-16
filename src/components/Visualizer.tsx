import { useRef, useEffect } from 'react';
import { useSynthStore } from '../store/synthStore';

interface VisualizerProps {
  height?: number;
}

export const Visualizer = ({ height = 200 }: VisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const waveformRef = useRef(new Float32Array(2048));

  // Only subscribe to what we need for rendering decisions, not the data itself
  const analyserNode = useSynthStore((state) => state.analyserNode);
  const isPlaying = useSynthStore((state) => state.isPlaying);
  const isInitialized = useSynthStore((state) => state.isInitialized);

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      // Update canvas size to match container
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      if (canvas.width !== rect.width * dpr || canvas.height !== height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${height}px`;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const width = rect.width;

      // Clear canvas with dark background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);

      // Draw grid lines
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;

      // Vertical grid lines
      const gridSpacing = 50;
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center line
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Get waveform data directly from analyser (no state update)
      if (analyserNode && isPlaying && isInitialized) {
        analyserNode.getFloatTimeDomainData(waveformRef.current);
      }

      const waveformData = waveformRef.current;

      // Calculate how many samples to display
      const displaySamples = Math.min(waveformData.length, 1024);
      const sliceWidth = width / displaySamples;

      // Create gradient for fill
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(0, 255, 136, 0.4)');
      gradient.addColorStop(0.5, 'rgba(0, 255, 136, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');

      // Draw filled waveform (upper half)
      ctx.beginPath();
      ctx.moveTo(0, height / 2);

      for (let i = 0; i < displaySamples; i++) {
        const sample = waveformData[i] || 0;
        const amplitude = isPlaying ? sample : 0;
        const y = height / 2 - amplitude * (height / 2) * 0.9;
        const x = i * sliceWidth;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      // Complete the path for fill
      ctx.lineTo(width, height / 2);
      ctx.lineTo(0, height / 2);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw filled waveform (lower half - mirrored)
      const gradientLower = ctx.createLinearGradient(0, height, 0, height / 2);
      gradientLower.addColorStop(0, 'rgba(0, 255, 136, 0.4)');
      gradientLower.addColorStop(0.5, 'rgba(0, 255, 136, 0.1)');
      gradientLower.addColorStop(1, 'rgba(0, 255, 136, 0)');

      ctx.beginPath();
      ctx.moveTo(0, height / 2);

      for (let i = 0; i < displaySamples; i++) {
        const sample = waveformData[i] || 0;
        const amplitude = isPlaying ? sample : 0;
        const y = height / 2 + amplitude * (height / 2) * 0.9;
        const x = i * sliceWidth;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.lineTo(width, height / 2);
      ctx.lineTo(0, height / 2);
      ctx.closePath();
      ctx.fillStyle = gradientLower;
      ctx.fill();

      // Draw main waveform line with glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ff88';
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();

      for (let i = 0; i < displaySamples; i++) {
        const sample = waveformData[i] || 0;
        const amplitude = isPlaying ? sample : 0;
        const y = height / 2 - amplitude * (height / 2) * 0.9;
        const x = i * sliceWidth;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Reset shadow
      ctx.shadowBlur = 0;

      // Draw corner brackets (HUD effect)
      const bracketSize = 20;
      const bracketWidth = 2;
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = bracketWidth;

      // Top-left bracket
      ctx.beginPath();
      ctx.moveTo(bracketWidth, bracketSize);
      ctx.lineTo(bracketWidth, bracketWidth);
      ctx.lineTo(bracketSize, bracketWidth);
      ctx.stroke();

      // Top-right bracket
      ctx.beginPath();
      ctx.moveTo(width - bracketSize, bracketWidth);
      ctx.lineTo(width - bracketWidth, bracketWidth);
      ctx.lineTo(width - bracketWidth, bracketSize);
      ctx.stroke();

      // Bottom-left bracket
      ctx.beginPath();
      ctx.moveTo(bracketWidth, height - bracketSize);
      ctx.lineTo(bracketWidth, height - bracketWidth);
      ctx.lineTo(bracketSize, height - bracketWidth);
      ctx.stroke();

      // Bottom-right bracket
      ctx.beginPath();
      ctx.moveTo(width - bracketSize, height - bracketWidth);
      ctx.lineTo(width - bracketWidth, height - bracketWidth);
      ctx.lineTo(width - bracketWidth, height - bracketSize);
      ctx.stroke();

      // Add scanline effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      for (let y = 0; y < height; y += 2) {
        ctx.fillRect(0, y, width, 1);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyserNode, isPlaying, isInitialized, height]);

  return (
    <div ref={containerRef} className="w-full relative">
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height }}
      />
      {/* Overlay label */}
      <div
        className="absolute top-2 left-4 text-xs font-mono uppercase tracking-widest"
        style={{ color: '#00ff8855' }}
      >
        WAVEFORM
      </div>
      <div
        className="absolute top-2 right-4 text-xs font-mono uppercase tracking-widest"
        style={{ color: isPlaying ? '#00ff88' : '#555' }}
      >
        {isPlaying ? 'ACTIVE' : 'IDLE'}
      </div>
    </div>
  );
};
