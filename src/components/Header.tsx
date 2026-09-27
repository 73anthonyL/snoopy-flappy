/**
 * Top Navigation Bar following the 3-Zone Top Bar Contract
 * [Brand wordmark] — [Clean Nav Links] — [Primary Actions]
 */

import React from 'react';
import { sound } from '../utils/audio';

interface HeaderProps {
  currentView: 'GAME' | 'DASHBOARD';
  onNavigate: (view: 'GAME' | 'DASHBOARD') => void;
  onOpenManual: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenManual,
  isMuted,
  onToggleSound,
  isMusicPlaying,
  onToggleMusic,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FBF8EF]/95 backdrop-blur-md border-b-2 border-stone-900 shadow-sm px-4 sm:px-8 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('GAME')}
          className="font-comic text-2xl sm:text-3xl font-black tracking-tight text-stone-900 hover:text-red-600 transition-colors whitespace-nowrap cursor-pointer text-left"
        >
          Snoopy's Flying Ace
        </button>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-comic font-bold text-stone-700">
          <button
            type="button"
            onClick={() => onNavigate('GAME')}
            className={`transition-colors hover:text-stone-950 cursor-pointer ${
              currentView === 'GAME' ? 'text-red-600 underline underline-offset-4 decoration-2' : ''
            }`}
          >
            Flight Arena
          </button>
          <button
            type="button"
            onClick={() => onNavigate('DASHBOARD')}
            className={`transition-colors hover:text-stone-950 cursor-pointer ${
              currentView === 'DASHBOARD'
                ? 'text-red-600 underline underline-offset-4 decoration-2'
                : ''
            }`}
          >
            Pilot Dashboard
          </button>
          <button
            type="button"
            onClick={onOpenManual}
            className="hover:text-stone-950 transition-colors cursor-pointer"
          >
            Flight Manual
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          {/* Jazz Music Toggle */}
          <button
            type="button"
            onClick={onToggleMusic}
            title={isMusicPlaying ? 'Pause jazz piano theme' : 'Play jazz piano theme'}
            className={`p-2 rounded-xl text-stone-800 transition-all comic-border-sm cursor-pointer ${
              isMusicPlaying ? 'bg-amber-300' : 'bg-white hover:bg-stone-100'
            }`}
          >
            <span className="text-base font-comic font-bold">
              {isMusicPlaying ? '🎷 Jazz On' : '🎷 Jazz Off'}
            </span>
          </button>

          {/* Sound FX Mute Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
            className="p-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 comic-border-sm transition-all cursor-pointer"
          >
            <span className="text-base">{isMuted ? '🔇' : '🔊'}</span>
          </button>

          {/* Arena switch button if in dashboard */}
          {currentView === 'DASHBOARD' ? (
            <button
              type="button"
              onClick={() => onNavigate('GAME')}
              className="bg-red-600 hover:bg-red-700 text-white font-comic text-base font-black px-4 py-1.5 rounded-xl comic-border-sm transition-transform hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer whitespace-nowrap"
            >
              Take Off [Space]
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('DASHBOARD')}
              className="bg-amber-300 hover:bg-amber-400 text-stone-900 font-comic text-base font-black px-3.5 py-1.5 rounded-xl comic-border-sm transition-transform hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer whitespace-nowrap"
            >
              Dashboard 📊
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
