# FuncTune - Math-Powered Groovebox

A high-performance web synthesizer that turns math formulas into sound using AudioWorklet for glitch-free audio processing.

## Features

- **Real-time Math Synthesis**: Type JavaScript math expressions and hear them instantly
- **AudioWorklet Engine**: 44.1kHz sample-accurate processing with zero UI lag
- **Smart Knobs**: Three parameters (A, B, C) that auto-wire to your formulas
- **Virtual Keyboard**: Play notes with mouse or computer keyboard (a-k keys)
- **Live Oscilloscope**: Real-time waveform visualization with Canvas
- **URL Sharing**: Share your sounds via URL parameters

## Tech Stack

- **Framework**: React + Vite + TypeScript
- **Audio**: Web Audio API + AudioWorklet
- **State**: Zustand
- **Visuals**: Canvas API

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## How to Use

1. Click PLAY or press a keyboard key to initialize audio
2. Type a math formula in the input box (updates live)
3. Tweak the A, B, C knobs to modulate your sound
4. Play notes with the virtual keyboard or computer keys (a-k)
5. Click SHARE to copy a URL with your current settings

## Available Variables

- `t` - time in seconds
- `freq` - current note frequency in Hz
- `A`, `B`, `C` - knob values (0.0 to 1.0)
- `PI` - Math.PI constant

## Example Formulas

**Sine Wave**
```js
Math.sin(t * 2 * Math.PI * freq)
```

**Square Wave**
```js
Math.sin(t * 2 * Math.PI * freq) > 0 ? A : -A
```

**Kick Drum**
```js
Math.sin(t * 60 * Math.exp(-t * A * 10)) * Math.exp(-t * B * 5)
```

**Laser Sound**
```js
Math.sin(t * freq * (1 + A * Math.sin(t * 20))) * Math.exp(-t * B * 3)
```

**Sawtooth Wave**
```js
((t * freq) % 1) * 2 - 1
```

## Architecture

### Two-Brain System

**UI Brain (Main Thread)**
- React components
- Zustand state management
- Canvas visualizer (60fps)

**Audio Brain (AudioWorklet Thread)**
- Runs at 44,100 samples/second
- Dynamic Function compilation for speed
- Hard clipper safety (-1.0 to 1.0)

### Key Files

- `public/math-processor.js` - AudioWorklet processor (the "Audio Brain")
- `src/hooks/useAudioEngine.ts` - Audio context manager
- `src/store/audioStore.ts` - Zustand state
- `src/components/Knob.tsx` - Rotary knob control
- `src/components/Oscilloscope.tsx` - Waveform visualizer
- `src/components/Keyboard.tsx` - Virtual piano keyboard

## MVP Checklist

- [x] Vite Project initialized
- [x] AudioWorklet running without crackling
- [x] Text Input that updates sound live
- [x] 3 Smart Knobs (A, B, C) that modulate the math
- [x] Virtual Keyboard that changes pitch
- [x] Visualizer (Oscilloscope)
- [x] Share Button (URL encoding)

## Next Steps (Phase 2+)

- ADSR envelope for note shaping
- Polyphony (multiple voices)
- Step sequencer (16-step grid)
- Effects bus (reverb, delay)
- AI wizard for formula generation
- Variable auto-detection for smart knobs

## Performance Notes

- Formula compilation happens once (not per sample)
- Hard clipping prevents speaker damage
- Canvas rendering is throttled to 60fps
- Parameter updates are batched to AudioWorklet

## Browser Requirements

- Modern browser with AudioWorklet support (Chrome 66+, Firefox 76+)
- HTTPS or localhost (required for AudioContext)
