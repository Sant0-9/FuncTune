// Formula validation utility for real-time error feedback

// Available math functions (must match processor.ts)
const availableFunctions = [
  'sin', 'cos', 'tan', 'abs', 'floor', 'ceil', 'round', 'sqrt', 'pow',
  'exp', 'log', 'log10', 'min', 'max', 'sign', 'tanh', 'sinh', 'cosh',
  'atan', 'atan2', 'asin', 'acos', 'saw', 'square', 'triangle', 'noise',
  'pulse', 'mod', 'clamp', 'lerp', 'step', 'smoothstep'
];

// Available variables
const availableVariables = ['t', 'freq', 'a', 'b', 'c', 'd', 'PI', 'E'];

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
  previewValue: number | null;
}

// Create a safe evaluator for validation
function createTestEvaluator(formula: string): { fn: ((t: number) => number) | null; error: string | null } {
  try {
    // Replace common math notation
    let expr = formula
      .replace(/PI/g, 'Math.PI')
      .replace(/E(?![a-zA-Z])/g, 'Math.E')
      .replace(/\^/g, '**');

    // Check for unknown functions
    const funcPattern = /([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
    let match;
    while ((match = funcPattern.exec(formula)) !== null) {
      const funcName = match[1];
      if (!availableFunctions.includes(funcName) && funcName !== 'Math') {
        return { fn: null, error: `Unknown function: ${funcName}` };
      }
    }

    // Check for unknown variables (standalone identifiers not followed by parenthesis)
    const identPattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b(?!\s*\()/g;
    while ((match = identPattern.exec(formula)) !== null) {
      const varName = match[1];
      if (!availableVariables.includes(varName) && !availableFunctions.includes(varName)) {
        return { fn: null, error: `Unknown variable: ${varName}` };
      }
    }

    // Create mock math functions
    const mathFuncs: Record<string, (...args: number[]) => number> = {
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      abs: Math.abs,
      floor: Math.floor,
      ceil: Math.ceil,
      round: Math.round,
      sqrt: Math.sqrt,
      pow: Math.pow,
      exp: Math.exp,
      log: Math.log,
      log10: Math.log10,
      min: Math.min,
      max: Math.max,
      sign: Math.sign,
      tanh: Math.tanh,
      sinh: Math.sinh,
      cosh: Math.cosh,
      atan: Math.atan,
      atan2: Math.atan2,
      asin: Math.asin,
      acos: Math.acos,
      saw: (x: number) => 2 * (x / (2 * Math.PI) - Math.floor(0.5 + x / (2 * Math.PI))),
      square: (x: number) => Math.sin(x) >= 0 ? 1 : -1,
      triangle: (x: number) => 2 * Math.abs(2 * (x / (2 * Math.PI) - Math.floor(x / (2 * Math.PI) + 0.5))) - 1,
      noise: () => Math.random() * 2 - 1,
      pulse: (x: number, w: number) => (x % (2 * Math.PI)) / (2 * Math.PI) < w ? 1 : -1,
      mod: (a: number, b: number) => ((a % b) + b) % b,
      clamp: (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x)),
      lerp: (a: number, b: number, t: number) => a + (b - a) * t,
      step: (edge: number, x: number) => x < edge ? 0 : 1,
      smoothstep: (e0: number, e1: number, x: number) => {
        const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
        return t * t * (3 - 2 * t);
      },
    };

    // Wrap math functions in expr
    for (const fn of Object.keys(mathFuncs)) {
      const regex = new RegExp('\\b' + fn + '\\b', 'g');
      expr = expr.replace(regex, 'f.' + fn);
    }

    // Create function with safe scope
    const fn = new Function('t', 'f', 'v',
      'with(v) { return ' + expr + '; }'
    ) as (t: number, f: typeof mathFuncs, v: Record<string, number>) => number;

    // Test evaluation
    const testVars = { a: 1, b: 1, c: 0.5, d: 0.5, freq: 440, t: 0 };
    const testResult = fn(0, mathFuncs, testVars);

    if (typeof testResult !== 'number' || !isFinite(testResult)) {
      return { fn: null, error: 'Expression evaluates to invalid value' };
    }

    return {
      fn: (t: number) => fn(t, mathFuncs, { ...testVars, t }),
      error: null
    };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Invalid syntax';
    // Clean up error message
    let cleanError = errorMessage
      .replace(/\bat\b.*$/, '')
      .replace('Unexpected token', 'Syntax error near')
      .replace('Unexpected end of input', 'Incomplete expression')
      .trim();

    // Shorten long errors
    if (cleanError.length > 50) {
      cleanError = cleanError.substring(0, 47) + '...';
    }

    return { fn: null, error: cleanError || 'Invalid syntax' };
  }
}

export function validateFormula(formula: string): ValidationResult {
  // Empty formula is valid (just silent)
  if (!formula.trim()) {
    return { isValid: true, error: null, previewValue: 0 };
  }

  const { fn, error } = createTestEvaluator(formula);

  if (error) {
    return { isValid: false, error, previewValue: null };
  }

  if (fn) {
    try {
      const previewValue = fn(0);
      return { isValid: true, error: null, previewValue };
    } catch {
      return { isValid: false, error: 'Evaluation error', previewValue: null };
    }
  }

  return { isValid: false, error: 'Unknown error', previewValue: null };
}
