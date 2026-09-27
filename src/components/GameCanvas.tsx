/**
 * Canvas Game Engine for Snoopy's Flying Ace
 * Implements smooth 60fps physics, spacebar controls, custom vector Snoopy sprites,
 * parallax comic backgrounds, Peanuts lore obstacles, and collectibles.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, Difficulty, Obstacle, FlyingWoodstockHazard, Particle, Skin } from '../types';
import { sound } from '../utils/audio';

interface GameCanvasProps {
  gameState: GameState;
  difficulty: Difficulty;
  skin: Skin;
  onGameOver: (result: {
    score: number;
    biscuits: number;
    woodstocks: number;
    durationSeconds: number;
    cause: string;
  }) => void;
  onStartFlight: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  difficulty,
  skin,
  onGameOver,
  onStartFlight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Live HUD score values for overlay
  const [hudScore, setHudScore] = useState(0);
  const [hudBiscuits, setHudBiscuits] = useState(0);
  const [hudWoodstocks, setHudWoodstocks] = useState(0);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Internal mutable game state for 60fps loop
  const stateRef = useRef({
    playerY: 260,
    playerVy: 0,
    playerAngle: 0,
    playerX: 110,
    score: 0,
    biscuits: 0,
    woodstocks: 0,
    obstacles: [] as Obstacle[],
    flyingWoodstocks: [] as FlyingWoodstockHazard[],
    flyingWoodstockTimer: 160,
    particles: [] as Particle[],
    startTime: 0,
    frameCount: 0,
    groundOffset: 0,
    cloudOffset: 0,
    hillOffset: 0,
    propellerAngle: 0,
    scarfPhase: 0,
    activeWoodstockCompanion: false,
    woodstockCompanionTimer: 0,
    woodstockY: 260,
    isCrashing: false,
    crashTimer: 0,
    crashCause: 'Red Baron trap',
    canvasWidth: 480,
    canvasHeight: 640,
    difficultyParams: {
      gap: 165,
      speed: 2.7,
      gravity: 0.35,
      jumpVy: -6.8,
    },
  });

  // Sync difficulty parameters
  useEffect(() => {
    const s = stateRef.current;
    if (difficulty === 'EASY') {
      s.difficultyParams = { gap: 195, speed: 2.1, gravity: 0.32, jumpVy: -6.4 };
    } else if (difficulty === 'ACE') {
      s.difficultyParams = { gap: 140, speed: 3.4, gravity: 0.38, jumpVy: -7.2 };
    } else {
      s.difficultyParams = { gap: 165, speed: 2.7, gravity: 0.35, jumpVy: -6.8 };
    }
  }, [difficulty]);

  // Jump / Flap action
  const performFlap = useCallback(() => {
    const s = stateRef.current;
    if (gameState === 'TITLE') {
      onStartFlight();
      s.playerVy = s.difficultyParams.jumpVy;
      sound.playJump();
      return;
    }
    if (gameState !== 'PLAYING' || s.isCrashing) return;

    s.playerVy = s.difficultyParams.jumpVy;
    sound.playJump();

    // Spawn comic exhaust puff particles
    for (let i = 0; i < 4; i++) {
      s.particles.push({
        x: s.playerX - 28 + (Math.random() * 8 - 4),
        y: s.playerY + 8 + (Math.random() * 8 - 4),
        vx: -s.difficultyParams.speed - Math.random() * 2 - 1,
        vy: (Math.random() - 0.5) * 1.5,
        color: 'rgba(255, 255, 255, 0.9)',
        radius: 5 + Math.random() * 5,
        life: 25,
        maxLife: 25,
      });
    }
  }, [gameState, onStartFlight]);

  // Listen for spacebar on window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(true);
        performFlap();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [performFlap]);

  // Reset or start flight when gameState transitions to PLAYING
  useEffect(() => {
    if (gameState === 'PLAYING') {
      const s = stateRef.current;
      s.playerY = 260;
      s.playerVy = -3;
      s.playerAngle = 0;
      s.score = 0;
      s.biscuits = 0;
      s.woodstocks = 0;
      s.obstacles = [];
      s.flyingWoodstocks = [];
      s.flyingWoodstockTimer = 180;
      s.particles = [];
      s.startTime = Date.now();
      s.isCrashing = false;
      s.crashTimer = 0;
      s.activeWoodstockCompanion = false;
      s.woodstockCompanionTimer = 0;
      setHudScore(0);
      setHudBiscuits(0);
      setHudWoodstocks(0);
    }
  }, [gameState]);

  // Main Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const s = stateRef.current;
      s.frameCount++;

      const width = s.canvasWidth;
      const height = s.canvasHeight;
      const groundY = height - 70;

      // 1. UPDATE PHYSICS
      if (gameState === 'PLAYING') {
        if (!s.isCrashing) {
          s.playerVy += s.difficultyParams.gravity;
          s.playerY += s.playerVy;

          // Pitch angle calculation
          if (s.playerVy < 0) {
            s.playerAngle = Math.max(-0.45, s.playerVy * 0.08);
          } else {
            s.playerAngle = Math.min(1.1, s.playerVy * 0.09);
          }

          // Floor / Ceiling bounds
          if (s.playerY >= groundY - 20) {
            s.playerY = groundY - 20;
            s.isCrashing = true;
            s.crashCause = "Crash landed in Charlie Brown's backyard lawn!";
            sound.playCrash();
            triggerCrashParticles(s.playerX, s.playerY, 'AAUGH!');
          }
          if (s.playerY <= 15) {
            s.playerY = 15;
            s.playerVy = 0;
          }

          // Woodstock companion animation
          if (s.activeWoodstockCompanion) {
            s.woodstockCompanionTimer--;
            s.woodstockY += (s.playerY - 25 - s.woodstockY) * 0.12;
            if (s.woodstockCompanionTimer <= 0) {
              s.activeWoodstockCompanion = false;
            }
          }

          // Parallax scrolls
          s.groundOffset = (s.groundOffset + s.difficultyParams.speed) % 40;
          s.cloudOffset = (s.cloudOffset + s.difficultyParams.speed * 0.3) % width;
          s.hillOffset = (s.hillOffset + s.difficultyParams.speed * 0.6) % width;
          s.propellerAngle += 0.45;
          s.scarfPhase += 0.2;

          // Spawn obstacles
          const lastObstacle = s.obstacles[s.obstacles.length - 1];
          const obstacleSpacing = 240;
          if (!lastObstacle || lastObstacle.x < width - obstacleSpacing) {
            const minH = 70;
            const maxH = groundY - s.difficultyParams.gap - minH;
            const topHeight = Math.floor(minH + Math.random() * (maxH - minH));
            const bottomHeight = groundY - topHeight - s.difficultyParams.gap;

            // Pick random comic obstacle type
            const types: Array<'TREE' | 'BOOTH' | 'PIANO' | 'RED_BARON'> = [
              'TREE',
              'BOOTH',
              'PIANO',
              'RED_BARON',
            ];
            const obstacleType = types[Math.floor(Math.random() * types.length)];

            // 55% chance for a dog biscuit, 25% chance for Woodstock
            const hasWoodstock = Math.random() < 0.25;
            const hasBiscuit = !hasWoodstock && Math.random() < 0.6;
            const itemY = topHeight + s.difficultyParams.gap / 2 + (Math.random() * 40 - 20);

            s.obstacles.push({
              x: width + 30,
              topHeight,
              bottomHeight,
              width: 68,
              passed: false,
              type: obstacleType,
              hasBiscuit,
              biscuitY: itemY,
              biscuitCollected: false,
              hasWoodstock,
              woodstockY: itemY,
              woodstockRescued: false,
            });
          }

          // Update obstacles & collisions
          for (let i = s.obstacles.length - 1; i >= 0; i--) {
            const obs = s.obstacles[i];
            obs.x -= s.difficultyParams.speed;

            // Check score pass
            if (!obs.passed && obs.x + obs.width < s.playerX) {
              obs.passed = true;
              s.score += 1;
              setHudScore(s.score);
              sound.playScore();
            }

            // Hitbox checks for player (doghouse + snoopy ~ 44 wide, 34 high)
            const playerBox = {
              left: s.playerX - 22,
              right: s.playerX + 22,
              top: s.playerY - 17,
              bottom: s.playerY + 17,
            };

            const obsLeft = obs.x;
            const obsRight = obs.x + obs.width;
            const topObsBottom = obs.topHeight;
            const bottomObsTop = groundY - obs.bottomHeight;

            // Collision with top or bottom pillar
            const hitHorizontal = playerBox.right > obsLeft + 6 && playerBox.left < obsRight - 6;
            const hitTop = playerBox.top < topObsBottom;
            const hitBottom = playerBox.bottom > bottomObsTop;

            if (hitHorizontal && (hitTop || hitBottom)) {
              s.isCrashing = true;
              s.crashCause = getCrashName(obs.type);
              sound.playCrash();
              triggerCrashParticles(s.playerX, s.playerY, 'BONK!');
            }

            // Biscuit collection
            if (obs.hasBiscuit && !obs.biscuitCollected && obs.biscuitY !== undefined) {
              const dx = s.playerX - (obs.x + obs.width / 2);
              const dy = s.playerY - obs.biscuitY;
              if (Math.sqrt(dx * dx + dy * dy) < 32) {
                obs.biscuitCollected = true;
                s.biscuits += 1;
                s.score += 2; // bonus points
                setHudBiscuits(s.biscuits);
                setHudScore(s.score);
                sound.playBiscuit();

                // Sparkles
                spawnFloatingText(s.playerX, s.playerY - 20, '+2 BONE!', '#F59E0B');
              }
            }

            // Woodstock rescue
            if (obs.hasWoodstock && !obs.woodstockRescued && obs.woodstockY !== undefined) {
              const dx = s.playerX - (obs.x + obs.width / 2);
              const dy = s.playerY - obs.woodstockY;
              if (Math.sqrt(dx * dx + dy * dy) < 36) {
                obs.woodstockRescued = true;
                s.woodstocks += 1;
                s.score += 5; // big bonus
                s.activeWoodstockCompanion = true;
                s.woodstockCompanionTimer = 180; // 3 seconds
                s.woodstockY = obs.woodstockY;
                setHudWoodstocks(s.woodstocks);
                setHudScore(s.score);
                sound.playWoodstock();

                spawnFloatingText(s.playerX, s.playerY - 25, 'WOODSTOCK RESCUED! +5', '#EAB308');
              }
            }

            // Remove out-of-screen obstacles
            if (obs.x + obs.width < -50) {
              s.obstacles.splice(i, 1);
            }
          }

          // Dynamic Obstacle: Woodstock (and windblown kite) flying across the screen!
          s.flyingWoodstockTimer--;
          if (s.flyingWoodstockTimer <= 0) {
            const spawnY = Math.floor(110 + Math.random() * (groundY - 240));
            const isKiteHazard = Math.random() < 0.35;
            s.flyingWoodstocks.push({
              id: 'fw_' + Date.now() + Math.random(),
              x: width + 40,
              y: spawnY,
              baseY: spawnY,
              speed: s.difficultyParams.speed + 1.6, // Flies actively across the screen towards Snoopy!
              phase: Math.random() * Math.PI * 2,
              amplitude: 22 + Math.random() * 18,
              passed: false,
              type: isKiteHazard ? 'KITE_WIND_GUST' : 'ERRATIC_WOODSTOCK',
            });
            // Reset spawn timer (every ~4 to 7 seconds)
            s.flyingWoodstockTimer = 220 + Math.floor(Math.random() * 160);
          }

          for (let i = s.flyingWoodstocks.length - 1; i >= 0; i--) {
            const fw = s.flyingWoodstocks[i];
            fw.x -= fw.speed;
            fw.y = fw.baseY + Math.sin(s.frameCount * 0.12 + fw.phase) * fw.amplitude;

            // Collision check with Snoopy
            const playerBox = {
              left: s.playerX - 20,
              right: s.playerX + 20,
              top: s.playerY - 15,
              bottom: s.playerY + 15,
            };

            const hitWoodstock =
              playerBox.right > fw.x - 16 &&
              playerBox.left < fw.x + 16 &&
              playerBox.bottom > fw.y - 14 &&
              playerBox.top < fw.y + 14;

            if (hitWoodstock && !s.isCrashing) {
              s.isCrashing = true;
              s.crashCause =
                fw.type === 'KITE_WIND_GUST'
                  ? "Tangled by Charlie Brown's windblown kite flying across the sky!"
                  : 'Startled by Woodstock performing acrobatic loop-de-loops in your flight path!';
              sound.playCrash();
              triggerCrashParticles(s.playerX, s.playerY, 'CHIRP! AAUGH!');
            }

            // Safe pass / evasion bonus
            if (!fw.passed && fw.x < s.playerX - 25) {
              fw.passed = true;
              s.score += 1;
              setHudScore(s.score);
              sound.playScore();
              spawnFloatingText(
                s.playerX,
                s.playerY - 22,
                fw.type === 'KITE_WIND_GUST' ? 'DODGED KITE! +1' : 'DODGED WOODSTOCK! +1',
                '#EAB308',
              );
            }

            if (fw.x < -60) {
              s.flyingWoodstocks.splice(i, 1);
            }
          }
        } else {
          // Crashing sequence
          s.crashTimer++;
          s.playerVy += 0.5;
          s.playerY += s.playerVy;
          s.playerAngle += 0.15;

          if (s.playerY >= groundY - 15) {
            s.playerY = groundY - 15;
          }

          if (s.crashTimer > 45) {
            const flightDuration = Math.max(1, Math.round((Date.now() - s.startTime) / 1000));
            onGameOver({
              score: s.score,
              biscuits: s.biscuits,
              woodstocks: s.woodstocks,
              durationSeconds: flightDuration,
              cause: s.crashCause,
            });
            return;
          }
        }
      } else {
        // Idle bobbing in title screen
        s.playerY = 260 + Math.sin(s.frameCount * 0.05) * 12;
        s.playerAngle = Math.sin(s.frameCount * 0.05) * 0.08;
        s.propellerAngle += 0.3;
        s.scarfPhase += 0.15;
        s.groundOffset = (s.groundOffset + 1.2) % 40;
        s.cloudOffset = (s.cloudOffset + 0.4) % width;
      }

      // Update particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) {
          s.particles.splice(i, 1);
        }
      }

      // 2. DRAW CANVAS GRAPHICS
      ctx.clearRect(0, 0, width, height);

      // A. Sky gradient (Charles Schulz warm nostalgic afternoon sky)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, '#78C4F4'); // Bright comic blue
      skyGrad.addColorStop(0.65, '#BCE1F8');
      skyGrad.addColorStop(1, '#FEF08A'); // Warm golden sunset near horizon
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // B. Distant clouds (Peanuts hand-drawn cloud style)
      drawComicClouds(ctx, width, groundY, s.cloudOffset);

      // C. Distant suburban hills & Charlie Brown house silhouette
      drawSuburbanHills(ctx, width, groundY, s.hillOffset);

      // D. Draw Obstacles
      for (const obs of s.obstacles) {
        drawObstacle(ctx, obs, groundY);

        // Draw Collectible Biscuit
        if (obs.hasBiscuit && !obs.biscuitCollected && obs.biscuitY !== undefined) {
          drawDogBiscuit(ctx, obs.x + obs.width / 2, obs.biscuitY, s.frameCount);
        }

        // Draw Collectible Woodstock
        if (obs.hasWoodstock && !obs.woodstockRescued && obs.woodstockY !== undefined) {
          drawFloatingWoodstock(ctx, obs.x + obs.width / 2, obs.woodstockY, s.frameCount);
        }
      }

      // D.2 Draw Woodstock Flying Across the Screen Hazards
      for (const fw of s.flyingWoodstocks) {
        drawFlyingWoodstockHazard(ctx, fw, s.frameCount);
      }

      // E. Draw Ground & Grass with bold comic ink line
      drawGround(ctx, width, height, groundY, s.groundOffset);

      // F. Draw Particles
      drawParticles(ctx, s.particles);

      // G. Draw Woodstock Wingman companion (if rescued)
      if (s.activeWoodstockCompanion && !s.isCrashing) {
        drawWoodstockCompanion(ctx, s.playerX - 42, s.woodstockY, s.frameCount);
      }

      // H. Draw Player (Snoopy on Doghouse or custom skin)
      drawPlayer(
        ctx,
        s.playerX,
        s.playerY,
        s.playerAngle,
        skin,
        s.propellerAngle,
        s.scarfPhase,
        s.isCrashing,
      );

      // I. Comic halftone dot aesthetic overlay
      drawComicVignette(ctx, width, height);

      animId = requestAnimationFrame(render);
    };

    const triggerCrashParticles = (x: number, y: number, text: string) => {
      const s = stateRef.current;
      for (let i = 0; i < 14; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 5;
        s.particles.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 2,
          color: ['#DC2626', '#FACC15', '#FFFFFF', '#1C1917'][Math.floor(Math.random() * 4)],
          radius: 3 + Math.random() * 4,
          life: 30,
          maxLife: 30,
        });
      }
      spawnFloatingText(x, y - 35, text, '#DC2626');
    };

    const spawnFloatingText = (x: number, y: number, text: string, color: string) => {
      stateRef.current.particles.push({
        x,
        y,
        vx: 0,
        vy: -1.2,
        color,
        radius: 0,
        life: 40,
        maxLife: 40,
        text,
      });
    };

    const getCrashName = (type: Obstacle['type']): string => {
      switch (type) {
        case 'TREE':
          return "Tangled inside Charlie Brown's Kite-Eating Tree!";
        case 'BOOTH':
          return "Crashed into Lucy's 5¢ Psychiatric Booth!";
        case 'PIANO':
          return "Slammed into Schroeder's Grand Piano keys!";
        case 'RED_BARON':
          return 'Shot down by the Infamous Red Baron!';
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState, skin, onGameOver]);

  // Handle canvas sizing for sharp high-DPI displays
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const width = 480;
    const height = 640;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    stateRef.current.canvasWidth = width;
    stateRef.current.canvasHeight = height;
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center select-none"
      onClick={performFlap}
    >
      {/* Canvas Frame with Comic Book Border */}
      <div className="relative rounded-2xl p-2.5 bg-stone-900 shadow-2xl comic-border-lg overflow-hidden max-w-full">
        <canvas
          ref={canvasRef}
          style={{ width: 480, maxWidth: '100%', height: 'auto', aspectRatio: '480/640' }}
          className="rounded-xl block bg-[#78C4F4] cursor-pointer touch-none"
        />

        {/* Live In-Game Comic HUD */}
        {gameState === 'PLAYING' && (
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none">
            {/* Score Badge */}
            <div className="bg-amber-300 comic-border-sm px-4 py-1.5 rounded-xl shadow-md flex items-center gap-2">
              <span className="font-comic text-xl font-bold text-stone-900 tracking-wide">
                SCORE
              </span>
              <span className="font-mono text-2xl font-black text-stone-950 tabular-nums">
                {hudScore}
              </span>
            </div>

            {/* Collectibles count */}
            <div className="flex items-center gap-2.5">
              <div className="bg-white/95 comic-border-sm px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                <span className="text-base" role="img" aria-label="dog biscuit">
                  🦴
                </span>
                <span className="font-mono text-sm font-bold text-stone-900 tabular-nums">
                  {hudBiscuits}
                </span>
              </div>
              <div className="bg-amber-200/95 comic-border-sm px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                <span className="text-base" role="img" aria-label="woodstock">
                  🐤
                </span>
                <span className="font-mono text-sm font-bold text-stone-900 tabular-nums">
                  {hudWoodstocks}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Title Screen Prompt Overlay */}
        {gameState === 'TITLE' && (
          <div className="absolute inset-0 bg-stone-900/35 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center text-white pointer-events-none">
            <div className="bg-white comic-border-lg p-6 rounded-2xl max-w-xs text-stone-900 shadow-2xl transform hover:scale-102 transition-transform">
              <div className="inline-block bg-red-600 text-white font-comic text-lg font-bold px-3 py-0.5 rounded-md -rotate-2 mb-2 shadow-sm">
                DAWN PATROL
              </div>
              <h2 className="font-comic text-3xl font-extrabold text-stone-900 leading-tight mb-2">
                Snoopy's Flying Ace
              </h2>
              <p className="font-comic text-stone-600 text-base mb-5 leading-snug">
                Take to the skies on the Red Doghouse! Dodge kite-eating trees & the Red Baron.
              </p>

              <div className="bg-amber-100 border-2 border-dashed border-amber-400 p-3 rounded-xl mb-4">
                <div className="text-xs uppercase font-bold tracking-wider text-amber-900 mb-1">
                  Controls
                </div>
                <div className="flex items-center justify-center gap-2">
                  <kbd className="px-3 py-1.5 bg-stone-900 text-white font-mono text-sm font-bold rounded-lg shadow-inner">
                    SPACEBAR
                  </kbd>
                  <span className="text-stone-700 font-comic text-sm">or Click to Fly</span>
                </div>
              </div>

              <div className="text-sm font-comic font-bold text-red-600 animate-pulse">
                [ PRESS SPACE TO TAKE OFF ]
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Spacebar Control Bar below canvas */}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onMouseDown={performFlap}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-comic text-lg font-bold transition-all ${
            isSpacePressed
              ? 'bg-amber-400 translate-y-1 shadow-none border-2 border-stone-950'
              : 'bg-amber-300 hover:bg-amber-400 comic-border-sm hover:-translate-y-0.5'
          }`}
        >
          <kbd className="px-2 py-0.5 bg-stone-900 text-white font-mono text-xs rounded">SPACE</kbd>
          <span>Tap Spacebar or Click to Flap</span>
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                           CANVAS DRAWING UTILITIES                         */
/* -------------------------------------------------------------------------- */

function drawComicClouds(
  ctx: CanvasRenderingContext2D,
  width: number,
  groundY: number,
  offset: number,
) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 2.5;

  const clouds = [
    { x: 60 - offset, y: 80, s: 0.9 },
    { x: 280 - offset, y: 130, s: 1.1 },
    { x: 500 - offset, y: 70, s: 0.85 },
    { x: 720 - offset, y: 110, s: 1.0 },
  ];

  clouds.forEach((c) => {
    let cx = c.x;
    while (cx < -120) cx += width + 200;
    while (cx > width + 120) cx -= width + 200;

    ctx.save();
    ctx.translate(cx, c.y);
    ctx.scale(c.s, c.s);

    ctx.beginPath();
    ctx.arc(0, 0, 24, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(22, -18, 28, Math.PI * 0.9, Math.PI * 1.9);
    ctx.arc(58, -12, 24, Math.PI * 1.1, Math.PI * 2.0);
    ctx.arc(80, 0, 22, Math.PI * 1.5, Math.PI * 0.5);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    // Schulz comic cloud accent lines
    ctx.beginPath();
    ctx.moveTo(14, 8);
    ctx.lineTo(34, 8);
    ctx.moveTo(42, 10);
    ctx.lineTo(60, 10);
    ctx.stroke();

    ctx.restore();
  });

  ctx.restore();
}

function drawSuburbanHills(
  ctx: CanvasRenderingContext2D,
  width: number,
  groundY: number,
  offset: number,
) {
  ctx.save();
  ctx.fillStyle = '#A3E635'; // Peanuts suburban green
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(0, groundY);

  // Gentle comic hills
  for (let x = 0; x <= width; x += 20) {
    const hillY =
      groundY - 35 + Math.sin((x + offset) * 0.015) * 18 + Math.cos((x + offset) * 0.03) * 8;
    ctx.lineTo(x, hillY);
  }

  ctx.lineTo(width, groundY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Draw Charlie Brown's famous zig-zag silhouette fence & trees along hill
  const fenceSpots = [80, 220, 360, 500];
  fenceSpots.forEach((fx) => {
    let px = fx - offset * 0.5;
    while (px < -60) px += width + 120;
    while (px > width + 60) px -= width + 120;

    const py = groundY - 26;
    // Wooden fence posts
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(px, py - 18, 5, 20);
    ctx.fillRect(px + 14, py - 18, 5, 20);
    ctx.fillRect(px + 28, py - 18, 5, 20);
    ctx.strokeRect(px, py - 18, 5, 20);
    ctx.strokeRect(px + 14, py - 18, 5, 20);
    ctx.strokeRect(px + 28, py - 18, 5, 20);

    // Cross beams
    ctx.fillRect(px - 4, py - 14, 40, 4);
    ctx.strokeRect(px - 4, py - 14, 40, 4);
    ctx.fillRect(px - 4, py - 6, 40, 4);
    ctx.strokeRect(px - 4, py - 6, 40, 4);
  });

  ctx.restore();
}

function drawGround(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundY: number,
  offset: number,
) {
  ctx.save();

  // Lower dirt layer
  ctx.fillStyle = '#D97706';
  ctx.fillRect(0, groundY + 16, width, height - (groundY + 16));

  // Top grass strip
  ctx.fillStyle = '#65A30D';
  ctx.fillRect(0, groundY, width, 16);

  // Bold black comic border
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(width, groundY);
  ctx.stroke();

  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, groundY + 16);
  ctx.lineTo(width, groundY + 16);
  ctx.stroke();

  // Scrolling tufts of Schulz grass
  ctx.fillStyle = '#1C1917';
  for (let x = -offset; x < width + 40; x += 35) {
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x + 4, groundY - 8);
    ctx.lineTo(x + 8, groundY);
    ctx.moveTo(x + 5, groundY);
    ctx.lineTo(x + 11, groundY - 10);
    ctx.lineTo(x + 15, groundY);
    ctx.stroke();
  }

  // Charlie Brown iconic zigzag chevron line on bottom border
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 0; x < width; x += 24) {
    ctx.moveTo(x, groundY + 36);
    ctx.lineTo(x + 12, groundY + 44);
    ctx.lineTo(x + 24, groundY + 36);
  }
  ctx.stroke();

  ctx.restore();
}

function drawObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle, groundY: number) {
  ctx.save();
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#1C1917';

  const x = obs.x;
  const w = obs.width;
  const topH = obs.topHeight;
  const botH = obs.bottomHeight;
  const botY = groundY - botH;

  switch (obs.type) {
    case 'TREE': {
      // Kite-Eating Tree
      // Top branch/foliage
      ctx.fillStyle = '#15803D';
      ctx.fillRect(x + 10, 0, w - 20, topH - 24);
      ctx.strokeRect(x + 10, 0, w - 20, topH - 24);

      // Cloud-like leaf cluster at the tip
      ctx.beginPath();
      ctx.arc(x + w / 2, topH - 18, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Tangled Kite hanging from top tree!
      drawTangledKite(ctx, x + w / 2 - 8, topH - 12);

      // Bottom trunk & foliage
      ctx.fillStyle = '#78350F'; // Wood trunk
      ctx.fillRect(x + 16, botY + 24, w - 32, botH);
      ctx.strokeRect(x + 16, botY + 24, w - 32, botH);

      // Bark lines
      ctx.beginPath();
      ctx.moveTo(x + 28, botY + 45);
      ctx.lineTo(x + 28, botY + 90);
      ctx.moveTo(x + 38, botY + 65);
      ctx.lineTo(x + 38, botY + 115);
      ctx.stroke();

      // Green foliage cluster on top of bottom trunk
      ctx.fillStyle = '#15803D';
      ctx.beginPath();
      ctx.arc(x + w / 2, botY + 20, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Tangled yellow kite in the bottom tree branches
      drawTangledKite(ctx, x + w / 2 + 12, botY + 28, '#FACC15');

      // Charles Schulz comic wooden sign: "KITE-EATER"
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(x + 6, botY + 52, w - 12, 17);
      ctx.strokeRect(x + 6, botY + 52, w - 12, 17);
      ctx.fillStyle = '#1C1917';
      ctx.font = 'bold 10px "Patrick Hand", cursive';
      ctx.textAlign = 'center';
      ctx.fillText('KITE-EATER', x + w / 2, botY + 64);
      break;
    }

    case 'BOOTH': {
      // Lucy's Psychiatric Booth ("THE DOCTOR IS IN - 5¢")
      // Top Booth
      ctx.fillStyle = '#F59E0B'; // Wooden booth amber
      ctx.fillRect(x, 0, w, topH);
      ctx.strokeRect(x, 0, w, topH);

      // Booth banner
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(x, topH - 26, w, 26);
      ctx.strokeRect(x, topH - 26, w, 26);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px "Patrick Hand", cursive';
      ctx.textAlign = 'center';
      ctx.fillText('DOCTOR IS IN', x + w / 2, topH - 10);

      // Bottom Booth
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(x, botY, w, botH);
      ctx.strokeRect(x, botY, w, botH);

      // Top sign for bottom booth
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(x, botY, w, 24);
      ctx.strokeRect(x, botY, w, 24);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px "Patrick Hand", cursive';
      ctx.textAlign = 'center';
      ctx.fillText('FEE: 5¢', x + w / 2, botY + 17);

      // Wood plank lines
      ctx.strokeStyle = '#92400E';
      ctx.lineWidth = 2;
      for (let y = botY + 36; y < groundY; y += 22) {
        ctx.beginPath();
        ctx.moveTo(x + 2, y);
        ctx.lineTo(x + w - 2, y);
        ctx.stroke();
      }
      break;
    }

    case 'PIANO': {
      // Schroeder's Musical Upright Columns
      ctx.fillStyle = '#1C1917'; // Black piano lacquer
      ctx.fillRect(x + 4, 0, w - 8, topH);
      ctx.strokeRect(x + 4, 0, w - 8, topH);

      // Piano keys at bottom of top obstacle
      drawPianoKeys(ctx, x + 4, topH - 30, w - 8, 30);

      // Bottom piano pillar
      ctx.fillStyle = '#1C1917';
      ctx.fillRect(x + 4, botY, w - 8, botH);
      ctx.strokeRect(x + 4, botY, w - 8, botH);
      drawPianoKeys(ctx, x + 4, botY, w - 8, 30);

      // Eighth notes floating on body
      drawEighthNote(ctx, x + w / 2, botY + 55);
      break;
    }

    case 'RED_BARON': {
      // Red Baron Fokker Dr.I Wing Spires
      ctx.fillStyle = '#DC2626'; // Red Baron Crimson
      ctx.fillRect(x + 6, 0, w - 12, topH);
      ctx.strokeRect(x + 6, 0, w - 12, topH);

      // Iron Cross insignia on top
      drawGermanCross(ctx, x + w / 2, topH - 24, 12);

      // Bottom pillar
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(x + 6, botY, w - 12, botH);
      ctx.strokeRect(x + 6, botY, w - 12, botH);
      drawGermanCross(ctx, x + w / 2, botY + 24, 12);
      break;
    }
  }

  ctx.restore();
}

function drawTangledKite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string = '#EF4444',
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(0.3);

  // Diamond kite
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(12, 0);
  ctx.lineTo(0, 14);
  ctx.lineTo(-12, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cross sticks
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(0, 14);
  ctx.moveTo(-12, 0);
  ctx.lineTo(12, 0);
  ctx.stroke();

  // Dangling string with bow ties
  ctx.beginPath();
  ctx.moveTo(0, 14);
  ctx.quadraticCurveTo(8, 24, 2, 34);
  ctx.stroke();

  ctx.fillStyle = '#FBBF24';
  ctx.fillRect(-2, 22, 5, 3);
  ctx.fillRect(4, 28, 5, 3);

  ctx.restore();
}

function drawPianoKeys(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);

  // White key dividers
  const keyW = w / 5;
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 1.5;
  for (let i = 1; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * keyW, y);
    ctx.lineTo(x + i * keyW, y + h);
    ctx.stroke();
  }

  // Black keys
  ctx.fillStyle = '#1C1917';
  const blackKeys = [1, 2, 4];
  blackKeys.forEach((k) => {
    ctx.fillRect(x + k * keyW - keyW * 0.3, y, keyW * 0.6, h * 0.6);
  });
  ctx.restore();
}

function drawEighthNote(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.ellipse(x - 5, y + 4, 5, 4, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 1, y + 2);
  ctx.lineTo(x - 1, y - 12);
  ctx.quadraticCurveTo(x + 6, y - 10, x + 8, y - 4);
  ctx.stroke();
  ctx.restore();
}

function drawGermanCross(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(0, 0, size + 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#1C1917';
  ctx.beginPath();
  // Iron cross shape
  ctx.moveTo(-size, -size * 0.35);
  ctx.lineTo(-size * 0.35, -size * 0.35);
  ctx.lineTo(-size * 0.35, -size);
  ctx.lineTo(size * 0.35, -size);
  ctx.lineTo(size * 0.35, -size * 0.35);
  ctx.lineTo(size, -size * 0.35);
  ctx.lineTo(size, size * 0.35);
  ctx.lineTo(size * 0.35, size * 0.35);
  ctx.lineTo(size * 0.35, size);
  ctx.lineTo(-size * 0.35, size);
  ctx.lineTo(-size * 0.35, size * 0.35);
  ctx.lineTo(-size, size * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawDogBiscuit(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  ctx.save();
  const floatY = y + Math.sin(frame * 0.1) * 4;
  ctx.translate(x, floatY);

  // Golden glowing halo
  ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();

  // Bone biscuit
  ctx.fillStyle = '#FDE047';
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 2.5;

  // Center bar
  ctx.fillRect(-10, -4, 20, 8);

  // End circles
  ctx.beginPath();
  ctx.arc(-10, -5, 4.5, 0, Math.PI * 2);
  ctx.arc(-10, 5, 4.5, 0, Math.PI * 2);
  ctx.arc(10, -5, 4.5, 0, Math.PI * 2);
  ctx.arc(10, 5, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeRect(-10, -4, 20, 8);

  ctx.restore();
}

function drawFloatingWoodstock(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  ctx.save();
  const floatY = y + Math.sin(frame * 0.12) * 5;
  ctx.translate(x, floatY);

  // Halo
  ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();

  // Woodstock
  drawWoodstockBody(ctx, frame);

  // "HELP!" or musical note
  ctx.fillStyle = '#1C1917';
  ctx.font = 'bold 11px "Patrick Hand", cursive';
  ctx.fillText('♪', 10, -12);

  ctx.restore();
}

function drawWoodstockCompanion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frame: number,
) {
  ctx.save();
  const bobY = y + Math.sin(frame * 0.2) * 4;
  ctx.translate(x, bobY);
  ctx.scale(0.85, 0.85);

  drawWoodstockBody(ctx, frame);

  // Small heart
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(-2, -14, 3, 0, Math.PI * 2);
  ctx.arc(4, -14, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Renders Woodstock flying across the screen as a dynamic aerial hazard
 */
function drawFlyingWoodstockHazard(
  ctx: CanvasRenderingContext2D,
  fw: FlyingWoodstockHazard,
  frame: number,
) {
  ctx.save();
  ctx.translate(fw.x, fw.y);

  if (fw.type === 'ERRATIC_WOODSTOCK') {
    // Woodstock zooming towards the left!
    const tilt = Math.sin(frame * 0.2 + fw.phase) * 0.25;
    ctx.rotate(tilt);

    // Comic wind speed trails behind Woodstock (to the right)
    ctx.strokeStyle = '#1C1917';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(18, -4);
    ctx.lineTo(34, -4);
    ctx.moveTo(22, 2);
    ctx.lineTo(40, 2);
    ctx.moveTo(16, 8);
    ctx.lineTo(30, 8);
    ctx.stroke();

    // Flip horizontally so Woodstock flies left toward player
    ctx.scale(-1.25, 1.25);
    drawWoodstockBody(ctx, frame * 2); // Faster frantic flap

    // Comic exclamation bubble above Woodstock
    ctx.scale(-1, 1); // unflip text
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#1C1917';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -18, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#DC2626';
    ctx.font = 'bold 11px "Patrick Hand", cursive';
    ctx.textAlign = 'center';
    ctx.fillText('!', 0, -14);
  } else {
    // Charlie Brown's escaped kite dancing in wind gusts
    const kiteTilt = Math.sin(frame * 0.15 + fw.phase) * 0.35;
    ctx.rotate(kiteTilt);

    // Diamond kite
    ctx.fillStyle = '#EF4444';
    ctx.strokeStyle = '#1C1917';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(14, 0);
    ctx.lineTo(0, 18);
    ctx.lineTo(-14, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cross sticks
    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(0, 18);
    ctx.moveTo(-14, 0);
    ctx.lineTo(14, 0);
    ctx.stroke();

    // Trailing string with bows
    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.quadraticCurveTo(15, 30, 8, 44);
    ctx.stroke();

    ctx.fillStyle = '#FACC15';
    ctx.fillRect(8, 26, 6, 4);
    ctx.fillRect(4, 36, 6, 4);

    // Wind gust lines
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-25, -6);
    ctx.quadraticCurveTo(-15, -12, -5, -6);
    ctx.stroke();
  }

  ctx.restore();
}

function drawWoodstockBody(ctx: CanvasRenderingContext2D, frame: number) {
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#1C1917';
  ctx.fillStyle = '#FACC15';

  // Body
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.arc(6, -6, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Tuft of feathers on head (Woodstock's iconic spiky hair!)
  ctx.beginPath();
  ctx.moveTo(3, -11);
  ctx.lineTo(2, -17);
  ctx.moveTo(6, -12);
  ctx.lineTo(6, -19);
  ctx.moveTo(9, -11);
  ctx.lineTo(11, -17);
  ctx.stroke();

  // Eye
  ctx.fillStyle = '#1C1917';
  ctx.beginPath();
  ctx.arc(7, -7, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.moveTo(11, -7);
  ctx.lineTo(17, -5);
  ctx.lineTo(11, -3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wing flapping
  const wingAngle = Math.sin(frame * 0.5) * 0.4;
  ctx.save();
  ctx.translate(-2, 0);
  ctx.rotate(wingAngle);
  ctx.fillStyle = '#FACC15';
  ctx.beginPath();
  ctx.ellipse(-4, 0, 7, 4, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Tiny feet
  ctx.beginPath();
  ctx.moveTo(-1, 7);
  ctx.lineTo(-1, 11);
  ctx.moveTo(3, 7);
  ctx.lineTo(3, 11);
  ctx.stroke();

  ctx.restore();
}

/**
 * Main Player Sprite Renderer:
 * Supports WWI Flying Ace, Joe Cool, Woodstock, Astronaut, Beagle Scout.
 */
function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  skin: Skin,
  propAngle: number,
  scarfPhase: number,
  isCrashing: boolean,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.lineWidth = 3;
  ctx.strokeStyle = '#1C1917';

  if (skin.id === 'WOODSTOCK') {
    // Fly directly as Woodstock
    ctx.scale(1.8, 1.8);
    drawWoodstockBody(ctx, Math.floor(propAngle * 10));
    ctx.restore();
    return;
  }

  // 1. SNOOPY'S RED DOGHOUSE (Sopwith Camel)
  const roofColor = skin.color; // Red Doghouse or skin color
  const wallColor = skin.color === '#DC2626' ? '#B91C1C' : '#1E293B';

  // Doghouse lower body
  ctx.fillStyle = wallColor;
  ctx.fillRect(-26, 4, 48, 22);
  ctx.strokeRect(-26, 4, 48, 22);

  // Black doorway hole in front of doghouse
  ctx.fillStyle = '#1C1917';
  ctx.beginPath();
  ctx.arc(-2, 26, 11, Math.PI, 0);
  ctx.fill();

  // Slanted Roof Pitch
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(-30, 4);
  ctx.lineTo(0, -10);
  ctx.lineTo(26, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Plank lines on roof
  ctx.beginPath();
  ctx.moveTo(-12, -2);
  ctx.lineTo(-8, 4);
  ctx.moveTo(8, -4);
  ctx.lineTo(12, 4);
  ctx.stroke();

  // Propeller on front nose of the doghouse
  ctx.save();
  ctx.translate(26, 8);
  ctx.rotate(propAngle);
  // Blurred propeller spin arc
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.ellipse(0, 0, 4, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Prop hub
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Wheels on undercarriage
  ctx.fillStyle = '#1C1917';
  ctx.beginPath();
  ctx.arc(-14, 27, 4.5, 0, Math.PI * 2);
  ctx.arc(14, 27, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 2. SNOOPY ATOP THE DOGHOUSE
  ctx.save();
  ctx.translate(-4, -12);

  // Body lying/leaning back
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(-2, 0, 13, 7, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Snoopy's Head
  ctx.beginPath();
  ctx.arc(10, -6, 9.5, 0, Math.PI * 2);
  // Snout
  ctx.ellipse(17, -5, 8.5, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Black nose
  ctx.fillStyle = '#1C1917';
  ctx.beginPath();
  ctx.arc(24, -6, 3, 0, Math.PI * 2);
  ctx.fill();

  // Eye (happy squint or pilot focus)
  if (isCrashing) {
    // "X" eye on crash
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(11, -9);
    ctx.lineTo(15, -5);
    ctx.moveTo(15, -9);
    ctx.lineTo(11, -5);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#1C1917';
    ctx.beginPath();
    ctx.arc(13, -7, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Snoopy's Black Ear
  ctx.fillStyle = '#1C1917';
  ctx.beginPath();
  ctx.ellipse(-1, -4, 5, 10, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // 3. SKIN-SPECIFIC ACCESSORIES
  if (skin.id === 'FLYING_ACE') {
    // Aviator Cap (Brown leather)
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.arc(9, -8, 10, Math.PI * 0.8, Math.PI * 2.1);
    ctx.lineTo(3, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pilot Goggles on forehead
    ctx.fillStyle = '#93C5FD'; // Glass reflection
    ctx.beginPath();
    ctx.arc(11, -11, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#60A5FA';
    ctx.beginPath();
    ctx.arc(16, -10, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Long Red Silk Scarf Fluttering in the Wind!
    drawFlutteringScarf(ctx, -2, -1, scarfPhase);
  } else if (skin.id === 'JOE_COOL') {
    // Dark sunglasses
    ctx.fillStyle = '#171717';
    ctx.beginPath();
    ctx.roundRect(10, -10, 11, 7, 3);
    ctx.fill();
    ctx.stroke();

    // Red Joe Cool sweater over body
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.ellipse(-2, 1, 11, 6, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (skin.id === 'ASTRONAUT') {
    // NASA Apollo space helmet
    ctx.fillStyle = 'rgba(219, 234, 254, 0.45)';
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(14, -6, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Gold tinted visor
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.ellipse(17, -6, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (skin.id === 'BEAGLE_SCOUT') {
    // Scout Ranger Hat
    ctx.fillStyle = '#15803D';
    // Brim
    ctx.beginPath();
    ctx.ellipse(10, -14, 14, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Crown
    ctx.fillRect(4, -22, 12, 9);
    ctx.strokeRect(4, -22, 12, 9);

    // Neckerchief
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.moveTo(3, -1);
    ctx.lineTo(8, 5);
    ctx.lineTo(10, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
  ctx.restore();
}

function drawFlutteringScarf(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  phase: number,
) {
  ctx.save();
  ctx.fillStyle = '#DC2626'; // Red scarf
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(startX, startY);

  const len = 32;
  const p1 = Math.sin(phase) * 6;
  const p2 = Math.cos(phase * 1.3) * 8;

  ctx.quadraticCurveTo(startX - 14, startY + p1, startX - len, startY + p2);
  ctx.lineTo(startX - len - 4, startY + p2 + 5);
  ctx.quadraticCurveTo(startX - 14, startY + p1 + 5, startX, startY + 5);
  ctx.closePath();

  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  ctx.save();
  particles.forEach((p) => {
    ctx.save();
    if (p.text) {
      // Floating text particle (e.g. +2 BONE! or AAUGH!)
      ctx.fillStyle = p.color;
      ctx.strokeStyle = '#1C1917';
      ctx.lineWidth = 3;
      ctx.font = '900 16px "Patrick Hand", cursive';
      ctx.textAlign = 'center';
      ctx.strokeText(p.text, p.x, p.y);
      ctx.fillText(p.text, p.x, p.y);
    } else {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = '#1C1917';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  });
  ctx.restore();
}

function drawComicVignette(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  // Clean border line around canvas interior
  ctx.strokeStyle = '#1C1917';
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, width - 3, height - 3);
  ctx.restore();
}
