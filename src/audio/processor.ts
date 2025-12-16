// Math Audio Processor - evaluates mathematical expressions as audio

export const processorCode = `
const SAFETY_LIMIT = 0.8;

// Math functions available in equations
const mathFuncs = {
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
  // Extra functions for audio
  saw: (x) => 2 * (x / (2 * Math.PI) - Math.floor(0.5 + x / (2 * Math.PI))),
  square: (x) => Math.sin(x) >= 0 ? 1 : -1,
  triangle: (x) => 2 * Math.abs(2 * (x / (2 * Math.PI) - Math.floor(x / (2 * Math.PI) + 0.5))) - 1,
  noise: () => Math.random() * 2 - 1,
  pulse: (x, w) => (x % (2 * Math.PI)) / (2 * Math.PI) < w ? 1 : -1,
  mod: (a, b) => ((a % b) + b) % b,
  clamp: (x, lo, hi) => Math.max(lo, Math.min(hi, x)),
  lerp: (a, b, t) => a + (b - a) * t,
  step: (edge, x) => x < edge ? 0 : 1,
  smoothstep: (e0, e1, x) => {
    const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  },
};

// Create a safe evaluator for math expressions
function createEvaluator(formula) {
  try {
    // Replace common math notation
    let expr = formula
      .replace(/PI/g, 'Math.PI')
      .replace(/E(?![a-zA-Z])/g, 'Math.E')
      .replace(/\\^/g, '**');

    // Wrap math functions
    for (const fn of Object.keys(mathFuncs)) {
      const regex = new RegExp('\\\\b' + fn + '\\\\b', 'g');
      expr = expr.replace(regex, 'f.' + fn);
    }

    // Create function with safe scope
    const fn = new Function('t', 'f', 'v',
      'with(v) { try { return ' + expr + '; } catch(e) { return 0; } }'
    );

    return (t, vars) => {
      try {
        const result = fn(t, mathFuncs, vars);
        if (typeof result !== 'number' || !isFinite(result)) return 0;
        return result;
      } catch (e) {
        return 0;
      }
    };
  } catch (e) {
    return () => 0;
  }
}

class MathProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.time = 0;
    this.equations = [];
    this.evaluators = [];
    this.variables = { a: 1, b: 1, c: 0.5, d: 0.5, freq: 440 };
    this.mixMode = 'add';

    // Smoothed output for click prevention
    this.lastSample = 0;
    this.smoothing = 0.005;

    this.port.onmessage = (event) => {
      const { type } = event.data;

      if (type === 'setEquations') {
        this.equations = event.data.equations || [];
        this.mixMode = event.data.mixMode || 'add';
        // Compile evaluators
        this.evaluators = this.equations.map(eq => ({
          evaluate: createEvaluator(eq.formula),
          volume: eq.volume
        }));
      }

      if (type === 'setVariables') {
        this.variables = { ...this.variables, ...event.data.variables };
      }
    };
  }

  process(inputs, outputs) {
    const output = outputs[0];
    const dt = 1 / sampleRate;

    for (let channel = 0; channel < output.length; channel++) {
      const outputChannel = output[channel];

      for (let i = 0; i < outputChannel.length; i++) {
        let sample = 0;

        // Evaluate all equations
        if (this.evaluators.length > 0) {
          const vars = { ...this.variables, t: this.time };

          if (this.mixMode === 'add') {
            for (const eq of this.evaluators) {
              sample += eq.evaluate(this.time, vars) * eq.volume;
            }
          } else if (this.mixMode === 'multiply') {
            sample = 1;
            for (const eq of this.evaluators) {
              sample *= eq.evaluate(this.time, vars) * eq.volume + (1 - eq.volume);
            }
          } else if (this.mixMode === 'average') {
            for (const eq of this.evaluators) {
              sample += eq.evaluate(this.time, vars) * eq.volume;
            }
            sample /= this.evaluators.length;
          }
        }

        // Smooth to prevent clicks
        sample = this.lastSample + (sample - this.lastSample) * this.smoothing;
        this.lastSample = sample;

        // Safety limiter
        sample = Math.max(-SAFETY_LIMIT, Math.min(SAFETY_LIMIT, sample));

        // Soft clip for additional safety
        if (Math.abs(sample) > 0.6) {
          sample = Math.sign(sample) * (0.6 + Math.tanh((Math.abs(sample) - 0.6) * 2) * 0.2);
        }

        outputChannel[i] = sample;
        this.time += dt;
      }
    }

    return true;
  }
}

registerProcessor('math-processor', MathProcessor);
`;

export const createProcessorUrl = (): string => {
  const blob = new Blob([processorCode], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
};
