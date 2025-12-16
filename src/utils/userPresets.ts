import type { ShareableStateV1 } from './urlCodec';

export interface UserPreset {
  id: string;
  name: string;
  createdAt: number;
  state: ShareableStateV1;
}

const STORAGE_KEY = 'functune:userPresets:v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

export function loadUserPresets(): UserPreset[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((p) => isRecord(p))
      .map((p) => ({
        id: typeof p.id === 'string' ? p.id : '',
        name: typeof p.name === 'string' ? p.name : '',
        createdAt: typeof p.createdAt === 'number' ? p.createdAt : Date.now(),
        state:
          isRecord(p.state) &&
          p.state.v === 1 &&
          Array.isArray(p.state.equations) &&
          Array.isArray(p.state.variables)
            ? (p.state as unknown as ShareableStateV1)
            : null,
      }))
      .filter((p): p is UserPreset => !!p.id && !!p.name && !!p.state);
  } catch {
    return [];
  }
}

export function saveUserPresets(presets: UserPreset[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // ignore
  }
}

export function createUserPresetId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
