import type { Equation, Variable } from '../store/synthStore';

export interface PresetDefinition {
  id: string;
  name: string;
  description: string;
  state: {
    equations: Array<Partial<Equation>>;
    variables: Array<Partial<Variable>>;
    masterVolume?: number;
  };
}

export const factoryPresets: PresetDefinition[] = [
  {
    id: 'bass',
    name: 'BASS',
    description: 'Saturated low end with harmonics.',
    state: {
      equations: [
        { formula: 'tanh(sin(t * freq * 2 * PI) * a * 3) * 0.8', enabled: true, volume: 0.8 },
        { formula: 'sin(t * freq * 2 * PI * 0.5) * 0.25', enabled: true, volume: 0.5 },
      ],
      variables: [
        { name: 'freq', value: 55 },
        { name: 'a', value: 2.6 },
        { name: 'b', value: 1.0 },
        { name: 'c', value: 0.5 },
        { name: 'd', value: 0.5 },
      ],
      masterVolume: 0.45,
    },
  },
  {
    id: 'pad',
    name: 'PAD',
    description: 'Slow, wide detuned layers.',
    state: {
      equations: [
        { formula: 'sin(t * freq * 2 * PI + sin(t * b) * c) * 0.45', enabled: true, volume: 0.7 },
        { formula: 'sin(t * freq * 2 * PI * 1.01 + sin(t * b * 1.2) * c) * 0.35', enabled: true, volume: 0.6 },
        { formula: 'sin(t * freq * 2 * PI * 0.5) * 0.25', enabled: true, volume: 0.5 },
      ],
      variables: [
        { name: 'freq', value: 220 },
        { name: 'a', value: 1.0 },
        { name: 'b', value: 0.9 },
        { name: 'c', value: 1.2 },
        { name: 'd', value: 0.5 },
      ],
      masterVolume: 0.5,
    },
  },
  {
    id: 'lead',
    name: 'LEAD',
    description: 'Bright pulse + bite.',
    state: {
      equations: [
        { formula: 'saw(t * freq * 2 * PI) * 0.6', enabled: true, volume: 0.6 },
        { formula: 'pulse(t * freq * 2 * PI, clamp(a / 10, 0.05, 0.95)) * 0.45', enabled: true, volume: 0.5 },
        { formula: 'tanh(sin(t * freq * 2 * PI + sin(t * b * 15) * c) * (2 + d)) * 0.35', enabled: true, volume: 0.5 },
      ],
      variables: [
        { name: 'freq', value: 440 },
        { name: 'a', value: 5.5 },
        { name: 'b', value: 2.5 },
        { name: 'c', value: 1.0 },
        { name: 'd', value: 1.5 },
      ],
      masterVolume: 0.5,
    },
  },
  {
    id: 'kick',
    name: 'KICK',
    description: 'Looping percussive thump (uses mod()).',
    state: {
      equations: [
        { formula: 'sin(mod(t, 0.5) * freq * 2 * PI) * exp(-mod(t, 0.5) * a) * 0.9', enabled: true, volume: 0.9 },
        { formula: 'tanh(sin(mod(t, 0.5) * freq * 2 * PI * 0.5) * 6) * exp(-mod(t, 0.5) * b) * 0.3', enabled: true, volume: 0.5 },
      ],
      variables: [
        { name: 'freq', value: 60 },
        { name: 'a', value: 10.0 },
        { name: 'b', value: 6.0 },
        { name: 'c', value: 0.5 },
        { name: 'd', value: 0.5 },
      ],
      masterVolume: 0.55,
    },
  },
  {
    id: 'noise-fx',
    name: 'NOISE FX',
    description: 'Gated noise bursts + tone.',
    state: {
      equations: [
        { formula: 'noise() * exp(-mod(t, 0.25) * a) * 0.6', enabled: true, volume: 0.7 },
        { formula: 'sin(t * freq * 2 * PI) * sin(t * b * 12) * 0.3', enabled: true, volume: 0.5 },
      ],
      variables: [
        { name: 'freq', value: 330 },
        { name: 'a', value: 12.0 },
        { name: 'b', value: 3.5 },
        { name: 'c', value: 0.5 },
        { name: 'd', value: 0.5 },
      ],
      masterVolume: 0.5,
    },
  },
];

export const getFactoryPreset = (id: string): PresetDefinition | undefined =>
  factoryPresets.find((p) => p.id === id);

