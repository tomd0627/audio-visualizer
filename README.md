# Audio Visualizer

A browser-based audio visualizer with local file playback and Spotify track search.

## Features

- **Local file playback** — drag & drop any audio file
- **Spotify search** — search tracks with autocomplete and play 30-second previews (free tier)
- **6 visualizer modes** — Bars, Circular, Oscilloscope, Particles, Tunnel, Aurora
- **Playback controls** — play/pause, seek, rewind/fast-forward, volume, mute
- **Track history** — recent tracks saved to localStorage
- **Sensitivity slider** — adjust visualizer reactivity
- **Full-screen support**

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

- React 18 + TypeScript + Vite 5
- Tailwind CSS v3
- Zustand (state management)
- Web Audio API + Canvas 2D
- Spotify Web API (PKCE OAuth, 30-second previews only)
- react-dropzone

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your Spotify app credentials:
   ```
   VITE_SPOTIFY_CLIENT_ID=your_client_id
   VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

## License

MIT — Tom DeLuca
