/**
 * Local Storage and Pilot Stats management for Snoopy's Flying Ace
 */
import type { FlightRecord, Medal, PilotStats, Skin } from '../types';

const STORAGE_KEY = 'snoopy_flying_ace_stats_v1';

export const SKINS: Skin[] = [
  {
    id: 'FLYING_ACE',
    name: 'WWI Flying Ace',
    subtitle: 'Curse You, Red Baron!',
    description:
      'The iconic Red Doghouse fitted with imaginary machine guns, leather aviator cap, and a long fluttering red scarf.',
    unlockScore: 0,
    color: '#DC2626', // Peanuts Doghouse Red
    accentColor: '#FFFFFF',
    icon: '🛩️',
  },
  {
    id: 'JOE_COOL',
    name: 'Joe Cool',
    subtitle: 'Too Cool for Turbulence',
    description:
      'Dark round sunglasses and signature red campus sweater. Cool, calm, and effortlessly gliding over the clouds.',
    unlockScore: 0,
    color: '#B91C1C',
    accentColor: '#171717',
    icon: '🕶️',
  },
  {
    id: 'WOODSTOCK',
    name: 'Woodstock Solo',
    subtitle: 'Tiny Bird, Giant Courage',
    description:
      'Fly directly as Snoopy’s fearless yellow wingman! Rapid wing-beats and cheerful chirping trajectory.',
    unlockScore: 5,
    color: '#FACC15', // Woodstock Yellow
    accentColor: '#CA8A04',
    icon: '🐤',
  },
  {
    id: 'ASTRONAUT',
    name: 'Apollo Beagle',
    subtitle: 'First Beagle on the Moon',
    description:
      'Official NASA Apollo Snoopy space helmet with tinted bubble visor and doghouse launch thrusters.',
    unlockScore: 15,
    color: '#3B82F6',
    accentColor: '#F8FAFC',
    icon: '🚀',
  },
  {
    id: 'BEAGLE_SCOUT',
    name: 'Beagle Scout Leader',
    subtitle: 'Always Prepared',
    description:
      'Snoopy leading his troop through wilderness air currents with his official ranger hat and neckerchief.',
    unlockScore: 25,
    color: '#15803D',
    accentColor: '#FEF08A',
    icon: '🏕️',
  },
];

export const MEDALS: Medal[] = [
  {
    id: 'FIRST_FLIGHT',
    title: 'First Sortie',
    description: 'Take your first flight above the French countryside.',
    quote: '"Here\'s the World War I Flying Ace taking off on dawn patrol..."',
    icon: '🎖️',
    isUnlocked: (stats) => stats.totalFlights >= 1,
  },
  {
    id: 'BONE_COLLECTOR',
    title: 'Bone Appétit',
    description: 'Collect 10 or more delicious Dog Biscuits.',
    quote: '"My stomach clock just struck supper-time!"',
    icon: '🦴',
    isUnlocked: (stats) => stats.totalBiscuits >= 10,
  },
  {
    id: 'WOODSTOCK_SAVIOR',
    title: 'Wingman Rescuer',
    description: 'Safely rescue 5 Woodstock friends in mid-air.',
    quote: '"Woodstock says it\'s not easy flying upside down."',
    icon: '🐤',
    isUnlocked: (stats) => stats.totalWoodstocks >= 5,
  },
  {
    id: 'ACE_SORTIE',
    title: 'Junior Flying Ace',
    description: 'Score 10 or more points in a single flight.',
    quote: '"Take that, Red Baron!"',
    icon: '⭐',
    isUnlocked: (stats) => stats.highScore >= 10,
  },
  {
    id: 'RED_BARON_NEMESIS',
    title: "Baron's Nemesis",
    description: 'Reach a single flight score of 25 or more.',
    quote: '"I have him in my sights! Rat-tat-tat-tat-tat!"',
    icon: '🏆',
    isUnlocked: (stats) => stats.highScore >= 25,
  },
  {
    id: 'CENTURION_BEAGLE',
    title: 'Sky Legend',
    description: 'Achieve a legendary flight score of 40+.',
    quote: '"To know me is to love me... especially in a dogfight!"',
    icon: '👑',
    isUnlocked: (stats) => stats.highScore >= 40,
  },
  {
    id: 'ENDURANCE_PILOT',
    title: 'Root Beer Endurance',
    description: 'Accumulate more than 5 minutes total flight time.',
    quote: '"Bartender, another round of root beer!"',
    icon: '🍺',
    isUnlocked: (stats) => stats.totalFlightTimeSeconds >= 300,
  },
];

export const INITIAL_STATS: PilotStats = {
  highScore: 0,
  totalFlights: 0,
  totalScore: 0,
  totalBiscuits: 0,
  totalWoodstocks: 0,
  totalFlightTimeSeconds: 0,
  unlockedSkins: ['FLYING_ACE', 'JOE_COOL'],
  history: [],
};

export function loadPilotStats(): PilotStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATS;
    const parsed = JSON.parse(raw);
    return {
      highScore: parsed.highScore || 0,
      totalFlights: parsed.totalFlights || 0,
      totalScore: parsed.totalScore || 0,
      totalBiscuits: parsed.totalBiscuits || 0,
      totalWoodstocks: parsed.totalWoodstocks || 0,
      totalFlightTimeSeconds: parsed.totalFlightTimeSeconds || 0,
      unlockedSkins: Array.isArray(parsed.unlockedSkins)
        ? parsed.unlockedSkins
        : ['FLYING_ACE', 'JOE_COOL'],
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return INITIAL_STATS;
  }
}

export function saveFlightResult(
  score: number,
  biscuits: number,
  woodstocks: number,
  durationSeconds: number,
  difficulty: 'EASY' | 'CLASSIC' | 'ACE',
  skinId: string,
  cause: string,
): { updatedStats: PilotStats; isNewRecord: boolean; newlyUnlockedSkins: Skin[] } {
  const current = loadPilotStats();
  const isNewRecord = score > current.highScore;
  const newHighScore = Math.max(current.highScore, score);

  // Check skins that become unlocked
  const newlyUnlockedSkins: Skin[] = [];
  const currentUnlockedSet = new Set(current.unlockedSkins);

  SKINS.forEach((skin) => {
    if (!currentUnlockedSet.has(skin.id) && newHighScore >= skin.unlockScore) {
      currentUnlockedSet.add(skin.id);
      newlyUnlockedSkins.push(skin);
    }
  });

  const flightRecord: FlightRecord = {
    id: `fl_${Date.now()}`,
    date: new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    score,
    biscuits,
    woodstocks,
    durationSeconds,
    difficulty,
    skinId,
    cause,
  };

  const updatedStats: PilotStats = {
    highScore: newHighScore,
    totalFlights: current.totalFlights + 1,
    totalScore: current.totalScore + score,
    totalBiscuits: current.totalBiscuits + biscuits,
    totalWoodstocks: current.totalWoodstocks + woodstocks,
    totalFlightTimeSeconds: current.totalFlightTimeSeconds + durationSeconds,
    unlockedSkins: Array.from(currentUnlockedSet),
    history: [flightRecord, ...current.history].slice(0, 30), // Keep last 30 flights
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStats));
  } catch {
    // Ignore storage quota
  }

  return { updatedStats, isNewRecord, newlyUnlockedSkins };
}

export function resetPilotStats(): PilotStats {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
  return INITIAL_STATS;
}
