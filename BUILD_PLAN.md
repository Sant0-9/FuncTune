# FuncTune Build Plan

## Current Status

A math-first audio engine where users type mathematical equations and hear them as sound. Like Desmos, but for audio.

### Completed Features
- [x] Multi-equation system (add/remove/toggle)
- [x] Real-time math expression evaluation
- [x] Variable sliders (a, b, c, d, freq)
- [x] Waveform visualizer with gradient fill
- [x] Spectrum analyzer view + waveform zoom
- [x] Master volume control
- [x] Play/Stop transport
- [x] Safety limiter (prevents ear damage)
- [x] Scroll wheel support on knobs/sliders
- [x] Keyboard shortcuts (Space, +/-)
- [x] Copy/Duplicate equation actions
- [x] Reset variables button
- [x] URL sharing (base64url)
- [x] Preset system (factory + local presets)
- [x] Cyberpunk UI theme

---

## Phase 1: Core Improvements (High Priority)

### 1.1 Formula Error Feedback
- [x] Show syntax errors inline below equation input
- [x] Highlight invalid formulas in red
- [x] Display error message (e.g., "Unknown function: siin")
- [x] Preview computed value at t=0

### 1.2 URL Sharing
- [x] Encode equations + variables in URL
- [x] Share button that copies URL to clipboard
- [x] Load state from URL on page load
- [x] Compact encoding (base64 or custom)

### 1.3 Preset System
- [x] Built-in preset library (Bass, Pad, Lead, FX, etc.)
- [x] Each preset = set of equations + variable values
- [x] Quick-load dropdown
- [x] User can save current state as preset (localStorage)

### 1.4 Better Visualizer
- [x] Toggle between waveform / spectrum analyzer
- [x] Frequency spectrum (FFT) view
- [ ] Phase scope option
- [x] Zoom controls for waveform

---

## Phase 2: Advanced Audio Features

### 2.1 Note/Keyboard Input
- [ ] Virtual keyboard component
- [ ] Computer keyboard mapping (Z-M = notes)
- [ ] MIDI input support (Web MIDI API)
- [ ] Note frequency injected as `freq` variable
- [ ] Polyphony (multiple notes at once)

### 2.2 Envelope Generator
- [ ] ADSR controls (Attack, Decay, Sustain, Release)
- [ ] Envelope applied to output amplitude
- [ ] Trigger on note press
- [ ] Visual envelope curve display

### 2.3 LFO Modulation
- [ ] Low Frequency Oscillator for variables
- [ ] LFO rate, depth, waveform controls
- [ ] Route LFO to any variable (a, b, c, d)
- [ ] Visual LFO indicator

### 2.4 Effects Chain
- [ ] Delay effect
- [ ] Reverb (convolution or algorithmic)
- [ ] Filter (lowpass, highpass, bandpass)
- [ ] Distortion/waveshaper

---

## Phase 3: Sequencer & Automation

### 3.1 Variable Automation
- [ ] Timeline for each variable
- [ ] Draw automation curves
- [ ] Loop points
- [ ] Sync to BPM

### 3.2 Step Sequencer
- [ ] 16-step pattern grid
- [ ] Each step triggers a note
- [ ] Adjustable BPM
- [ ] Multiple patterns

### 3.3 Recording & Export
- [ ] Record audio output
- [ ] Export as WAV file
- [ ] Export equation set as JSON
- [ ] Import JSON presets

---

## Phase 4: Visual Enhancements

### 4.1 Graph View (Desmos-style)
- [ ] X-Y plot of equation over time window
- [ ] Multiple equations = multiple colored lines
- [ ] Zoom and pan
- [ ] Show current playhead position

### 4.2 3D Visualization
- [ ] WebGL-based visualizer
- [ ] Frequency bars in 3D
- [ ] Reactive particles
- [ ] Customizable color schemes

### 4.3 Theme System
- [ ] Multiple color themes
- [ ] Custom accent color picker
- [ ] Dark/light mode (keep dark as default)

---

## Phase 5: Collaboration & Social

### 5.1 User Accounts (Optional)
- [ ] Sign in with GitHub/Google
- [ ] Save presets to cloud
- [ ] Public preset gallery

### 5.2 Embed Mode
- [ ] Embeddable iframe version
- [ ] Minimal UI for embedding in blogs
- [ ] Read-only mode option

---

## Technical Debt / Refactoring

- [ ] Add unit tests for math evaluator
- [ ] Error boundary for audio crashes
- [ ] Mobile responsive layout
- [ ] Touch support for knobs/sliders
- [ ] PWA support (offline, installable)
- [ ] Performance profiling for complex equations
- [ ] WebWorker for heavy computation

---

## Quick Wins (Can Do Now)

1. **Copy equation button** - Done (copy formula to clipboard)
2. **Duplicate equation** - Done (clone an existing equation)
3. **Reset variables** - Done (reset all to defaults)
4. **Mute individual equations** - Already have toggle, ensure volume=0 works
5. **Randomize** - Random equation generator for exploration
6. **Formula autocomplete** - Dropdown suggestions while typing
7. **Keyboard shortcuts** - Done (Space=play/stop, +/- for volume)

---

## File Structure Plan

```
src/
  audio/
    processor.ts       # AudioWorklet (done)
    effects.ts         # Future effects chain
    midi.ts            # MIDI input handler
  components/
    Knob.tsx           # (done)
    Visualizer.tsx     # (done) - extend for spectrum
    EquationRow.tsx    # (done)
    VariableSlider.tsx # (done)
    Keyboard.tsx       # Virtual keyboard
    Envelope.tsx       # ADSR display
    Sequencer.tsx      # Step sequencer
    Graph.tsx          # Desmos-style plot
  store/
    synthStore.ts      # (done)
    presetStore.ts     # Preset management
    sequencerStore.ts  # Sequencer state
  utils/
    mathParser.ts      # Safer expression parser
    urlCodec.ts        # URL encode/decode (done)
    audioExport.ts     # WAV export
  presets/
    factory.ts         # Built-in presets (done)
```

---

## Priority Order

1. **Formula error feedback** - Essential UX
2. **URL sharing** - Easy to implement, high value
3. **Preset system** - Makes app more usable
4. **Keyboard input** - Makes it playable as instrument
5. **Spectrum analyzer** - Visual feedback
6. **Export audio** - Utility feature

---

## Notes

- Keep math input as the CORE feature
- Don't hide the equations - they are the product
- Performance matters - equations evaluate 44100x/second
- Safety first - always clamp output, test new features at low volume
