/**
 * Snoopy's Pilot Dashboard & Hangar
 * Comprehensive flight telemetry, skin wardrobe, achievements, difficulty weather,
 * and historical sortie log.
 */

import React, { useState } from 'react';
import { PilotStats, Difficulty, Skin } from '../types';
import { SKINS, MEDALS, resetPilotStats } from '../utils/storage';
// Imported rather than referenced by URL string so Vite bundles it into the production build
import heroImageUrl from '../assets/images/snoopy_flying_ace_hero_1790487274294.jpg';

interface DashboardProps {
  stats: PilotStats;
  selectedSkin: Skin;
  difficulty: Difficulty;
  onSelectSkin: (skin: Skin) => void;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onTakeOff: () => void;
  onStatsReset: (newStats: PilotStats) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  selectedSkin,
  difficulty,
  onSelectSkin,
  onSelectDifficulty,
  onTakeOff,
  onStatsReset,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HANGAR' | 'MEDALS' | 'LOGBOOK'>('OVERVIEW');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Compute military rank based on score
  const getPilotRank = (highScore: number) => {
    if (highScore >= 40) return { title: 'Legendary Sky Beagle', starCount: 5, color: 'text-amber-500' };
    if (highScore >= 25) return { title: 'Squadron Commander Ace', starCount: 4, color: 'text-red-600' };
    if (highScore >= 15) return { title: 'First Lieutenant Aviator', starCount: 3, color: 'text-blue-600' };
    if (highScore >= 5) return { title: 'Flight Cadet', starCount: 2, color: 'text-emerald-600' };
    return { title: 'Backyard Fledgling', starCount: 1, color: 'text-stone-600' };
  };

  const rank = getPilotRank(stats.highScore);
  const totalMinutes = Math.floor(stats.totalFlightTimeSeconds / 60);
  const totalSeconds = stats.totalFlightTimeSeconds % 60;
  const totalDistanceMiles = ((stats.totalScore * 75) / 1760).toFixed(1);

  const handleResetData = () => {
    const fresh = resetPilotStats();
    onStatsReset(fresh);
    setShowResetConfirm(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Top Banner with Hero Artwork */}
      <div className="relative rounded-2xl overflow-hidden comic-border-lg bg-stone-900 mb-6 shadow-xl">
        <div className="relative h-44 sm:h-52 w-full overflow-hidden">
          <img
            src={heroImageUrl}
            alt="Snoopy Flying Ace soaring above the clouds"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-85 brightness-95"
            onError={(e) => {
              // Fallback styling if image fails
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          {/* Measured gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
        </div>

        <div className="absolute bottom-4 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-red-600 text-white font-mono text-xs font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                SQUADRON NO. 1
              </span>
              <span className="text-amber-300 font-mono text-xs font-semibold">
                ★ {rank.title}
              </span>
            </div>
            <h1 className="font-comic text-3xl sm:text-4xl font-black text-amber-200 leading-tight">
              Snoopy's Flight Deck
            </h1>
            <p className="font-comic text-stone-300 text-sm hidden sm:block">
              "Here's the World War I Flying Ace reviewing his sortie records..."
            </p>
          </div>

          <button
            type="button"
            onClick={onTakeOff}
            className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-comic text-xl font-black px-6 py-2.5 rounded-xl comic-border-sm transition-transform hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <span>TAKE OFF [ SPACE ] 🛩️</span>
          </button>
        </div>
      </div>

      {/* Segmented Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-stone-200/80 rounded-xl comic-border-sm mb-6 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex-1 min-w-[110px] py-2 px-3 text-sm font-comic font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'OVERVIEW'
              ? 'bg-white text-stone-900 comic-border-sm shadow-sm'
              : 'text-stone-700 hover:text-stone-950'
          }`}
        >
          📈 Flight Stats
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('HANGAR')}
          className={`flex-1 min-w-[110px] py-2 px-3 text-sm font-comic font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'HANGAR'
              ? 'bg-white text-stone-900 comic-border-sm shadow-sm'
              : 'text-stone-700 hover:text-stone-950'
          }`}
        >
          🧣 Hangar Outfits
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('MEDALS')}
          className={`flex-1 min-w-[110px] py-2 px-3 text-sm font-comic font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'MEDALS'
              ? 'bg-white text-stone-900 comic-border-sm shadow-sm'
              : 'text-stone-700 hover:text-stone-950'
          }`}
        >
          🎖️ Aviator Medals
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('LOGBOOK')}
          className={`flex-1 min-w-[110px] py-2 px-3 text-sm font-comic font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'LOGBOOK'
              ? 'bg-white text-stone-900 comic-border-sm shadow-sm'
              : 'text-stone-700 hover:text-stone-950'
          }`}
        >
          📖 Sortie Log
        </button>
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Primary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white comic-paper-bg comic-border p-4 rounded-xl shadow-sm text-center">
              <div className="text-xs font-mono font-bold uppercase text-stone-500 mb-1">
                HIGH RECORD
              </div>
              <div className="font-mono text-3xl sm:text-4xl font-black text-amber-500 tabular-nums">
                {stats.highScore}
              </div>
              <div className="text-xs font-comic text-stone-600 mt-1">Personal Best</div>
            </div>

            <div className="bg-white comic-paper-bg comic-border p-4 rounded-xl shadow-sm text-center">
              <div className="text-xs font-mono font-bold uppercase text-stone-500 mb-1">
                TOTAL SORTIES
              </div>
              <div className="font-mono text-3xl sm:text-4xl font-black text-stone-900 tabular-nums">
                {stats.totalFlights}
              </div>
              <div className="text-xs font-comic text-stone-600 mt-1">Flights Flown</div>
            </div>

            <div className="bg-white comic-paper-bg comic-border p-4 rounded-xl shadow-sm text-center">
              <div className="text-xs font-mono font-bold uppercase text-stone-500 mb-1">
                DOG BISCUITS
              </div>
              <div className="font-mono text-3xl sm:text-4xl font-black text-amber-600 tabular-nums">
                {stats.totalBiscuits}
              </div>
              <div className="text-xs font-comic text-stone-600 mt-1">🦴 Collected</div>
            </div>

            <div className="bg-white comic-paper-bg comic-border p-4 rounded-xl shadow-sm text-center">
              <div className="text-xs font-mono font-bold uppercase text-stone-500 mb-1">
                WOODSTOCKS
              </div>
              <div className="font-mono text-3xl sm:text-4xl font-black text-yellow-500 tabular-nums">
                {stats.totalWoodstocks}
              </div>
              <div className="text-xs font-comic text-stone-600 mt-1">🐤 Rescued</div>
            </div>
          </div>

          {/* Secondary Telemetry row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#FFFDF7] comic-border-sm p-4 rounded-xl flex items-center gap-3">
              <span className="text-3xl" role="img" aria-label="clock">⏱️</span>
              <div>
                <div className="text-xs font-mono font-bold uppercase text-stone-500">Air Time</div>
                <div className="font-mono text-xl font-black text-stone-900 tabular-nums">
                  {totalMinutes}m {totalSeconds}s
                </div>
              </div>
            </div>

            <div className="bg-[#FFFDF7] comic-border-sm p-4 rounded-xl flex items-center gap-3">
              <span className="text-3xl" role="img" aria-label="distance">🗺️</span>
              <div>
                <div className="text-xs font-mono font-bold uppercase text-stone-500">Air Miles Covered</div>
                <div className="font-mono text-xl font-black text-stone-900 tabular-nums">
                  ~{totalDistanceMiles} mi
                </div>
              </div>
            </div>

            <div className="bg-[#FFFDF7] comic-border-sm p-4 rounded-xl flex items-center gap-3">
              <span className="text-3xl" role="img" aria-label="pilot">🛩️</span>
              <div>
                <div className="text-xs font-mono font-bold uppercase text-stone-500">Active Ace</div>
                <div className="font-comic text-xl font-bold text-stone-900 truncate">
                  {selectedSkin.name}
                </div>
              </div>
            </div>
          </div>

          {/* Sortie Weather / Flight Difficulty Picker */}
          <div className="bg-white comic-border p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-comic text-2xl font-black text-stone-900">
                  🌤️ Flight Weather Conditions
                </h3>
                <p className="font-comic text-stone-600 text-sm">
                  Choose the flight turbulence & clearance gap for your next sortie.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => onSelectDifficulty('EASY')}
                className={`p-3.5 rounded-xl text-left transition-all cursor-pointer ${
                  difficulty === 'EASY'
                    ? 'bg-emerald-100 comic-border ring-2 ring-emerald-500 shadow-sm'
                    : 'bg-stone-50 hover:bg-stone-100 comic-border-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-comic text-lg font-bold text-emerald-950">Pleasant Dog Day</span>
                  <span className="text-xl">☀️</span>
                </div>
                <p className="text-xs text-stone-600 font-comic leading-snug">
                  Gentle breeze, wider gaps between obstacles, forgiving pace. Great for practice.
                </p>
              </button>

              <button
                type="button"
                onClick={() => onSelectDifficulty('CLASSIC')}
                className={`p-3.5 rounded-xl text-left transition-all cursor-pointer ${
                  difficulty === 'CLASSIC'
                    ? 'bg-amber-100 comic-border ring-2 ring-amber-500 shadow-sm'
                    : 'bg-stone-50 hover:bg-stone-100 comic-border-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-comic text-lg font-bold text-amber-950">Flying Ace Sortie</span>
                  <span className="text-xl">🛩️</span>
                </div>
                <p className="text-xs text-stone-600 font-comic leading-snug">
                  Classic arcade Flappy Bird balance. Authentic French front dogfight challenge.
                </p>
              </button>

              <button
                type="button"
                onClick={() => onSelectDifficulty('ACE')}
                className={`p-3.5 rounded-xl text-left transition-all cursor-pointer ${
                  difficulty === 'ACE'
                    ? 'bg-red-100 comic-border ring-2 ring-red-500 shadow-sm'
                    : 'bg-stone-50 hover:bg-stone-100 comic-border-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-comic text-lg font-bold text-red-950">Red Baron Gale</span>
                  <span className="text-xl">⚡</span>
                </div>
                <p className="text-xs text-stone-600 font-comic leading-snug">
                  High-speed crosswinds, narrow clearances, intense reflexes required!
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HANGAR OUTFITS */}
      {activeTab === 'HANGAR' && (
        <div className="space-y-4">
          <div className="bg-amber-50 comic-border-sm p-4 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="font-comic text-2xl font-black text-stone-900">
                Snoopy's Hangar & Wardrobe
              </h3>
              <p className="font-comic text-stone-600 text-sm">
                Unlock new alter-egos and wingmen by achieving higher sortie scores!
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono uppercase text-stone-500">Unlocked</span>
              <div className="font-mono text-lg font-bold text-stone-900">
                {stats.unlockedSkins.length} / {SKINS.length}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SKINS.map((skin) => {
              const isUnlocked = stats.unlockedSkins.includes(skin.id);
              const isSelected = selectedSkin.id === skin.id;

              return (
                <div
                  key={skin.id}
                  className={`bg-white rounded-xl p-4 transition-all relative ${
                    isSelected
                      ? 'comic-border ring-3 ring-amber-400 bg-amber-50/50'
                      : isUnlocked
                      ? 'comic-border-sm hover:border-stone-900'
                      : 'border-2 border-dashed border-stone-300 bg-stone-100/70 opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-14 h-14 rounded-xl comic-border-sm flex items-center justify-center text-3xl shrink-0"
                      style={{ backgroundColor: isUnlocked ? skin.color : '#e2e8f0' }}
                    >
                      {isUnlocked ? skin.icon : '🔒'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-comic text-xl font-bold text-stone-900 truncate">
                          {skin.name}
                        </h4>
                        {isSelected && (
                          <span className="bg-amber-400 text-stone-950 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono font-semibold text-red-600 mb-1">
                        {skin.subtitle}
                      </div>
                      <p className="text-xs font-comic text-stone-600 leading-snug line-clamp-2">
                        {skin.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-stone-200 flex items-center justify-between">
                    <span className="text-xs font-mono text-stone-500">
                      {isUnlocked
                        ? 'Ready for flight'
                        : `Requires Score of ${skin.unlockScore} (Best: ${stats.highScore})`}
                    </span>

                    {isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => onSelectSkin(skin)}
                        disabled={isSelected}
                        className={`px-3 py-1 text-xs font-comic font-bold rounded-lg transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-stone-200 text-stone-600 cursor-default'
                            : 'bg-stone-900 hover:bg-stone-800 text-white shadow-sm'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select Outfit'}
                      </button>
                    ) : (
                      <span className="text-xs font-mono font-semibold text-stone-400">
                        🔒 Locked
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: AVIATOR MEDALS */}
      {activeTab === 'MEDALS' && (
        <div className="space-y-4">
          <div className="bg-amber-50 comic-border-sm p-4 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="font-comic text-2xl font-black text-stone-900">
                Official Peanuts Aviator Medals
              </h3>
              <p className="font-comic text-stone-600 text-sm">
                Honorary awards presented by the French Allied Squadron.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono uppercase text-stone-500">Earned</span>
              <div className="font-mono text-lg font-bold text-stone-900">
                {MEDALS.filter((m) => m.isUnlocked(stats)).length} / {MEDALS.length}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {MEDALS.map((medal) => {
              const earned = medal.isUnlocked(stats);

              return (
                <div
                  key={medal.id}
                  className={`p-3.5 rounded-xl transition-all ${
                    earned
                      ? 'bg-white comic-border-sm shadow-sm'
                      : 'bg-stone-100 border border-stone-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl shrink-0" role="img" aria-label={medal.title}>
                      {earned ? medal.icon : '🔒'}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-comic text-lg font-black text-stone-900">
                          {medal.title}
                        </h4>
                        {earned && (
                          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            AWARDED
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-comic text-stone-700 leading-snug mt-0.5">
                        {medal.description}
                      </p>
                      <p className="text-xs font-comic italic text-stone-500 mt-1.5">
                        {medal.quote}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: SORTIE LOGBOOK */}
      {activeTab === 'LOGBOOK' && (
        <div className="space-y-4">
          <div className="bg-white comic-border p-4 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="font-comic text-2xl font-black text-stone-900">
                Flight Telemetry & Logbook
              </h3>
              <p className="font-comic text-stone-600 text-sm">
                Chronicle of your last {stats.history.length} sorties over the French front.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="text-xs font-mono font-semibold text-stone-500 hover:text-red-600 transition-colors"
            >
              Reset Log
            </button>
          </div>

          {stats.history.length === 0 ? (
            <div className="bg-white comic-paper-bg comic-border-sm p-8 rounded-xl text-center">
              <span className="text-4xl block mb-2" role="img" aria-label="airplane">🛩️</span>
              <p className="font-comic text-lg font-bold text-stone-700">No sortie records yet!</p>
              <p className="font-comic text-sm text-stone-500 mt-1">
                Press Spacebar to launch your first flight and log your heroic aerial deeds!
              </p>
            </div>
          ) : (
            <div className="bg-white comic-border-sm rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-100 border-b border-stone-300 font-mono uppercase text-stone-600">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Pilot</th>
                      <th className="py-2.5 px-3 text-right">Score</th>
                      <th className="py-2.5 px-3 text-right">Biscuits</th>
                      <th className="py-2.5 px-3 text-right">Woodstocks</th>
                      <th className="py-2.5 px-3 text-right">Time</th>
                      <th className="py-2.5 px-3">Cause of Landing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 font-sans">
                    {stats.history.map((record) => (
                      <tr key={record.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="py-2 px-3 text-stone-500 font-mono whitespace-nowrap">{record.date}</td>
                        <td className="py-2 px-3 font-comic font-bold text-stone-900 whitespace-nowrap">
                          {SKINS.find((s) => s.id === record.skinId)?.name || 'Flying Ace'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-black text-stone-950 tabular-nums text-sm">
                          {record.score}
                        </td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums text-amber-700">
                          +{record.biscuits}
                        </td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums text-yellow-700">
                          +{record.woodstocks}
                        </td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums text-stone-600">
                          {record.durationSeconds}s
                        </td>
                        <td className="py-2 px-3 text-stone-600 font-comic text-xs truncate max-w-[200px]" title={record.cause}>
                          {record.cause}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white comic-border-lg rounded-2xl p-6 max-w-sm w-full text-center">
            <span className="text-3xl block mb-2" role="img" aria-label="warning">⚠️</span>
            <h4 className="font-comic text-2xl font-black text-stone-900 mb-2">
              Clear Flight Records?
            </h4>
            <p className="font-comic text-stone-600 text-sm mb-5">
              This will reset your high scores, medals, and logbook back to zero.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 px-4 rounded-xl comic-border-sm font-comic font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="flex-1 py-2 px-4 rounded-xl comic-border-sm font-comic font-bold text-white bg-red-600 hover:bg-red-700 cursor-pointer"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
