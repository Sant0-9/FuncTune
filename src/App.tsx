import { useEffect } from 'react';
import { useSynthStore } from './store/synthStore';
import { Knob } from './components/Knob';
import { Visualizer } from './components/Visualizer';
import { HudPanel, InitButton } from './components/HudFrame';
import { EquationRow, AddEquationButton } from './components/EquationRow';
import { VariableSlider } from './components/VariableSlider';
import './index.css';

function App() {
  const {
    isInitialized,
    isPlaying,
    equations,
    variables,
    masterVolume,
    initializeAudio,
    setPlaying,
    setMasterVolume,
    addEquation,
    removeEquation,
    setEquationFormula,
    updateEquation,
    toggleEquation,
    setVariable,
    cleanup,
  } = useSynthStore();

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const handleInitialize = async () => {
    await initializeAudio();
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden" style={{ background: '#0a0a0a' }}>
      {!isInitialized && <InitButton onClick={handleInitialize} />}

      {/* Header */}
      <header className="flex-shrink-0 py-4 px-6 flex items-center justify-between border-b" style={{ borderColor: '#1a1a1a' }}>
        <div className="flex items-center gap-4">
          <h1
            className="text-xl font-bold tracking-wider uppercase font-mono"
            style={{
              color: '#00ff88',
              textShadow: '0 0 20px #00ff8866',
            }}
          >
            FUNCTUNE
          </h1>
          <span className="text-xs font-mono uppercase tracking-wider" style={{ color: '#444' }}>
            Math Audio Engine
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Play/Stop */}
          <button
            onClick={() => setPlaying(!isPlaying)}
            disabled={!isInitialized}
            className="px-4 py-2 font-mono text-sm uppercase tracking-wider rounded transition-all"
            style={{
              background: isPlaying ? '#001a0d' : '#1a1a1a',
              border: `1px solid ${isPlaying ? '#00ff88' : '#333'}`,
              color: isPlaying ? '#00ff88' : '#666',
              opacity: isInitialized ? 1 : 0.5,
              cursor: isInitialized ? 'pointer' : 'not-allowed',
            }}
          >
            {isPlaying ? 'STOP' : 'PLAY'}
          </button>

          {/* Status */}
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: isPlaying ? '#00ff88' : '#333',
                boxShadow: isPlaying ? '0 0 10px #00ff88' : 'none',
              }}
            />
            <span className="text-xs font-mono" style={{ color: '#555' }}>
              {isPlaying ? 'ACTIVE' : 'IDLE'}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="h-full flex">
          {/* Left Panel - Equations */}
          <div className="w-2/3 border-r flex flex-col" style={{ borderColor: '#1a1a1a' }}>
            {/* Equations List */}
            <div className="flex-1 overflow-auto p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-mono uppercase tracking-wider" style={{ color: '#555' }}>
                  Equations
                </h2>
                <span className="text-xs font-mono" style={{ color: '#333' }}>
                  f(t) = output
                </span>
              </div>

              <div className="space-y-3">
                {equations.map((eq) => (
                  <EquationRow
                    key={eq.id}
                    equation={eq}
                    onFormulaChange={(formula) => setEquationFormula(eq.id, formula)}
                    onVolumeChange={(volume) => updateEquation(eq.id, { volume })}
                    onToggle={() => toggleEquation(eq.id)}
                    onRemove={() => removeEquation(eq.id)}
                    canRemove={equations.length > 1}
                  />
                ))}

                <AddEquationButton onClick={addEquation} />
              </div>

              {/* Help text */}
              <div className="mt-6 p-4 rounded" style={{ background: '#111' }}>
                <h3 className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: '#555' }}>
                  Available Functions
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono" style={{ color: '#444' }}>
                  <span>sin, cos, tan</span>
                  <span>saw, square, triangle</span>
                  <span>abs, floor, ceil, round</span>
                  <span>noise, pulse(x, width)</span>
                  <span>sqrt, pow, exp, log</span>
                  <span>mod, clamp, lerp</span>
                  <span>tanh, sinh, cosh</span>
                  <span>step, smoothstep</span>
                </div>
                <div className="mt-3 text-xs font-mono" style={{ color: '#444' }}>
                  Variables: <span style={{ color: '#00ff88' }}>t</span> (time),{' '}
                  <span style={{ color: '#00ff88' }}>freq</span>,{' '}
                  <span style={{ color: '#00ff88' }}>a, b, c, d</span>,{' '}
                  <span style={{ color: '#00ff88' }}>PI</span>
                </div>
              </div>

              {/* Example formulas */}
              <div className="mt-4 p-4 rounded" style={{ background: '#111' }}>
                <h3 className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: '#555' }}>
                  Example Formulas
                </h3>
                <div className="space-y-1 text-xs font-mono" style={{ color: '#444' }}>
                  <div><span style={{ color: '#00ff88' }}>sin(t * freq * 2 * PI)</span> - Pure sine</div>
                  <div><span style={{ color: '#ff6b00' }}>saw(t * freq * 2 * PI) * 0.5</span> - Sawtooth</div>
                  <div><span style={{ color: '#00aaff' }}>sin(t * freq * 2 * PI) * sin(t * a)</span> - AM</div>
                  <div><span style={{ color: '#ff00aa' }}>sin(t * freq * 2 * PI + sin(t * b * 10) * c)</span> - FM</div>
                  <div><span style={{ color: '#ffaa00' }}>tanh(sin(t * freq * 2 * PI) * a * 5)</span> - Distortion</div>
                </div>
              </div>
            </div>

            {/* Visualizer */}
            <div className="flex-shrink-0 border-t" style={{ borderColor: '#1a1a1a' }}>
              <Visualizer height={150} />
            </div>
          </div>

          {/* Right Panel - Variables & Controls */}
          <div className="w-1/3 flex flex-col">
            {/* Variables */}
            <div className="flex-1 overflow-auto p-4">
              <h2 className="text-sm font-mono uppercase tracking-wider mb-4" style={{ color: '#555' }}>
                Variables
              </h2>

              <div className="space-y-4">
                {variables.map((v) => (
                  <VariableSlider
                    key={v.name}
                    variable={v}
                    onChange={(value) => setVariable(v.name, value)}
                    color={v.name === 'freq' ? '#00aaff' : '#00ff88'}
                  />
                ))}
              </div>

              {/* Variable ranges */}
              <div className="mt-6 p-3 rounded" style={{ background: '#111' }}>
                <div className="text-xs font-mono" style={{ color: '#444' }}>
                  Scroll or drag sliders to adjust values.
                  <br />
                  Variables are injected into all equations.
                </div>
              </div>
            </div>

            {/* Master Output */}
            <HudPanel title="MASTER" className="m-4">
              <div className="flex items-center justify-center gap-6">
                <Knob
                  label="VOLUME"
                  value={masterVolume}
                  onChange={setMasterVolume}
                  min={0}
                  max={1}
                  size={80}
                  color="#00aaff"
                />

                {/* Level meter */}
                <div className="flex flex-col gap-1">
                  {[...Array(8)].map((_, i) => {
                    const threshold = (7 - i) / 8;
                    const isActive = masterVolume >= threshold;
                    const isHigh = i < 2;
                    return (
                      <div
                        key={i}
                        className="w-12 h-2 rounded-sm transition-all duration-100"
                        style={{
                          background: isActive
                            ? isHigh ? '#ff4444' : '#00ff88'
                            : '#1a1a1a',
                          boxShadow: isActive
                            ? `0 0 8px ${isHigh ? '#ff4444' : '#00ff88'}`
                            : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </HudPanel>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="flex-shrink-0 py-2 px-6 flex justify-between items-center border-t text-xs font-mono"
        style={{ borderColor: '#1a1a1a', color: '#333' }}
      >
        <span>FUNCTUNE // MATH AUDIO ENGINE</span>
        <span>WEB AUDIO API + WORKLET</span>
      </footer>
    </div>
  );
}

export default App;
