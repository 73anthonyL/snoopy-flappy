# Snoopy's Flying Ace

A Flappy Bird–style browser game starring Snoopy as the World War I Flying Ace. Pilot the red doghouse through Peanuts-themed obstacles, collect dog biscuits, rescue Woodstock, and dodge the Red Baron.

**[▶ Play it in your browser](https://73anthonyl.github.io/snoopy-flappy/)**

The game runs entirely in the browser. Graphics are drawn procedurally on an HTML canvas and all sound is synthesized with the Web Audio API, so there are no sprite sheets or audio files to load.

## Features

- **Three difficulty levels** — Easy, Classic, and Ace, which change the gap size, scroll speed, gravity, and flap strength.
- **Five pilot skins** — two available from the start and three unlocked by reaching high scores of 5, 15, and 25.
- **Collectibles** — dog biscuits are worth 2 bonus points and rescuing Woodstock is worth 5.
- **Pilot dashboard** — lifetime stats, seven medals, and a log of your last 30 flights.
- **Local persistence** — progress is saved in the browser's `localStorage`; there is no account or server.

## Controls

| Input | Action |
| --- | --- |
| <kbd>Space</kbd> | Flap / take off |
| Click or tap the canvas | Flap / take off |

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 22.12 or later, which Vite requires (the major version is pinned in `.nvmrc`; run `nvm use` if you use nvm)
- npm, which ships with Node.js

### Install and run

```bash
git clone https://github.com/73anthonyL/snoopy-flappy.git
cd snoopy-flappy
npm install
npm run dev
```

Then open <http://localhost:3000>.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server on port 3000 |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run check` | Type-check, lint, and verify formatting |
| `npm run format` | Reformat all files with Biome |
| `npm run lint` | Type-check only |
| `npm run clean` | Remove build output |

## Tech stack

- [React 19](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for the dev server and build
- [Tailwind CSS v4](https://tailwindcss.com/) for styling
- Canvas 2D API for rendering and Web Audio API for sound

## Project structure

```text
src/
├── App.tsx              # Top-level state: view, game state, difficulty, skin, stats
├── types.ts             # Shared TypeScript types
├── components/
│   ├── GameCanvas.tsx   # Game loop, physics, collisions, and canvas drawing
│   ├── Dashboard.tsx    # Stats, skin and difficulty selection, medals, flight log
│   ├── EndScreen.tsx    # Post-flight debrief modal
│   └── ...
└── utils/
    ├── storage.ts       # Skin and medal definitions, localStorage persistence
    └── audio.ts         # Web Audio sound synthesizer
```

See [CLAUDE.md](CLAUDE.md) for a deeper description of the architecture.

## Acknowledgements

The initial version of this project was generated with [Google AI Studio](https://aistudio.google.com/).

This is an unofficial fan project. *Peanuts*, Snoopy, Woodstock, and related characters are trademarks of Peanuts Worldwide LLC. This project is not affiliated with, sponsored by, or endorsed by Peanuts Worldwide LLC.

## License

The source code is licensed under the [Apache License 2.0](LICENSE). The license covers the code only and grants no rights to the *Peanuts* characters or trademarks.
