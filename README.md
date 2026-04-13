# Audio Visualizer

A browser-based audio visualizer with local file playback and iTunes track search.

## Features

- **Demo mode** — "Try Demo →" button lets you see the visualizer instantly, no upload needed
- **Local file playback** — drag & drop any audio file
- **iTunes search** — search tracks with autocomplete and play 30-second previews
- **6 visualizer modes** — Bars, Circular, Oscilloscope, Particles, Tunnel, Aurora
- **Playback controls** — play/pause, seek, rewind/fast-forward, volume, mute
- **Track history** — recent tracks saved to localStorage
- **Sensitivity slider** — adjust visualizer reactivity
- **How it works** — "?" button explains the FFT analysis and how each mode uses frequency data
- **5 color themes** — Solar, Aurora, Neon, Forest, Glacier
- **Full-screen support**

## Demo mode

Place a royalty-free MP3 at `public/demo.mp3` to enable the "Try Demo →" button on the empty state. Any CC0 audio file works — [Pixabay Music](https://pixabay.com/music/) is a good source.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `←` / `→` | Seek ±10 seconds |
| `↑` / `↓` | Volume ±10% |
| `M` | Toggle mute |
| `1`–`6` | Switch visualizer mode |
| `F` | Toggle full screen |
| `H` | Toggle track history panel |

## Tech Stack

- React 18 + TypeScript + Vite 6
- Tailwind CSS v3
- Zustand (state management)
- Web Audio API + Canvas 2D
- iTunes Search API (30-second previews, no auth required)
- react-dropzone

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the dev server:
   ```bash
   npm run dev
   ```

The iTunes search API is proxied through a Vite middleware in development and a Netlify Function in production — no credentials needed.

## License

MIT — Tom DeLuca
