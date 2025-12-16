export interface Preset {
  id: string;
  name: string;
  description: string;
  baseFreq: number;
  params: {
    speed: { default: number; min: number; max: number; label: string };
    timbre: { default: number; min: number; max: number; label: string };
    modulation: { default: number; min: number; max: number; label: string };
    chaos: { default: number; min: number; max: number; label: string };
  };
}

export const presets: Preset[] = [
  {
    id: 'bass',
    name: 'BASS',
    description: 'Deep sub frequencies with harmonic overtones',
    baseFreq: 55,
    params: {
      speed: { default: 0.5, min: 0.1, max: 2.0, label: 'RATE' },
      timbre: { default: 0.3, min: 0.0, max: 1.0, label: 'TONE' },
      modulation: { default: 0.2, min: 0.0, max: 1.0, label: 'DEPTH' },
      chaos: { default: 0.1, min: 0.0, max: 1.0, label: 'GRIT' },
    },
  },
  {
    id: 'pad',
    name: 'PAD',
    description: 'Lush atmospheric textures',
    baseFreq: 220,
    params: {
      speed: { default: 0.3, min: 0.05, max: 1.0, label: 'DRIFT' },
      timbre: { default: 0.6, min: 0.0, max: 1.0, label: 'SHIMMER' },
      modulation: { default: 0.4, min: 0.0, max: 1.0, label: 'SWELL' },
      chaos: { default: 0.2, min: 0.0, max: 1.0, label: 'TEXTURE' },
    },
  },
  {
    id: 'lead',
    name: 'LEAD',
    description: 'Sharp cutting tones for melodies',
    baseFreq: 440,
    params: {
      speed: { default: 1.0, min: 0.5, max: 4.0, label: 'VIBRATO' },
      timbre: { default: 0.7, min: 0.0, max: 1.0, label: 'BITE' },
      modulation: { default: 0.5, min: 0.0, max: 1.0, label: 'PULSE' },
      chaos: { default: 0.3, min: 0.0, max: 1.0, label: 'EDGE' },
    },
  },
  {
    id: 'glitch',
    name: 'GLITCH',
    description: 'Chaotic digital artifacts and noise',
    baseFreq: 110,
    params: {
      speed: { default: 2.0, min: 0.5, max: 8.0, label: 'RATE' },
      timbre: { default: 0.5, min: 0.0, max: 1.0, label: 'BITS' },
      modulation: { default: 0.7, min: 0.0, max: 1.0, label: 'FOLD' },
      chaos: { default: 0.8, min: 0.0, max: 1.0, label: 'CHAOS' },
    },
  },
];

export const getPresetById = (id: string): Preset | undefined => {
  return presets.find((p) => p.id === id);
};
