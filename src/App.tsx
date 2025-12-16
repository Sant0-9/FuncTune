import { useEffect, useState } from 'react';
import { useSynthStore, type Equation, type Variable } from './store/synthStore';
import { Knob } from './components/Knob';
import { Visualizer } from './components/Visualizer';
import { HudPanel, InitButton } from './components/HudFrame';
import { EquationRow, AddEquationButton } from './components/EquationRow';
import { VariableSlider } from './components/VariableSlider';
import { decodeShareState, encodeShareState } from './utils/urlCodec';
import type { ShareableStateV1 } from './utils/urlCodec';
import { factoryPresets } from './presets/factory';
import { createUserPresetId, loadUserPresets, saveUserPresets, type UserPreset } from './utils/userPresets';
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
    duplicateEquation,
    setVariable,
    resetVariables,
    cleanup,
  } = useSynthStore();

  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [userPresets, setUserPresets] = useState<UserPreset[]>([]);
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('');

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  useEffect(() => {
    setUserPresets(loadUserPresets());
  }, []);

  // Load state from URL (share link)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('s');
    if (!encoded) return;

    const decoded = decodeShareState(encoded);
    if (!decoded) return;

    const { loadState, setMasterVolume } = useSynthStore.getState();
    loadState(decoded.equations, decoded.variables);
    if (typeof decoded.masterVolume === 'number') setMasterVolume(decoded.masterVolume);
  }, []);

  // Keyboard shortcuts (when not typing): Space=play/stop, +/- master volume
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          (target as HTMLElement).isContentEditable);
      if (isTyping) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (isInitialized) setPlaying(!isPlaying);
      }

      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setMasterVolume(Math.min(1, masterVolume + 0.05));
      }

      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setMasterVolume(Math.max(0, masterVolume - 0.05));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInitialized, isPlaying, masterVolume, setMasterVolume, setPlaying]);

  const handleInitialize = async () => {
    await initializeAudio();
  };

  const applyEngineState = (
    nextEquations: Array<Partial<Equation>>,
    nextVariables: Array<Partial<Variable>>,
    nextMasterVolume?: number
  ) => {
    const { loadState, setMasterVolume } = useSynthStore.getState();
    loadState(nextEquations, nextVariables);
    if (typeof nextMasterVolume === 'number') setMasterVolume(nextMasterVolume);
  };

  const handlePresetChange = (key: string) => {
    setSelectedPresetKey(key);
    if (!key) return;

    if (key.startsWith('factory:')) {
      const id = key.slice('factory:'.length);
      const preset = factoryPresets.find((p) => p.id === id);
      if (!preset) return;
      applyEngineState(preset.state.equations, preset.state.variables, preset.state.masterVolume);
      return;
    }

    if (key.startsWith('user:')) {
      const id = key.slice('user:'.length);
      const preset = userPresets.find((p) => p.id === id);
      if (!preset) return;
      applyEngineState(preset.state.equations, preset.state.variables, preset.state.masterVolume);
    }
  };

  const handleSavePreset = () => {
    const name = window.prompt('Preset name?');
    const trimmed = name?.trim();
    if (!trimmed) return;

    const shareable = useSynthStore.getState().getShareableState();
    const state: ShareableStateV1 = {
      v: 1,
      equations: shareable.equations,
      variables: shareable.variables,
      masterVolume: useSynthStore.getState().masterVolume,
      mixMode: useSynthStore.getState().mixMode,
    };

    const preset: UserPreset = {
      id: createUserPresetId(),
      name: trimmed.toUpperCase(),
      createdAt: Date.now(),
      state,
    };

    const next = [preset, ...userPresets];
    setUserPresets(next);
    saveUserPresets(next);
    setSelectedPresetKey(`user:${preset.id}`);
  };

  const handleDeleteSelectedPreset = () => {
    if (!selectedPresetKey.startsWith('user:')) return;
    const id = selectedPresetKey.slice('user:'.length);
    const preset = userPresets.find((p) => p.id === id);
    if (!preset) return;

    const ok = window.confirm(`Delete preset "${preset.name}"?`);
    if (!ok) return;

    const next = userPresets.filter((p) => p.id !== id);
    setUserPresets(next);
    saveUserPresets(next);
    setSelectedPresetKey('');
  };

  const handleCopyFormula = async (formula: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(formula);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = formula;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    } catch {
      // ignore
    }
  };

  const handleShare = async () => {
    try {
      const shareable = useSynthStore.getState().getShareableState();
      const url = new URL(window.location.href);
      url.searchParams.set(
        's',
        encodeShareState({
          v: 1,
          equations: shareable.equations,
          variables: shareable.variables,
          masterVolume: useSynthStore.getState().masterVolume,
          mixMode: useSynthStore.getState().mixMode,
        })
      );

      const shareUrl = url.toString();
      window.history.replaceState({}, '', shareUrl);

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setShareStatus('copied');
      window.setTimeout(() => setShareStatus('idle'), 1200);
    } catch {
      setShareStatus('error');
      window.setTimeout(() => setShareStatus('idle'), 1200);
    }
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
          {/* Share */}
          <button
            onClick={handleShare}
            className="px-4 py-2 font-mono text-sm uppercase tracking-wider rounded transition-all"
            style={{
              background: shareStatus === 'copied' ? '#001a0d' : '#1a1a1a',
              border: `1px solid ${shareStatus === 'copied' ? '#00ff88' : '#333'}`,
              color:
                shareStatus === 'copied'
                  ? '#00ff88'
                  : shareStatus === 'error'
                    ? '#ff4444'
                    : '#666',
            }}
            title="Copy share URL"
          >
            {shareStatus === 'copied' ? 'COPIED' : shareStatus === 'error' ? 'ERROR' : 'SHARE'}
          </button>

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
                    onDuplicate={() => duplicateEquation(eq.id)}
                    onCopy={() => handleCopyFormula(eq.formula)}
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
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-mono uppercase tracking-wider" style={{ color: '#555' }}>
                  Variables
                </h2>
                <button
                  onClick={resetVariables}
                  className="px-3 py-1 font-mono text-xs uppercase tracking-wider rounded transition-all"
                  style={{
                    background: 'transparent',
                    border: '1px solid #333',
                    color: '#666',
                  }}
                  title="Reset variables to defaults"
                >
                  RESET
                </button>
              </div>

              {/* Presets */}
              <div className="mb-4 p-3 rounded" style={{ background: '#111', border: '1px solid #2a2a2a' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider" style={{ color: '#555' }}>
                    Presets
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSavePreset}
                      className="px-3 py-1 font-mono text-xs uppercase tracking-wider rounded transition-all"
                      style={{
                        background: 'transparent',
                        border: '1px solid #333',
                        color: '#00ff88',
                      }}
                      title="Save current state as preset"
                    >
                      SAVE
                    </button>
                    <button
                      onClick={handleDeleteSelectedPreset}
                      disabled={!selectedPresetKey.startsWith('user:')}
                      className="px-3 py-1 font-mono text-xs uppercase tracking-wider rounded transition-all"
                      style={{
                        background: 'transparent',
                        border: '1px solid #333',
                        color: selectedPresetKey.startsWith('user:') ? '#ff4444' : '#333',
                        cursor: selectedPresetKey.startsWith('user:') ? 'pointer' : 'not-allowed',
                      }}
                      title="Delete selected preset"
                    >
                      DEL
                    </button>
                  </div>
                </div>

                <select
                  value={selectedPresetKey}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="w-full px-3 py-2 rounded font-mono text-xs outline-none"
                  style={{
                    background: '#0a0a0a',
                    border: '1px solid #333',
                    color: '#e0e0e0',
                  }}
                >
                  <option value="">-- Select --</option>
                  <optgroup label="Factory">
                    {factoryPresets.map((p) => (
                      <option key={p.id} value={`factory:${p.id}`}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Saved">
                    {userPresets.map((p) => (
                      <option key={p.id} value={`user:${p.id}`}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                </select>

                <div className="mt-2 text-[10px] font-mono" style={{ color: '#555' }}>
                  Space: Play/Stop · +/-: Volume
                </div>
              </div>

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
