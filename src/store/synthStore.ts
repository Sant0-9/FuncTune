import { create } from 'zustand';
import { createProcessorUrl } from '../audio/processor';

// Equation represents a single math formula
export interface Equation {
  id: string;
  formula: string;
  enabled: boolean;
  volume: number; // 0-1 mix level
  color: string;
}

// Variable that can be used in equations
export interface Variable {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
}

// Default variables available in equations
const defaultVariables: Variable[] = [
  { name: 'a', value: 1.0, min: 0, max: 10, step: 0.01 },
  { name: 'b', value: 1.0, min: 0, max: 10, step: 0.01 },
  { name: 'c', value: 0.5, min: 0, max: 10, step: 0.01 },
  { name: 'd', value: 0.5, min: 0, max: 10, step: 0.01 },
  { name: 'freq', value: 440, min: 20, max: 2000, step: 1 },
];

// Example equations to start with
const defaultEquations: Equation[] = [
  {
    id: '1',
    formula: 'sin(t * freq * 2 * PI)',
    enabled: true,
    volume: 0.5,
    color: '#00ff88',
  },
];

const equationColors = [
  '#00ff88', '#ff6b00', '#00aaff', '#ff00aa',
  '#ffaa00', '#aa00ff', '#00ffaa', '#ff0066'
];

interface SynthState {
  // Audio system
  isInitialized: boolean;
  isPlaying: boolean;
  audioContext: AudioContext | null;
  workletNode: AudioWorkletNode | null;
  analyserNode: AnalyserNode | null;
  gainNode: GainNode | null;

  // Math engine
  equations: Equation[];
  variables: Variable[];
  masterVolume: number;
  mixMode: 'add' | 'multiply' | 'average';

  // Actions
  initializeAudio: () => Promise<boolean>;
  setPlaying: (playing: boolean) => void;
  setMasterVolume: (volume: number) => void;
  cleanup: () => void;

  // Equation actions
  addEquation: () => void;
  removeEquation: (id: string) => void;
  updateEquation: (id: string, updates: Partial<Equation>) => void;
  setEquationFormula: (id: string, formula: string) => void;
  toggleEquation: (id: string) => void;
  duplicateEquation: (id: string) => void;

  // Variable actions
  setVariable: (name: string, value: number) => void;
  setVariableRange: (name: string, min: number, max: number) => void;
  resetVariables: () => void;

  // State management
  loadState: (equations: Equation[], variables: Variable[]) => void;
  getShareableState: () => { equations: Equation[]; variables: Variable[] };

  // Sync to audio
  syncToAudio: () => void;
}

let equationCounter = 2;

export const useSynthStore = create<SynthState>((set, get) => ({
  isInitialized: false,
  isPlaying: false,
  audioContext: null,
  workletNode: null,
  analyserNode: null,
  gainNode: null,
  equations: defaultEquations,
  variables: defaultVariables,
  masterVolume: 0.5,
  mixMode: 'add',

  initializeAudio: async () => {
    const state = get();
    if (state.isInitialized) return true;

    try {
      const audioContext = new AudioContext();
      const processorUrl = createProcessorUrl();

      await audioContext.audioWorklet.addModule(processorUrl);

      const workletNode = new AudioWorkletNode(audioContext, 'math-processor');
      const analyserNode = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();

      analyserNode.fftSize = 4096;
      analyserNode.smoothingTimeConstant = 0.3;

      workletNode.connect(gainNode);
      gainNode.connect(analyserNode);
      analyserNode.connect(audioContext.destination);

      gainNode.gain.setValueAtTime(state.masterVolume, audioContext.currentTime);

      await audioContext.resume();
      URL.revokeObjectURL(processorUrl);

      set({
        audioContext,
        workletNode,
        analyserNode,
        gainNode,
        isInitialized: true,
        isPlaying: true,
      });

      // Sync initial state
      get().syncToAudio();

      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  },

  setPlaying: (playing) => {
    const { audioContext, gainNode } = get();
    if (!audioContext || !gainNode) return;

    if (playing) {
      audioContext.resume();
      gainNode.gain.linearRampToValueAtTime(
        get().masterVolume,
        audioContext.currentTime + 0.05
      );
    } else {
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.05);
    }

    set({ isPlaying: playing });
  },

  setMasterVolume: (volume) => {
    const { gainNode, audioContext, isPlaying } = get();

    if (gainNode && audioContext && isPlaying) {
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.05);
    }

    set({ masterVolume: volume });
  },

  cleanup: () => {
    const { audioContext, workletNode, gainNode, analyserNode } = get();

    if (workletNode) workletNode.disconnect();
    if (gainNode) gainNode.disconnect();
    if (analyserNode) analyserNode.disconnect();
    if (audioContext) audioContext.close();

    set({
      audioContext: null,
      workletNode: null,
      analyserNode: null,
      gainNode: null,
      isInitialized: false,
      isPlaying: false,
    });
  },

  addEquation: () => {
    const id = String(equationCounter++);
    const colorIndex = (equationCounter - 1) % equationColors.length;

    const newEquation: Equation = {
      id,
      formula: 'sin(t * freq * 2 * PI)',
      enabled: true,
      volume: 0.5,
      color: equationColors[colorIndex],
    };

    set((state) => ({
      equations: [...state.equations, newEquation],
    }));

    get().syncToAudio();
  },

  removeEquation: (id) => {
    set((state) => ({
      equations: state.equations.filter((eq) => eq.id !== id),
    }));
    get().syncToAudio();
  },

  updateEquation: (id, updates) => {
    set((state) => ({
      equations: state.equations.map((eq) =>
        eq.id === id ? { ...eq, ...updates } : eq
      ),
    }));
    get().syncToAudio();
  },

  setEquationFormula: (id, formula) => {
    set((state) => ({
      equations: state.equations.map((eq) =>
        eq.id === id ? { ...eq, formula } : eq
      ),
    }));
    get().syncToAudio();
  },

  toggleEquation: (id) => {
    set((state) => ({
      equations: state.equations.map((eq) =>
        eq.id === id ? { ...eq, enabled: !eq.enabled } : eq
      ),
    }));
    get().syncToAudio();
  },

  duplicateEquation: (id) => {
    const state = get();
    const original = state.equations.find((eq) => eq.id === id);
    if (!original) return;

    const newId = String(equationCounter++);
    const colorIndex = (equationCounter - 1) % equationColors.length;

    const newEquation: Equation = {
      id: newId,
      formula: original.formula,
      enabled: original.enabled,
      volume: original.volume,
      color: equationColors[colorIndex],
    };

    set((state) => ({
      equations: [...state.equations, newEquation],
    }));

    get().syncToAudio();
  },

  setVariable: (name, value) => {
    set((state) => ({
      variables: state.variables.map((v) =>
        v.name === name ? { ...v, value } : v
      ),
    }));
    get().syncToAudio();
  },

  setVariableRange: (name, min, max) => {
    set((state) => ({
      variables: state.variables.map((v) =>
        v.name === name ? { ...v, min, max } : v
      ),
    }));
  },

  syncToAudio: () => {
    const { workletNode, equations, variables, mixMode } = get();
    if (!workletNode) return;

    // Send all equations
    workletNode.port.postMessage({
      type: 'setEquations',
      equations: equations.filter((eq) => eq.enabled).map((eq) => ({
        formula: eq.formula,
        volume: eq.volume,
      })),
      mixMode,
    });

    // Send all variables
    const varsObj: Record<string, number> = {};
    for (const v of variables) {
      varsObj[v.name] = v.value;
    }
    workletNode.port.postMessage({
      type: 'setVariables',
      variables: varsObj,
    });
  },
}));
