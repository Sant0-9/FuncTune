class MathProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.phase = 0;
    this.sampleRate = 44100;
    this.isPlaying = false;
    this.frequency = 440;
    this.mathFunction = null;

    this.params = {
      A: 0.5,
      B: 0.5,
      C: 0.5
    };

    this.port.onmessage = (event) => {
      const { type, data } = event.data;

      switch (type) {
        case 'setFormula':
          this.compileFormula(data.formula);
          break;
        case 'setPlaying':
          this.isPlaying = data.playing;
          if (!data.playing) {
            this.phase = 0;
          }
          break;
        case 'setFrequency':
          this.frequency = data.frequency;
          break;
        case 'setParam':
          if (this.params.hasOwnProperty(data.name)) {
            this.params[data.name] = data.value;
          }
          break;
      }
    };

    this.compileFormula('Math.sin(t * 2 * Math.PI * 440)');
  }

  compileFormula(formula) {
    try {
      const safeFormula = formula
        .replace(/\^/g, '**')
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/abs/g, 'Math.abs')
        .replace(/floor/g, 'Math.floor')
        .replace(/ceil/g, 'Math.ceil')
        .replace(/round/g, 'Math.round')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/pow/g, 'Math.pow')
        .replace(/exp/g, 'Math.exp')
        .replace(/log/g, 'Math.log')
        .replace(/min/g, 'Math.min')
        .replace(/max/g, 'Math.max')
        .replace(/random/g, 'Math.random');

      this.mathFunction = new Function(
        't', 'freq', 'A', 'B', 'C', 'PI',
        `return ${safeFormula};`
      );

      const testResult = this.mathFunction(0, 440, 0.5, 0.5, 0.5, Math.PI);
      if (typeof testResult !== 'number' || !isFinite(testResult)) {
        throw new Error('Invalid formula output');
      }

      this.port.postMessage({ type: 'formulaCompiled', success: true });
    } catch (error) {
      this.mathFunction = new Function('t', 'freq', 'A', 'B', 'C', 'PI', 'return 0;');
      this.port.postMessage({
        type: 'formulaCompiled',
        success: false,
        error: error.message
      });
    }
  }

  hardClip(value) {
    return Math.max(-1.0, Math.min(1.0, value));
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];

    if (!output || output.length === 0) {
      return true;
    }

    const outputChannel = output[0];

    for (let i = 0; i < outputChannel.length; i++) {
      if (this.isPlaying && this.mathFunction) {
        const t = this.phase / this.sampleRate;

        try {
          let sample = this.mathFunction(
            t,
            this.frequency,
            this.params.A,
            this.params.B,
            this.params.C,
            Math.PI
          );

          sample = this.hardClip(sample);

          outputChannel[i] = sample;
        } catch (error) {
          outputChannel[i] = 0;
        }

        this.phase++;
      } else {
        outputChannel[i] = 0;
      }
    }

    if (output.length > 1) {
      output[1].set(output[0]);
    }

    return true;
  }
}

registerProcessor('math-processor', MathProcessor);
