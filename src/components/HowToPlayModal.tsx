/**
 * Flight Manual & Comic Rules Modal
 */

import React from 'react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#FFFDF7] comic-paper-bg comic-border-lg rounded-2xl w-full max-w-lg p-6 relative shadow-2xl my-auto text-stone-900">
        <div className="flex items-center justify-between border-b-2 border-stone-900 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="manual">📖</span>
            <div>
              <div className="text-xs uppercase font-mono font-bold tracking-wider text-red-600">
                OFFICIAL SQUADRON HANDBOOK
              </div>
              <h3 className="font-comic text-2xl font-black text-stone-900 leading-none">
                Snoopy's Flight Manual
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 comic-border-sm flex items-center justify-center font-bold text-stone-700 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Controls Box */}
          <div className="bg-amber-100 comic-border-sm p-4 rounded-xl">
            <h4 className="font-comic text-lg font-black text-amber-950 mb-1">
              ⌨️ Computer Flight Controls
            </h4>
            <div className="flex items-center gap-3 mt-2">
              <kbd className="px-3 py-1.5 bg-stone-900 text-white font-mono text-sm font-bold rounded-lg shadow-inner">
                SPACEBAR
              </kbd>
              <span className="font-comic text-stone-800 text-sm">
                Press to flap Snoopy's doghouse wings and gain altitude. Release to glide downward.
              </span>
            </div>
            <div className="text-xs font-comic text-stone-600 mt-2">
              * Left mouse click or screen tap can also be used alternatively.
            </div>
          </div>

          {/* Lore & Collectibles */}
          <div className="space-y-3">
            <h4 className="font-comic text-lg font-black text-stone-900">
              🌤️ Collectibles & Aerial Hazards
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white comic-border-sm p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🦴</span>
                  <strong className="font-comic text-sm text-amber-950">Dog Biscuits (+2 pts)</strong>
                </div>
                <p className="font-comic text-stone-600">
                  Crunchy bone snacks floating in the clouds to sustain Snoopy's energy on dawn patrol.
                </p>
              </div>

              <div className="bg-white comic-border-sm p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🐤</span>
                  <strong className="font-comic text-sm text-yellow-950">Woodstock (+5 pts)</strong>
                </div>
                <p className="font-comic text-stone-600">
                  Rescue Woodstock! He will fly alongside your Sopwith Camel as your loyal wingman companion.
                </p>
              </div>

              <div className="bg-white comic-border-sm p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🌳</span>
                  <strong className="font-comic text-sm text-emerald-950">Kite-Eating Tree</strong>
                </div>
                <p className="font-comic text-stone-600">
                  Charlie Brown's infamous nemesis tree! Don't let your doghouse get tangled in the kite strings.
                </p>
              </div>

              <div className="bg-white comic-border-sm p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🛩️</span>
                  <strong className="font-comic text-sm text-red-950">The Red Baron</strong>
                </div>
                <p className="font-comic text-stone-600">
                  Fokker Dr.I spires and aerial traps. Keep your goggles clean and dodge the flak!
                </p>
              </div>
            </div>
          </div>

          {/* Charles Schulz Quote */}
          <div className="bg-stone-100 p-3 rounded-xl border border-stone-300 text-center italic font-comic text-stone-700 text-sm">
            "Here's the World War I Flying Ace zooming through the sky looking for the Red Baron... Rat-tat-tat-tat-tat!"
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-comic text-xl font-bold py-2.5 rounded-xl comic-border-sm transition-colors cursor-pointer"
          >
            Understood, Take Off!
          </button>
        </div>
      </div>
    </div>
  );
};
