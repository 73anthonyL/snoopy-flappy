# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Snoopy's Flying Ace" — a Flappy Bird–style browser game. Client-only React 19 + TypeScript + Vite + Tailwind CSS v4 app, scaffolded from a Google AI Studio applet template.

## Commands

```bash
npm install
npm run dev      # Vite dev server on http://localhost:3000 (binds 0.0.0.0)
npm run build    # production build to dist/
npm run preview  # serve the production build
npm run check    # type-check (tsc) + Biome lint and format check; run before committing
npm run format   # rewrite files with Biome's formatter
npm run lint     # type-check only; kept as-is because AI Studio generated it
```

Vite 8 requires Node.js 22.12 or later (or 20.19+); `.nvmrc` pins Node 22.

There is no test framework or test script configured. If tests are added, a runner (e.g. Vitest) must be installed first.

## Architecture

### State ownership

`src/App.tsx` owns all cross-component state: the current view (`GAME` | `DASHBOARD`), the `GameState` machine (`TITLE` → `PLAYING` → `GAME_OVER`), difficulty, selected skin, and `PilotStats`. Components are presentational and communicate upward through callbacks. There is no router or state library.

Flow of a flight:

1. `handleStartFlight` sets `gameState` to `PLAYING`; `GameCanvas` reacts to that transition by resetting its internal state.
2. On crash, `GameCanvas` calls `onGameOver(result)`.
3. `App.handleGameOver` passes the result to `saveFlightResult` (`src/utils/storage.ts`), which persists it and returns updated stats plus any newly unlocked skins.
4. `EndScreen` renders as a modal from the `lastFlight` debrief.

### Game engine (`src/components/GameCanvas.tsx`)

The largest file; it holds both the engine and all rendering.

- **Two kinds of state.** Simulation state lives in a single mutable `stateRef` that the `requestAnimationFrame` loop mutates directly, so the loop never triggers React renders. React state (`hudScore`, `hudBiscuits`, `hudWoodstocks`) is only a mirror for the DOM HUD overlay — whenever the score or a collectible count changes in `stateRef`, the matching `setHud*` call must be made too.
- **Frame-based physics.** Gravity, speed, and timers are per-frame values with no delta-time scaling (e.g. a timer of 180 means ~3 seconds at 60fps). Game speed therefore depends on the display refresh rate.
- **Fixed logical canvas.** The world is 480×640 logical pixels, scaled by `devicePixelRatio` for sharpness and shrunk with CSS. All coordinates and hitboxes assume those logical dimensions.
- **Difficulty** is a set of four parameters (`gap`, `speed`, `gravity`, `jumpVy`) synced into `stateRef.difficultyParams` by an effect.
- **Drawing** is done by module-level `draw*` functions below the component. All sprites, obstacles, and backgrounds are procedural canvas vector drawing — no sprite sheets. Skins change how `drawPlayer` renders, keyed by `skin.id`.
- **Input** — spacebar is handled by window listeners in both `GameCanvas` (flap) and `App` (take off from the dashboard). Changes to keyboard handling need to consider both.

### Game content and persistence (`src/utils/storage.ts`)

`SKINS` and `MEDALS` are the data tables for unlockable content. Skins unlock by `unlockScore` against the high score; medals are derived at render time from an `isUnlocked(stats)` predicate and are never stored. Stats persist to `localStorage` under `snoopy_flying_ace_stats_v1`, with history capped at the last 30 flights. Changing the shape of `PilotStats` requires handling previously stored data in `loadPilotStats` (or bumping the key version).

Adding a skin means adding a `SKINS` entry *and* a rendering branch in `drawPlayer`. Adding an obstacle type means extending the `Obstacle['type']` union in `src/types.ts`, the spawn list, `drawObstacle`, and `getCrashName` in `GameCanvas.tsx`.

### Audio (`src/utils/audio.ts`)

A singleton `sound` (`SoundEngine`) synthesizes every effect and the background music with the Web Audio API — there are no audio files. The `AudioContext` is created lazily on the first user gesture to satisfy browser autoplay policy. `App` keeps `isMuted` / `isMusicPlaying` React state in sync with the engine's own flags manually.

### Styling

Tailwind v4 is loaded through the `@tailwindcss/vite` plugin with no `tailwind.config` file. The comic-book look comes from custom utilities in `src/index.css` (`comic-border`, `comic-border-sm`, `comic-border-lg`, `comic-border-hover`, `font-comic`, `comic-paper-bg`); reuse these rather than re-creating borders and shadows inline. Fonts are loaded from Google Fonts in `index.html`.

## Deployment

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages (<https://73anthonyl.github.io/snoopy-flappy/>) on every push to `main`. Pages serves the site under `/snoopy-flappy/`, so the workflow sets `VITE_BASE_PATH`, which `vite.config.ts` reads as `base`. Locally and in AI Studio the variable is unset and the base stays `/`. Any asset referenced by an absolute URL string instead of an `import` will break on the deployed site.

## Things to know

- **AI Studio compatibility.** The project may be opened in Google AI Studio again, so keep `metadata.json` (AI Studio's app config), `.env.example`, and the template's dependency list intact, even though `@google/genai`, `express`, `dotenv`, `motion`, and `lucide-react` are not imported by anything in `src/`. No `.env` file is needed to run the game.
- **Assets.** Reference images with an `import` so Vite bundles them; a literal `/src/...` URL only resolves on the dev server.
- **`vite.config.ts` HMR block.** The `DISABLE_HMR` handling is for the AI Studio environment and is marked do-not-modify.
- **Path alias.** `@/` resolves to the repository root, not `src/`.
- **Linting uses Biome, not ESLint.** ESLint's TypeScript plugin cannot parse TypeScript 7 projects. Rules and formatter settings are in `biome.json`. Suppress a rule with a `// biome-ignore <rule>: <reason>` comment; the reason is required.
- **TypeScript is strict.** `tsconfig.json` does not set `strict`, but TypeScript 7 enables it by default.
