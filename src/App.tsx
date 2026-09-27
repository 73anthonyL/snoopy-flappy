/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { EndScreen } from './components/EndScreen';
import { GameCanvas } from './components/GameCanvas';
import { Header } from './components/Header';
import { HowToPlayModal } from './components/HowToPlayModal';
import type { Difficulty, GameState, PilotStats, Skin } from './types';
import { sound } from './utils/audio';
import { loadPilotStats, SKINS, saveFlightResult } from './utils/storage';

export default function App() {
  const [currentView, setCurrentView] = useState<'GAME' | 'DASHBOARD'>('GAME');
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [difficulty, setDifficulty] = useState<Difficulty>('CLASSIC');
  const [selectedSkin, setSelectedSkin] = useState<Skin>(SKINS[0]);
  const [stats, setStats] = useState<PilotStats>(() => loadPilotStats());
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Last run debrief for EndScreen
  const [lastFlight, setLastFlight] = useState<{
    score: number;
    highScore: number;
    isNewRecord: boolean;
    biscuits: number;
    woodstocks: number;
    durationSeconds: number;
    cause: string;
    newlyUnlockedSkins: Skin[];
  } | null>(null);

  // Sync audio mute
  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (muted && isMusicPlaying) {
      setIsMusicPlaying(false);
    }
  };

  const handleToggleMusic = () => {
    const playing = sound.toggleMusic();
    setIsMusicPlaying(playing);
    if (playing && isMuted) {
      setIsMuted(false);
      sound.isMuted = false;
    }
  };

  // Launch / Take off action
  const handleStartFlight = useCallback(() => {
    setCurrentView('GAME');
    setGameState('PLAYING');
    setLastFlight(null);
  }, []);

  // When game ends on canvas
  const handleGameOver = (result: {
    score: number;
    biscuits: number;
    woodstocks: number;
    durationSeconds: number;
    cause: string;
  }) => {
    const { updatedStats, isNewRecord, newlyUnlockedSkins } = saveFlightResult(
      result.score,
      result.biscuits,
      result.woodstocks,
      result.durationSeconds,
      difficulty,
      selectedSkin.id,
      result.cause,
    );

    setStats(updatedStats);
    setGameState('GAME_OVER');
    setLastFlight({
      ...result,
      highScore: updatedStats.highScore,
      isNewRecord,
      newlyUnlockedSkins,
    });
  };

  // Listen for spacebar navigation when on dashboard or title
  useEffect(() => {
    const handleGlobalSpace = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (currentView === 'DASHBOARD' && !isManualOpen) {
          e.preventDefault();
          handleStartFlight();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalSpace);
    return () => window.removeEventListener('keydown', handleGlobalSpace);
  }, [currentView, isManualOpen, handleStartFlight]);

  return (
    <div className="min-h-screen bg-[#FBF8EF] text-stone-900 font-sans flex flex-col selection:bg-amber-300 selection:text-stone-900">
      {/* 3-Zone Top Bar */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          if (view === 'GAME' && gameState === 'GAME_OVER') {
            setGameState('TITLE');
          }
        }}
        onOpenManual={() => setIsManualOpen(true)}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={handleToggleMusic}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-6xl w-full mx-auto">
        {currentView === 'GAME' ? (
          <div className="w-full flex flex-col items-center py-4">
            {/* Context Header & Live Score Dashboard Banner */}
            <div className="text-center mb-3 w-full max-w-lg">
              <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-red-600 uppercase tracking-widest mb-0.5">
                <span>PEANUTS FLIGHT CORPS</span>
                <span>·</span>
                <span>SORTIE MISSION</span>
              </div>
              <h2 className="font-comic text-2xl sm:text-3xl font-black text-stone-900 leading-tight">
                {selectedSkin.name} on Dawn Patrol
              </h2>

              {/* Score Dashboard Strip */}
              <div className="mt-2.5 bg-white/95 comic-border-sm rounded-xl p-2 flex items-center justify-between gap-2 shadow-sm text-xs font-comic">
                <div className="flex items-center gap-1.5 px-2">
                  <span className="text-amber-500 font-bold">🏆 Best:</span>
                  <span className="font-mono font-black text-stone-900 text-sm">
                    {stats.highScore}
                  </span>
                </div>
                <div className="h-4 w-px bg-stone-300" />
                <div className="flex items-center gap-1.5 px-2">
                  <span className="text-stone-500 font-bold">Sorties:</span>
                  <span className="font-mono font-bold text-stone-900">{stats.totalFlights}</span>
                </div>
                <div className="h-4 w-px bg-stone-300" />
                <div className="flex items-center gap-1.5 px-2">
                  <span role="img" aria-label="biscuit">
                    🦴
                  </span>
                  <span className="font-mono font-bold text-amber-700">{stats.totalBiscuits}</span>
                  <span className="ml-1" role="img" aria-label="woodstock">
                    🐤
                  </span>
                  <span className="font-mono font-bold text-yellow-600">
                    {stats.totalWoodstocks}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentView('DASHBOARD')}
                  className="bg-amber-300 hover:bg-amber-400 font-bold text-stone-900 px-2.5 py-1 rounded-lg comic-border-sm transition-colors cursor-pointer ml-auto"
                >
                  Full Dashboard 📊
                </button>
              </div>
            </div>

            {/* Game Canvas Container */}
            <GameCanvas
              gameState={gameState}
              difficulty={difficulty}
              skin={selectedSkin}
              onGameOver={handleGameOver}
              onStartFlight={handleStartFlight}
            />

            {/* In-Arena Quick Skin & Mode Drawer */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-stone-200/80 px-3 py-1.5 rounded-lg comic-border-sm font-comic">
                <span className="text-stone-600">Pilot:</span>
                <strong className="text-stone-900">{selectedSkin.name}</strong>
                <button
                  type="button"
                  onClick={() => setCurrentView('DASHBOARD')}
                  className="ml-1 text-red-600 font-bold hover:underline cursor-pointer"
                >
                  (Change)
                </button>
              </div>

              <div className="flex items-center gap-1.5 bg-stone-200/80 px-3 py-1.5 rounded-lg comic-border-sm font-comic">
                <span className="text-stone-600">Weather:</span>
                <strong className="text-stone-900">
                  {difficulty === 'EASY'
                    ? 'Pleasant Breeze'
                    : difficulty === 'ACE'
                      ? 'Red Baron Gale'
                      : 'Classic Sortie'}
                </strong>
                <button
                  type="button"
                  onClick={() => setCurrentView('DASHBOARD')}
                  className="ml-1 text-red-600 font-bold hover:underline cursor-pointer"
                >
                  (Adjust)
                </button>
              </div>

              <div className="flex items-center gap-1.5 bg-amber-200/80 px-3 py-1.5 rounded-lg comic-border-sm font-comic">
                <span className="text-amber-900">Best:</span>
                <strong className="text-stone-950 font-mono tabular-nums text-sm">
                  {stats.highScore} pts
                </strong>
              </div>
            </div>
          </div>
        ) : (
          /* Pilot Dashboard View */
          <Dashboard
            stats={stats}
            selectedSkin={selectedSkin}
            difficulty={difficulty}
            onSelectSkin={(skin) => {
              setSelectedSkin(skin);
              sound.playBiscuit();
            }}
            onSelectDifficulty={(diff) => {
              setDifficulty(diff);
              sound.playJump();
            }}
            onTakeOff={handleStartFlight}
            onStatsReset={(freshStats) => setStats(freshStats)}
          />
        )}
      </main>

      {/* Proper End Screen Modal */}
      {gameState === 'GAME_OVER' && lastFlight && (
        <EndScreen
          score={lastFlight.score}
          highScore={lastFlight.highScore}
          isNewRecord={lastFlight.isNewRecord}
          biscuits={lastFlight.biscuits}
          woodstocks={lastFlight.woodstocks}
          durationSeconds={lastFlight.durationSeconds}
          cause={lastFlight.cause}
          skin={selectedSkin}
          newlyUnlockedSkins={lastFlight.newlyUnlockedSkins}
          onFlyAgain={handleStartFlight}
          onOpenDashboard={() => {
            setGameState('TITLE');
            setCurrentView('DASHBOARD');
          }}
        />
      )}

      {/* Flight Manual Modal */}
      <HowToPlayModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />

      {/* Quiet Footer */}
      <footer className="border-t border-stone-200 bg-[#F4EFE2] py-4 px-6 text-center text-xs text-stone-600 font-comic">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Inspired by Charles M. Schulz’s beloved <em>Peanuts</em> comic strip · Dedicated to
            Snoopy and the Sopwith Camel.
          </div>
          <div className="font-mono text-stone-500">
            Press [SPACE] to fly · Root Beer on standby
          </div>
        </div>
      </footer>
    </div>
  );
}
