const genres = [
  "RPG", "Action", "Adventure", "Simulation", "Strategy", "Puzzle",
  "Horror", "Shooter", "Multiplayer", "Indie", "Casual", "Survival", "Card Game"
];

const tagsPool = [
  "Open World", "Story Rich", "Singleplayer", "Multiplayer", "Sci-Fi", 
  "Fantasy", "Casual", "Competitive", "Co-op", "Strategy", "Indie"
];

const featuresPool = [
  "Dynamic weather", "Branching storylines", "Procedurally generated levels",
  "Crafting system", "PvP arenas", "Online leaderboards", "Achievements & trophies",
  "Multiple endings", "Day/Night cycle", "Upgradeable characters"
];

const screenshotUrls = [
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=450&fit=crop",
  "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=450&fit=crop"
];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomArray<T>(arr: T[], minLen = 1, maxLen?: number) {
  const len = getRandomInt(minLen, maxLen ?? arr.length);
  return Array.from({ length: len }, () => arr[getRandomInt(0, arr.length - 1)]);
}

export interface Game {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  genre: string[];
  developer: string;
  publisher: string;
  releaseDate: string;
  price: number; // in APT tokens
  coverImage: string;
  screenshots: string[];
  rating: number; // out of 5
  reviewCount: number;
  features: string[];
  systemRequirements: {
    os: string;
    processor: string;
    memory: string;
    graphics: string;
    storage: string;
  };
  licenseDuration: number; // in seconds, 0 = perpetual
  transferable: boolean;
  tags: string[];
  videoUrl?: string;
}

export function generateRandomGame(
  game
): Game {

  const { game_id, title, description, metadataUri, seller, price } = game;

  return {
    id: game_id,
    title,
    description,
    shortDescription: `Short description for ${title}`,
    genre: getRandomArray(genres, 1, 3),
    developer: `Dev Studio ${getRandomInt(1, 100)}`,
    publisher: `Publisher ${getRandomInt(1, 100)}`,
    releaseDate: `2024-${getRandomInt(1, 12).toString().padStart(2, "0")}-${getRandomInt(1, 28).toString().padStart(2, "0")}`,
    price: price / 1_000_000, // Random price between 0 and 10
    // coverImage: screenshotUrls[getRandomInt(0, screenshotUrls.length - 1)],
    // screenshots: getRandomArray(screenshotUrls, 2, 3),
    coverImage: [metadataUri],
    screenshots: [metadataUri],
    rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // Random rating 3.0 - 5.0
    reviewCount: getRandomInt(100, 20000),
    features: getRandomArray(featuresPool, 2, 5),
    systemRequirements: {
      os: `Windows ${getRandomInt(7, 11)} 64-bit`,
      processor: `Intel Core i${getRandomInt(3, 9)} or AMD Ryzen ${getRandomInt(3, 9)}`,
      memory: `${getRandomInt(4, 16)} GB RAM`,
      graphics: `NVIDIA GeForce GTX ${getRandomInt(560, 2080)} or AMD Radeon RX ${getRandomInt(560, 5700)}`,
      storage: `${getRandomInt(5, 100)} GB available space`
    },
    licenseDuration: getRandomInt(0, 60 * 60 * 24 * 365), // Random 0 (perpetual) to 1 year in seconds
    transferable: Math.random() < 0.8, // 80% chance transferable
    tags: getRandomArray(tagsPool, 2, 5),
    seller: seller,
  };
}
