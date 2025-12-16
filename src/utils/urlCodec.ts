export type MixMode = 'add' | 'multiply' | 'average';

export interface ShareableStateV1 {
  v: 1;
  equations: Array<{
    id?: string;
    formula: string;
    enabled: boolean;
    volume: number;
    color?: string;
  }>;
  variables: Array<{
    name: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
  }>;
  masterVolume?: number;
  mixMode?: MixMode;
}

function base64UrlEncodeUtf8(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecodeUtf8(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '==='.slice((base64.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function encodeShareState(state: ShareableStateV1): string {
  return base64UrlEncodeUtf8(JSON.stringify(state));
}

export function decodeShareState(encoded: string): ShareableStateV1 | null {
  try {
    const decoded = base64UrlDecodeUtf8(encoded);
    const parsed = JSON.parse(decoded) as Partial<ShareableStateV1> | null;

    if (!parsed || parsed.v !== 1) return null;
    if (!Array.isArray(parsed.equations) || !Array.isArray(parsed.variables)) return null;

    const equations: ShareableStateV1['equations'] = parsed.equations
      .filter((eq) => eq && typeof eq.formula === 'string')
      .map((eq) => ({
        id: typeof eq.id === 'string' ? eq.id : undefined,
        formula: eq.formula,
        enabled: typeof eq.enabled === 'boolean' ? eq.enabled : true,
        volume: isFiniteNumber(eq.volume) ? Math.max(0, Math.min(1, eq.volume)) : 0.5,
        color: typeof eq.color === 'string' ? eq.color : undefined,
      }));

    const variables: ShareableStateV1['variables'] = parsed.variables
      .filter((v) => v && typeof v.name === 'string')
      .map((v) => ({
        name: v.name,
        value: isFiniteNumber(v.value) ? v.value : 0,
        min: isFiniteNumber(v.min) ? v.min : undefined,
        max: isFiniteNumber(v.max) ? v.max : undefined,
        step: isFiniteNumber(v.step) ? v.step : undefined,
      }));

    return {
      v: 1,
      equations: equations.length > 0 ? equations : [{ formula: 'sin(t * freq * 2 * PI)', enabled: true, volume: 0.5 }],
      variables,
      masterVolume: isFiniteNumber(parsed.masterVolume) ? Math.max(0, Math.min(1, parsed.masterVolume)) : undefined,
      mixMode: parsed.mixMode === 'add' || parsed.mixMode === 'multiply' || parsed.mixMode === 'average' ? parsed.mixMode : undefined,
    };
  } catch {
    return null;
  }
}

