/**
 * Proper End Screen / Flight Debrief for Snoopy's Flying Ace
 * Implements instant spacebar replay, comic speech bubbles, detailed flight stats,
 * unlocked skin banners, and debrief sharing.
 */

import React, { useEffect, useState } from 'react';
import { Skin } from '../types';
import { sound } from '../utils/audio';
import { SnoopyMoodReaction } from './SnoopyMoodReaction';

interface EndScreenProps {
  score: number;
  highScore: number;
  isNewRecord: boolean;
  biscuits: number;
  woodstocks: number;
  durationSeconds: number;
  cause: string;
  skin: Skin;
  newlyUnlockedSkins: Skin[];
  onFlyAgain: () => void;
  onOpenDashboard: () => void;
}

export const EndScreen: React.FC<EndScreenProps> = ({
  score,
  highScore,
  isNewRecord,
  biscuits,
  woodstocks,
  durationSeconds,
  cause,
  skin,
  newlyUnlockedSkins,
  onFlyAgain,
  onOpenDashboard,
}) => {
  const [copied, setCopied] = useState(false);

  // Play fanfare if new record
  useEffect(() => {
    if (isNewRecord && score > 0) {
      sound.playFanfare();
    }
  }, [isNewRecord, score]);

  // Spacebar to restart flight immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        onFlyAgain();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onFlyAgain]);

  // Pick comic quote based on performance
  const getSnoopyQuote = () => {
    if (isNewRecord && score >= 10) {
      return {
        quote:
          'HAPPY DANCE! The World War I Flying Ace has triumphed! Bring out the root beer and French pastries!',
        reaction: '🕺 Happy Dance Time',
      };
    }
    if (cause.includes('Kite-Eating Tree')) {
      return {
        quote:
          "Bleah! That kite-eating tree doesn't just eat Charlie Brown's kites—it has an appetite for Sopwith Camels!",
        reaction: '🌳 Tree Trouble',
      };
    }
    if (cause.includes('Lucy')) {
      return {
        quote:
          "Lucy: 'That\'ll be five cents for psychiatric aviation advice! In advance!' Good grief.",
        reaction: '💸 5 Cents Please',
      };
    }
    if (cause.includes('Red Baron')) {
      return {
        quote:
          'CURSE YOU, RED BARON! My Sopwith Camel took heavy flak, but I shall return to fight another day!',
        reaction: '🛩️ Curse You Red Baron!',
      };
    }
    return {
      quote:
        "Here's the World War I Flying Ace nursing a mug of root beer at a quiet French bistro...",
      reaction: '🍺 Root Beer Break',
    };
  };

  const debrief = getSnoopyQuote();

  const handleCopyReport = async () => {
    const text =
      `🛩️ SNOOPY'S FLYING ACE MISSION REPORT 🛩️\n` +
      `Pilot: ${skin.name}\n` +
      `Sortie Score: ${score} pts (Best: ${highScore})\n` +
      `🦴 Dog Biscuits: ${biscuits} | 🐤 Woodstocks Rescued: ${woodstocks}\n` +
      `Flight Time: ${durationSeconds}s | Cause: ${cause}\n` +
      `"Curse you, Red Baron!"`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#FFFDF7] comic-paper-bg comic-border-lg rounded-2xl w-full max-w-lg p-6 relative shadow-2xl my-auto text-stone-900">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-stone-900 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="doghouse">
              🐶
            </span>
            <div>
              <div className="text-xs uppercase font-mono font-bold tracking-wider text-red-600">
                OFFICIAL FLIGHT LOGBOOK
              </div>
              <h3 className="font-comic text-2xl font-black text-stone-900 leading-none">
                Sortie Debriefing
              </h3>
            </div>
          </div>
          <div className="bg-stone-900 text-amber-300 font-comic px-3 py-1 rounded-lg text-sm font-bold">
            {debrief.reaction}
          </div>
        </div>

        {/* New Record Banner if applicable */}
        {isNewRecord && score > 0 && (
          <div className="bg-amber-300 comic-border-sm px-4 py-2 rounded-xl mb-3 text-center transform -rotate-1 shadow-sm">
            <span className="font-comic text-xl font-black text-stone-950 tracking-wide">
              ⭐ NEW PERSONAL BEST RECORD! ⭐
            </span>
          </div>
        )}

        {/* Snoopy Animated Cheering or Dejected Reaction based on score */}
        <div className="bg-white/80 comic-border-sm rounded-xl p-2.5 mb-3 shadow-sm">
          <SnoopyMoodReaction score={score} highScore={highScore} isNewRecord={isNewRecord} />
        </div>

        {/* Comic Speech Bubble */}
        <div className="relative bg-amber-50 comic-border-sm p-3 rounded-xl mb-4 shadow-inner">
          <div className="font-comic text-stone-800 text-sm sm:text-base italic leading-relaxed">
            "{debrief.quote}"
          </div>
          <div className="mt-1 text-xs font-mono font-semibold text-stone-500">
            — Snoopy, The World War I Flying Ace
          </div>
        </div>

        {/* Scoreboard Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Main Flight Score */}
          <div className="bg-white comic-border-sm p-4 rounded-xl text-center shadow-sm">
            <div className="text-xs font-mono font-bold uppercase text-stone-500 mb-0.5">
              SORTIE SCORE
            </div>
            <div className="font-mono text-4xl font-black text-stone-950 tabular-nums">{score}</div>
            <div className="text-xs font-comic text-stone-600 mt-1">
              Personal Best: <strong className="font-mono">{highScore}</strong>
            </div>
          </div>

          {/* Flight Duration & Air Distance */}
          <div className="bg-white comic-border-sm p-4 rounded-xl text-center shadow-sm">
            <div className="text-xs font-mono font-bold uppercase text-stone-500 mb-0.5">
              AIR TIME
            </div>
            <div className="font-mono text-4xl font-black text-stone-950 tabular-nums">
              {durationSeconds}
              <span className="text-xl font-normal text-stone-500">s</span>
            </div>
            <div className="text-xs font-comic text-stone-600 mt-1">
              Est. Distance: <strong className="font-mono">{score * 75 + 120} yds</strong>
            </div>
          </div>

          {/* Dog Biscuits Collected */}
          <div className="bg-amber-100 comic-border-sm p-3 rounded-xl flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label="dog biscuit">
              🦴
            </span>
            <div>
              <div className="text-xs font-mono font-bold uppercase text-amber-900">
                DOG BISCUITS
              </div>
              <div className="font-mono text-2xl font-black text-amber-950 tabular-nums">
                +{biscuits}{' '}
                <span className="text-xs font-bold text-amber-800">(+{biscuits * 2} pts)</span>
              </div>
            </div>
          </div>

          {/* Woodstock Rescues */}
          <div className="bg-yellow-100 comic-border-sm p-3 rounded-xl flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label="woodstock">
              🐤
            </span>
            <div>
              <div className="text-xs font-mono font-bold uppercase text-yellow-900">
                WOODSTOCK RESCUED
              </div>
              <div className="font-mono text-2xl font-black text-yellow-950 tabular-nums">
                +{woodstocks}{' '}
                <span className="text-xs font-bold text-yellow-800">(+{woodstocks * 5} pts)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cause of Landing / Incident */}
        <div className="bg-red-50 border-2 border-red-200 p-2.5 rounded-lg mb-5 flex items-start gap-2.5">
          <span className="text-xl shrink-0" role="img" aria-label="incident">
            ⚠️
          </span>
          <div>
            <div className="text-xs font-mono font-bold uppercase text-red-700">
              Flight Termination Notice
            </div>
            <div className="font-comic text-sm font-bold text-red-950 leading-tight">{cause}</div>
          </div>
        </div>

        {/* Unlocked Skins Alert (if any unlocked this run) */}
        {newlyUnlockedSkins.length > 0 && (
          <div className="bg-emerald-100 comic-border-sm p-3 rounded-xl mb-5 text-center">
            <div className="text-xs font-mono font-bold text-emerald-800 uppercase">
              🎉 NEW OUTFIT UNLOCKED IN HANGAR!
            </div>
            <div className="font-comic text-lg font-black text-emerald-950 mt-0.5">
              {newlyUnlockedSkins.map((s) => `${s.icon} ${s.name}`).join(', ')}
            </div>
          </div>
        )}

        {/* Interactive Action Controls */}
        <div className="space-y-2.5">
          {/* Primary Replay Button (Emphasizes Spacebar!) */}
          <button
            type="button"
            onClick={onFlyAgain}
            className="w-full bg-red-600 hover:bg-red-700 text-white comic-border font-comic text-2xl font-black py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-transform hover:-translate-y-0.5 active:translate-y-0.5 shadow-md cursor-pointer"
          >
            <kbd className="px-2 py-1 bg-stone-900 text-white font-mono text-xs rounded border border-white/20">
              SPACEBAR
            </kbd>
            <span>LAUNCH NEXT SORTIE</span>
          </button>

          {/* Secondary Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onOpenDashboard}
              className="bg-white hover:bg-stone-100 text-stone-900 comic-border-sm font-comic text-base font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>📊</span>
              <span>Pilot Dashboard</span>
            </button>

            <button
              type="button"
              onClick={handleCopyReport}
              className="bg-amber-200 hover:bg-amber-300 text-stone-900 comic-border-sm font-comic text-base font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>{copied ? '✅' : '📋'}</span>
              <span>{copied ? 'Debrief Copied!' : 'Copy Report'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
