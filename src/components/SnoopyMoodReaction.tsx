/**
 * Snoopy Mood Reaction Component
 * Renders Charles M. Schulz comic illustration of Snoopy either:
 * - CHEERING (Happy Dance, paws up, open grin, confetti, music notes, happy Woodstock)
 * - DEJECTED (Limp over red doghouse, drooping ears, sad expression, raincloud / Bleah!)
 * Based on whether the player achieved a high score or a low score.
 */

import React from 'react';

interface SnoopyMoodReactionProps {
  score: number;
  highScore: number;
  isNewRecord: boolean;
}

export const SnoopyMoodReaction: React.FC<SnoopyMoodReactionProps> = ({
  score,
  isNewRecord,
}) => {
  // Cheering threshold: score >= 8 or a new personal record (when score > 0)
  const isCheering = isNewRecord || score >= 8;

  return (
    <div className="w-full flex flex-col items-center justify-center my-2">
      {isCheering ? (
        /* ================= CHEERING SNOOPY (HAPPY DANCE) ================= */
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-40">
            <svg
              viewBox="0 0 200 160"
              className="w-full h-full drop-shadow-md overflow-visible"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Confetti and action lines */}
              <g className="animate-pulse">
                <circle cx="25" cy="30" r="3.5" fill="#EF4444" />
                <circle cx="175" cy="35" r="4" fill="#F59E0B" />
                <circle cx="40" cy="70" r="3" fill="#3B82F6" />
                <circle cx="160" cy="80" r="3.5" fill="#10B981" />
                <rect x="30" y="45" width="6" height="4" fill="#EC4899" transform="rotate(25 30 45)" />
                <rect x="165" y="55" width="5" height="5" fill="#8B5CF6" transform="rotate(-15 165 55)" />

                {/* Musical Notes */}
                <path
                  d="M 145 20 Q 155 16 160 22 L 160 38 A 4 3 0 1 1 152 38 L 152 24 Z"
                  fill="#1C1917"
                />
                <path
                  d="M 35 22 Q 45 18 50 24 L 50 40 A 4 3 0 1 1 42 40 L 42 26 Z"
                  fill="#1C1917"
                />
              </g>

              {/* Movement / Action lines below feet */}
              <path
                d="M 65 142 Q 100 148 135 142 M 75 147 Q 100 152 125 147"
                stroke="#1C1917"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Cheering Snoopy Body */}
              <g transform="translate(10, 0)">
                {/* Wagging Black Tail */}
                <path
                  d="M 52 108 Q 40 102 36 90"
                  stroke="#1C1917"
                  strokeWidth="5"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Legs in Mid-Air Happy Dance Kick */}
                {/* Left Leg */}
                <path
                  d="M 72 118 L 62 135 L 54 133"
                  stroke="#1C1917"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                />
                <ellipse cx="54" cy="133" rx="5" ry="3" fill="#FFFFFF" stroke="#1C1917" strokeWidth="2.5" />

                {/* Right Leg */}
                <path
                  d="M 96 118 L 108 135 L 118 133"
                  stroke="#1C1917"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                />
                <ellipse cx="118" cy="133" rx="5" ry="3" fill="#FFFFFF" stroke="#1C1917" strokeWidth="2.5" />

                {/* Body (Plump Beagle Belly) */}
                <ellipse
                  cx="84"
                  cy="98"
                  rx="22"
                  ry="24"
                  fill="#FFFFFF"
                  stroke="#1C1917"
                  strokeWidth="3.5"
                />
                {/* Black spot on back */}
                <ellipse cx="68" cy="94" rx="6" ry="10" fill="#1C1917" transform="rotate(-15 68 94)" />

                {/* Left Arm Raised High in Celebration */}
                <path
                  d="M 68 85 Q 50 68 45 52"
                  stroke="#1C1917"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="44" cy="50" r="5" fill="#FFFFFF" stroke="#1C1917" strokeWidth="2.5" />

                {/* Right Arm Raised High */}
                <path
                  d="M 98 85 Q 116 68 122 52"
                  stroke="#1C1917"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="123" cy="50" r="5" fill="#FFFFFF" stroke="#1C1917" strokeWidth="2.5" />

                {/* Red Collar */}
                <path
                  d="M 72 74 Q 85 78 98 74"
                  stroke="#DC2626"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Snoopy Head tilted back laughing */}
                <ellipse
                  cx="88"
                  cy="54"
                  rx="18"
                  ry="16"
                  fill="#FFFFFF"
                  stroke="#1C1917"
                  strokeWidth="3.5"
                />
                {/* Snout pointing upward */}
                <ellipse
                  cx="99"
                  cy="46"
                  rx="16"
                  ry="12"
                  fill="#FFFFFF"
                  stroke="#1C1917"
                  strokeWidth="3.5"
                  transform="rotate(-12 99 46)"
                />
                {/* Black Nose */}
                <ellipse cx="114" cy="40" rx="5" ry="4" fill="#1C1917" />

                {/* Flying Ear in Wind (Joyful bounce) */}
                <path
                  d="M 72 50 Q 56 42 50 28 Q 58 20 68 34 Z"
                  fill="#1C1917"
                  stroke="#1C1917"
                  strokeWidth="2"
                />

                {/* Laughing Open Mouth */}
                <path
                  d="M 94 56 Q 102 65 110 56 Z"
                  fill="#DC2626"
                  stroke="#1C1917"
                  strokeWidth="2.5"
                />

                {/* Happy Eye Slits (Squinting with joy) */}
                <path
                  d="M 88 43 Q 92 40 96 44"
                  stroke="#1C1917"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>

              {/* Woodstock Cheering next to Snoopy! */}
              <g transform="translate(138, 55)">
                {/* Woodstock Body */}
                <ellipse cx="16" cy="18" rx="8" ry="6" fill="#FACC15" stroke="#1C1917" strokeWidth="2" />
                <circle cx="21" cy="12" r="5" fill="#FACC15" stroke="#1C1917" strokeWidth="2" />
                {/* Spiky hair */}
                <path d="M 18 8 L 17 2 M 20 7 L 21 1 M 23 8 L 25 3" stroke="#1C1917" strokeWidth="1.8" />
                {/* Beak */}
                <path d="M 25 11 L 30 13 L 25 14 Z" fill="#F59E0B" stroke="#1C1917" strokeWidth="1.5" />
                {/* Eye */}
                <circle cx="22" cy="11" r="1" fill="#1C1917" />
                {/* Raised Wings */}
                <path d="M 14 16 L 8 8 L 12 18" stroke="#1C1917" strokeWidth="2" fill="#FACC15" />
                {/* Exclamation marks */}
                <text x="32" y="10" fontSize="12" fontFamily="Patrick Hand, cursive" fontWeight="bold" fill="#F59E0B">
                  !
                </text>
              </g>
            </svg>
          </div>

          <div className="text-center mt-1">
            <span className="inline-block bg-amber-400 text-stone-950 font-comic font-black text-sm px-3 py-0.5 rounded-full comic-border-sm -rotate-1">
              🎉 HAPPY DANCE! SNOOPY IS CHEERING! 🎉
            </span>
            <p className="text-xs font-comic text-stone-600 mt-1">
              "Victory over the Red Baron! Bring out the root beer!"
            </p>
          </div>
        </div>
      ) : (
        /* ================= DEJECTED SNOOPY (BLEAH! / DROOPING) ================= */
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-36">
            <svg
              viewBox="0 0 200 150"
              className="w-full h-full drop-shadow-md overflow-visible"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Melancholy Rain / Sweat drops */}
              <g>
                <path
                  d="M 45 25 Q 43 32 45 35 Q 47 32 45 25 Z"
                  fill="#60A5FA"
                  stroke="#1C1917"
                  strokeWidth="1.2"
                />
                <path
                  d="M 155 30 Q 153 37 155 40 Q 157 37 155 30 Z"
                  fill="#60A5FA"
                  stroke="#1C1917"
                  strokeWidth="1.2"
                />
                <path
                  d="M 168 50 Q 166 56 168 59 Q 170 56 168 50 Z"
                  fill="#60A5FA"
                  stroke="#1C1917"
                  strokeWidth="1.2"
                />
              </g>

              {/* Red Doghouse Roof Peak */}
              <polygon
                points="20,135 100,75 180,135 180,145 20,145"
                fill="#DC2626"
                stroke="#1C1917"
                strokeWidth="3.5"
              />
              <line x1="100" y1="75" x2="100" y2="145" stroke="#991B1B" strokeWidth="2.5" />

              {/* Snoopy Lying Completely Flat & Dejected Across the Roof Peak */}
              <g transform="translate(0, 0)">
                {/* Back paw dangling limply down left roof */}
                <path
                  d="M 46 86 L 40 105"
                  stroke="#1C1917"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <ellipse cx="39" cy="106" rx="4.5" ry="3" fill="#FFFFFF" stroke="#1C1917" strokeWidth="2.5" />

                {/* Snoopy Limp Torso along roof */}
                <ellipse
                  cx="95"
                  cy="72"
                  rx="34"
                  ry="12"
                  fill="#FFFFFF"
                  stroke="#1C1917"
                  strokeWidth="3.5"
                />
                {/* Spot on back */}
                <ellipse cx="80" cy="68" rx="8" ry="5" fill="#1C1917" />

                {/* Limp Front Paw dangling down right roof */}
                <path
                  d="M 132 80 L 140 102"
                  stroke="#1C1917"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <ellipse cx="141" cy="103" rx="4.5" ry="3" fill="#FFFFFF" stroke="#1C1917" strokeWidth="2.5" />

                {/* Red Collar */}
                <rect x="118" y="65" width="4" height="12" fill="#B91C1C" stroke="#1C1917" strokeWidth="1" />

                {/* Dejected Head resting flat on the roof */}
                <ellipse
                  cx="140"
                  cy="68"
                  rx="16"
                  ry="10"
                  fill="#FFFFFF"
                  stroke="#1C1917"
                  strokeWidth="3"
                />
                {/* Drooping Snout */}
                <ellipse
                  cx="156"
                  cy="72"
                  rx="12"
                  ry="7"
                  fill="#FFFFFF"
                  stroke="#1C1917"
                  strokeWidth="3"
                />
                {/* Black Nose resting down */}
                <circle cx="167" cy="74" r="3.5" fill="#1C1917" />

                {/* Long Drooping Black Ear hanging down sadly */}
                <path
                  d="M 132 68 C 130 85 125 98 128 108 C 134 108 138 95 137 72 Z"
                  fill="#1C1917"
                  stroke="#1C1917"
                  strokeWidth="2"
                />

                {/* Sad Closed/Slanted Eye */}
                <line x1="145" y1="65" x2="152" y2="67" stroke="#1C1917" strokeWidth="2.5" strokeLinecap="round" />

                {/* Disappointed Frown */}
                <path
                  d="M 154 77 Q 159 75 163 78"
                  stroke="#1C1917"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>

              {/* Thought Bubble with "BLEAH!" or "GOOD GRIEF!" */}
              <g transform="translate(68, 12)">
                <ellipse cx="28" cy="16" rx="26" ry="14" fill="#FFFFFF" stroke="#1C1917" strokeWidth="2.5" />
                <circle cx="18" cy="33" r="3" fill="#FFFFFF" stroke="#1C1917" strokeWidth="2" />
                <circle cx="24" cy="40" r="1.8" fill="#FFFFFF" stroke="#1C1917" strokeWidth="1.5" />
                <text
                  x="28"
                  y="20"
                  textAnchor="middle"
                  fontFamily="Patrick Hand, cursive"
                  fontWeight="900"
                  fontSize="13"
                  fill="#DC2626"
                >
                  BLEAH!
                </text>
              </g>
            </svg>
          </div>

          <div className="text-center mt-1">
            <span className="inline-block bg-stone-200 text-stone-800 font-comic font-black text-sm px-3 py-0.5 rounded-full comic-border-sm rotate-1">
              😔 DEJECTED BEAGLE... GOOD GRIEF!
            </span>
            <p className="text-xs font-comic text-stone-500 mt-1">
              "Curse you, Red Baron! Grounded until supper time..."
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
