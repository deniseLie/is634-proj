// data/mockGames.ts

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


export const mockGames: Game[] = [
  {
    id: "cyber-nexus-2077",
    title: "Cyber Nexus 2077",
    description: "Dive into a sprawling cyberpunk metropolis where your choices shape the future. As a mercenary navigating the dark underbelly of Night City, you'll encounter corporate conspiracies, street gangs, and revolutionary AI. Every decision has consequences in this immersive open-world RPG.",
    shortDescription: "Open-world cyberpunk RPG with branching storylines",
    genre: ["RPG", "Action", "Open World"],
    developer: "NeonWave Studios",
    publisher: "Digital Frontier",
    releaseDate: "2024-03-15",
    price: 5.99,
    coverImage: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=450&fit=crop",
    screenshots: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=450&fit=crop"
    ],
    rating: 4.7,
    reviewCount: 15420,
    features: [
      "Massive open world to explore",
      "Deep character customization",
      "Branching narrative paths",
      "Real-time combat system",
      "Dynamic weather and day/night cycle"
    ],
    systemRequirements: {
      os: "Windows 10/11 64-bit",
      processor: "Intel Core i7-6700 or AMD Ryzen 5 1600",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce GTX 1060 6GB or AMD Radeon RX 580 8GB",
      storage: "70 GB available space"
    },
    licenseDuration: 0,
    transferable: true,
    tags: ["Cyberpunk", "Story Rich", "Open World", "Multiplayer", "Mature"]
  },
  {
    id: "stellar-odyssey",
    title: "Stellar Odyssey",
    description: "Command your own starship and explore an infinite procedurally generated universe. Trade with alien civilizations, engage in space combat, mine asteroids, and uncover the mysteries of ancient cosmic entities. Your journey among the stars begins here.",
    shortDescription: "Procedurally generated space exploration and trading simulator",
    genre: ["Simulation", "Space", "Strategy"],
    developer: "Cosmic Games",
    publisher: "Galaxy Interactive",
    releaseDate: "2024-06-22",
    price: 4.49,
    coverImage: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&h=450&fit=crop",
    screenshots: [
      "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=450&fit=crop"
    ],
    rating: 4.5,
    reviewCount: 8934,
    features: [
      "Infinite procedural universe",
      "Base building and fleet management",
      "Trade and economy simulation",
      "Space combat and piracy",
      "Alien diplomacy system"
    ],
    systemRequirements: {
      os: "Windows 10 64-bit",
      processor: "Intel Core i5-4590 or AMD FX 8350",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 970 or AMD Radeon R9 290",
      storage: "15 GB available space"
    },
    licenseDuration: 0,
    transferable: true,
    tags: ["Space", "Exploration", "Sandbox", "Sci-Fi", "Trading"]
  },
  {
    id: "fantasy-realms-legends",
    title: "Fantasy Realms: Legends",
    description: "Embark on an epic quest through enchanted forests, treacherous mountains, and ancient dungeons. Form a party of heroes, each with unique abilities, and face mythical creatures in turn-based tactical combat. The fate of the realm rests in your hands.",
    shortDescription: "Turn-based tactical RPG set in a high fantasy world",
    genre: ["RPG", "Strategy", "Fantasy"],
    developer: "Mystic Forge Games",
    publisher: "Legend Studios",
    releaseDate: "2024-01-30",
    price: 3.99,
    coverImage: "https://plus.unsplash.com/premium_photo-1682308191763-2813d4a2e746?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1706",
    screenshots: [
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=800&h=450&fit=crop"
    ],
    rating: 4.8,
    reviewCount: 12367,
    features: [
      "Strategic turn-based combat",
      "6 unique character classes",
      "100+ hour campaign",
      "Rich lore and world-building",
      "Crafting and enchanting system"
    ],
    systemRequirements: {
      os: "Windows 10 64-bit",
      processor: "Intel Core i5-2400 or AMD FX-6300",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 760 or AMD Radeon R9 270X",
      storage: "25 GB available space"
    },
    licenseDuration: 0,
    transferable: true,
    tags: ["Fantasy", "Turn-Based", "Party-Based", "Story Rich", "Medieval"]
  },
  {
    id: "racing-legends-pro",
    title: "Racing Legends Pro",
    description: "Experience the ultimate racing simulation with photorealistic graphics and physics. Choose from over 200 licensed vehicles and race on famous tracks around the world. Master different weather conditions and prove you're the fastest driver on the planet.",
    shortDescription: "Realistic racing simulator with licensed cars and tracks",
    genre: ["Racing", "Simulation", "Sports"],
    developer: "Apex Racing Studios",
    publisher: "Velocity Games",
    releaseDate: "2024-08-10",
    price: 6.99,
    coverImage: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=450&fit=crop",
    screenshots: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=450&fit=crop"
    ],
    rating: 4.6,
    reviewCount: 9876,
    features: [
      "200+ licensed vehicles",
      "30 real-world circuits",
      "Dynamic weather system",
      "Online multiplayer championships",
      "Career mode and custom races"
    ],
    systemRequirements: {
      os: "Windows 10/11 64-bit",
      processor: "Intel Core i5-9600K or AMD Ryzen 5 3600",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce RTX 2060 or AMD Radeon RX 5700",
      storage: "100 GB available space"
    },
    licenseDuration: 0,
    transferable: true,
    tags: ["Racing", "Simulation", "Realistic", "Multiplayer", "Sports"]
  },
  {
    id: "horror-mansion-escape",
    title: "Horror Mansion: Escape",
    description: "You wake up in an abandoned Victorian mansion with no memory of how you got there. Explore dark corridors, solve intricate puzzles, and uncover the mansion's horrifying secrets. But beware—you're not alone, and something is hunting you in the darkness.",
    shortDescription: "First-person psychological horror with puzzle elements",
    genre: ["Horror", "Puzzle", "Adventure"],
    developer: "Dark Room Studios",
    publisher: "Nightmare Interactive",
    releaseDate: "2024-10-31",
    price: 2.99,
    coverImage: "https://images.unsplash.com/photo-1610227327744-e37bea35e76a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1004",
    screenshots: [
      "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1571297905916-d37fed0c2a3d?w=800&h=450&fit=crop"
    ],
    rating: 4.4,
    reviewCount: 5432,
    features: [
      "Atmospheric horror experience",
      "Environmental storytelling",
      "Complex puzzle mechanics",
      "Multiple endings",
      "Immersive sound design"
    ],
    systemRequirements: {
      os: "Windows 10 64-bit",
      processor: "Intel Core i5-4460 or AMD FX-6300",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 960 or AMD Radeon R9 280",
      storage: "20 GB available space"
    },
    licenseDuration: 2592000,
    transferable: false,
    tags: ["Horror", "Atmospheric", "First-Person", "Puzzle", "Singleplayer"]
  },
  {
    id: "battle-arena-champions",
    title: "Battle Arena: Champions",
    description: "Enter the competitive arena where strategy meets skill. Choose from 50+ unique champions, each with distinct abilities and playstyles. Team up with friends in 5v5 battles, climb the ranked ladder, and become a legend in this fast-paced MOBA.",
    shortDescription: "Competitive 5v5 MOBA with unique champions",
    genre: ["MOBA", "Strategy", "Multiplayer"],
    developer: "Arena Games Inc",
    publisher: "Esports Global",
    releaseDate: "2024-05-15",
    price: 0,
    coverImage: "https://images.unsplash.com/photo-1677360330585-a0c7f703b959?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1770",
    screenshots: [
      "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1511882150382-421056c89033?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&h=450&fit=crop"
    ],
    rating: 4.3,
    reviewCount: 24567,
    features: [
      "50+ unique champions",
      "Ranked competitive mode",
      "Regular balance updates",
      "Esports tournament support",
      "In-game voice chat"
    ],
    systemRequirements: {
      os: "Windows 10 64-bit",
      processor: "Intel Core i3-530 or AMD Athlon II X4 640",
      memory: "4 GB RAM",
      graphics: "NVIDIA GeForce 9800GT or AMD Radeon HD 5670",
      storage: "12 GB available space"
    },
    licenseDuration: 0,
    transferable: false,
    tags: ["MOBA", "Multiplayer", "Competitive", "Free to Play", "Team-Based"]
  },
  {
    id: "shadow-warriors-legacy",
    title: "Shadow Warriors: Legacy",
    description: "Master the art of stealth and assassination in feudal Japan. As the last member of an ancient ninja clan, you must restore honor to your family name. Use traditional weapons, stealth tactics, and supernatural abilities to eliminate your targets and uncover a conspiracy that threatens the entire nation.",
    shortDescription: "Stealth action game set in feudal Japan",
    genre: ["Action", "Stealth", "Adventure"],
    developer: "Ronin Studios",
    publisher: "Eastern Games",
    releaseDate: "2024-04-18",
    price: 4.99,
    coverImage: "https://images.unsplash.com/photo-1478119025579-5ec5b648d6e5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2231",
    screenshots: [
      "https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1528459199957-0ff28496a7f6?w=800&h=450&fit=crop"
    ],
    rating: 4.6,
    reviewCount: 11234,
    features: [
      "Authentic feudal Japan setting",
      "Multiple assassination methods",
      "Parkour and free-running mechanics",
      "Honor system affecting gameplay",
      "Ghost of Tsushima-inspired combat"
    ],
    systemRequirements: {
      os: "Windows 10 64-bit",
      processor: "Intel Core i5-8400 or AMD Ryzen 5 2600",
      memory: "12 GB RAM",
      graphics: "NVIDIA GeForce GTX 1060 or AMD Radeon RX 580",
      storage: "50 GB available space"
    },
    licenseDuration: 0,
    transferable: true,
    tags: ["Ninja", "Stealth", "Historical", "Action", "Singleplayer"]
  },
  {
    id: "pixel-quest-adventures",
    title: "Pixel Quest Adventures",
    description: "A charming retro-style platformer that pays homage to classic 16-bit games. Jump, run, and explore colorful worlds filled with secrets, challenging bosses, and quirky characters. With its tight controls and nostalgic pixel art, this is a love letter to gaming's golden age.",
    shortDescription: "Retro pixel art platformer with modern mechanics",
    genre: ["Platformer", "Indie", "Adventure"],
    developer: "Pixel Dreams",
    publisher: "Retro Revival",
    releaseDate: "2024-02-14",
    price: 1.99,
    coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=450&fit=crop",
    screenshots: [
      "https://images.unsplash.com/photo-1587095951604-b9d924a3fda0?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1556438064-2d7646166914?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&h=450&fit=crop"
    ],
    rating: 4.9,
    reviewCount: 8765,
    features: [
      "Beautiful pixel art graphics",
      "50+ levels across 5 worlds",
      "Secret collectibles and shortcuts",
      "Boss battles with unique mechanics",
      "Speedrun mode with leaderboards"
    ],
    systemRequirements: {
      os: "Windows 7/8/10 64-bit",
      processor: "Intel Core i3-2100 or AMD equivalent",
      memory: "4 GB RAM",
      graphics: "NVIDIA GeForce GTX 460 or AMD Radeon HD 5670",
      storage: "2 GB available space"
    },
    licenseDuration: 0,
    transferable: true,
    tags: ["Pixel Graphics", "Platformer", "Retro", "Indie", "Casual"]
  },
  {
    id: "zombie-apocalypse-survival",
    title: "Zombie Apocalypse: Survival",
    description: "The dead walk the earth, and humanity's last hope rests in fortified settlements. Scavenge for resources, build defenses, and make tough decisions to keep your community alive. Every choice matters in this brutal survival game where trust is scarce and danger lurks everywhere.",
    shortDescription: "Post-apocalyptic zombie survival with base building",
    genre: ["Survival", "Horror", "Strategy"],
    developer: "Dead World Games",
    publisher: "Apocalypse Interactive",
    releaseDate: "2024-09-20",
    price: 5.49,
    coverImage: "https://plus.unsplash.com/premium_photo-1719327883199-467d018959a2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1770",
    screenshots: [
      "https://images.unsplash.com/photo-1589241062272-c0a000072699?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1578589318433-39b5e2e3c97c?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1509233725247-49e657c54213?w=800&h=450&fit=crop"
    ],
    rating: 4.5,
    reviewCount: 13456,
    features: [
      "Base building and fortification",
      "Resource management mechanics",
      "Moral choice system",
      "Day/night cycle with increased danger",
      "Co-op multiplayer for up to 4 players"
    ],
    systemRequirements: {
      os: "Windows 10 64-bit",
      processor: "Intel Core i5-6600K or AMD Ryzen 5 1600",
      memory: "12 GB RAM",
      graphics: "NVIDIA GeForce GTX 1060 or AMD Radeon RX 580",
      storage: "40 GB available space"
    },
    licenseDuration: 0,
    transferable: true,
    tags: ["Zombies", "Survival", "Co-op", "Base Building", "Post-Apocalyptic"]
  },
  {
    id: "mythic-card-legends",
    title: "Mythic Card Legends",
    description: "Build your ultimate deck and challenge players worldwide in this strategic card battler. Collect hundreds of mythical creatures, powerful spells, and legendary artifacts. With deep strategy, regular updates, and a thriving competitive scene, every match is a new challenge.",
    shortDescription: "Collectible card game with strategic depth",
    genre: ["Card Game", "Strategy", "Multiplayer"],
    developer: "Mythic Games",
    publisher: "Card Masters Inc",
    releaseDate: "2024-07-05",
    price: 0,
    coverImage: "https://images.unsplash.com/photo-1511882150382-421056c89033?w=800&h=450&fit=crop",
    screenshots: [
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1556438064-2d7646166914?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=450&fit=crop"
    ],
    rating: 4.4,
    reviewCount: 19876,
    features: [
      "500+ unique cards to collect",
      "Draft and constructed modes",
      "Weekly tournaments with prizes",
      "Cross-platform play",
      "Regular expansions and balance updates"
    ],
    systemRequirements: {
      os: "Windows 7/8/10 64-bit",
      processor: "Intel Core i3 or AMD equivalent",
      memory: "4 GB RAM",
      graphics: "Any graphics card with 1GB VRAM",
      storage: "5 GB available space"
    },
    licenseDuration: 0,
    transferable: false,
    tags: ["CCG", "Strategy", "Multiplayer", "Free to Play", "Competitive"]
  },
  {
    id: "mech-warfare-titans",
    title: "Mech Warfare: Titans",
    description: "Pilot massive mechanized war machines in intense team-based combat. Customize your mech with hundreds of weapons, armor plates, and special abilities. Coordinate with your squad to dominate the battlefield in this fast-paced mech shooter with deep tactical gameplay.",
    shortDescription: "Team-based mech combat with deep customization",
    genre: ["Action", "Shooter", "Multiplayer"],
    developer: "Titan Studios",
    publisher: "Mech Combat Games",
    releaseDate: "2024-11-12",
    price: 7.99,
    coverImage: "https://plus.unsplash.com/premium_photo-1682124160908-f65a613ac8b3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2232",
    screenshots: [
      "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=450&fit=crop"
    ],
    rating: 4.7,
    reviewCount: 16543,
    features: [
      "20+ unique mech chassis",
      "Extensive customization system",
      "6v6 tactical combat",
      "Multiple game modes",
      "Clan system and tournaments"
    ],
    systemRequirements: {
      os: "Windows 10/11 64-bit",
      processor: "Intel Core i7-8700K or AMD Ryzen 7 2700X",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce RTX 2070 or AMD Radeon RX 5700 XT",
      storage: "60 GB available space"
    },
    licenseDuration: 0,
    transferable: true,
    tags: ["Mech", "Shooter", "Multiplayer", "Tactical", "Sci-Fi"]
  },
  {
    id: "farming-life-simulator",
    title: "Farming Life Simulator",
    description: "Start with a small plot of land and build your dream farm. Plant crops, raise animals, fish in nearby rivers, and build relationships with the local townspeople. With seasonal events, marriage options, and endless customization, create the peaceful rural life you've always wanted.",
    shortDescription: "Relaxing farm simulation with social elements",
    genre: ["Simulation", "Casual", "RPG"],
    developer: "Harvest Moon Games",
    publisher: "Rural Life Studios",
    releaseDate: "2024-03-22",
    price: 3.49,
    coverImage: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=450&fit=crop",
    screenshots: [
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=450&fit=crop"
    ],
    rating: 4.8,
    reviewCount: 22134,
    features: [
      "Four seasons with unique activities",
      "10+ marriage candidates",
      "Farm animals and crop varieties",
      "Mining and foraging",
      "Town festivals and events"
    ],
    systemRequirements: {
      os: "Windows 7/8/10 64-bit",
      processor: "Intel Core i3 or AMD equivalent",
      memory: "4 GB RAM",
      graphics: "NVIDIA GeForce GTX 660 or AMD Radeon HD 7850",
      storage: "8 GB available space"
    },
    licenseDuration: 0,
    transferable: true,
    tags: ["Farming", "Relaxing", "Simulation", "Romance", "Casual"]
  },
  {
    id: "dungeon-crawler-ultimate",
    title: "Dungeon Crawler Ultimate",
    description: "Descend into procedurally generated dungeons filled with monsters, traps, and legendary loot. Choose from 8 character classes, each with unique skill trees and playstyles. With permadeath, challenging bosses, and endless replayability, every run is a new adventure.",
    shortDescription: "Roguelike dungeon crawler with permadeath",
    genre: ["Roguelike", "RPG", "Action"],
    developer: "Dungeon Masters",
    publisher: "Rogue Games",
    releaseDate: "2024-05-30",
    price: 2.49,
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=450&fit=crop",
    screenshots: [
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&h=450&fit=crop"
    ],
    rating: 4.6,
    reviewCount: 14567,
    features: [
      "Procedurally generated dungeons",
      "8 character classes",
      "Hundreds of items and equipment",
      "Permadeath with meta-progression",
      "Daily challenge runs"
    ],
    systemRequirements: {
      os: "Windows 7/8/10 64-bit",
      processor: "Intel Core i3 or AMD equivalent",
      memory: "4 GB RAM",
      graphics: "NVIDIA GeForce GTX 560 or AMD Radeon HD 6870",
      storage: "3 GB available space"
    },
    licenseDuration: 0,
    transferable: true,
    tags: ["Roguelike", "Dungeon Crawler", "Permadeath", "Indie", "Challenging"]
  },
  {
    id: "street-fighter-legacy",
    title: "Street Fighter Legacy",
    description: "Master the art of combat in this fast-paced 2D fighting game. Choose from a diverse roster of 30+ fighters, each with unique movesets, combos, and special techniques. Compete online, climb the rankings, and prove you're the ultimate warrior in tournament mode.",
    shortDescription: "Classic 2D fighting game with competitive focus",
    genre: ["Fighting", "Action", "Multiplayer"],
    developer: "Fight Club Studios",
    publisher: "Combat Games",
    releaseDate: "2024-08-25",
    price: 4.99,
    coverImage: "https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1770",
    screenshots: [
      "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1511882150382-421056c89033?w=800&h=450&fit=crop",
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&h=450&fit=crop"
    ],
    rating: 4.7,
    reviewCount: 18234,
    features: [
      "30+ unique fighters",
      "Frame-perfect combat system",
      "Ranked matchmaking",
      "Training mode with frame data",
      "Rollback netcode for smooth online play"
    ],
    systemRequirements: {
      os: "Windows 10 64-bit",
      processor: "Intel Core i5-4460 or AMD FX-6300",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 760 or AMD Radeon R9 270X",
      storage: "20 GB available space"
    },
    licenseDuration: 0,
    transferable: true,
    tags: ["Fighting", "Competitive", "2D", "Multiplayer", "Esports"]
  }
];

// Helper function to get a game by ID
export function getGameById(id: string): Game | undefined {
  return mockGames.find(game => game.id === id);
}

// Helper function to filter games by genre
export function getGamesByGenre(genre: string): Game[] {
  return mockGames.filter(game => 
    game.genre.some(g => g.toLowerCase() === genre.toLowerCase())
  );
}

// Helper function to get featured games (highest rated)
export function getFeaturedGames(count: number = 3): Game[] {
  return [...mockGames]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, count);
}

// Helper function to format price
export function formatPrice(price: number): string {
  return price === 0 ? "Free" : `${price} APT`;
}

// Helper function to check if license is expired
export function isLicenseExpired(expiryTimestamp: number): boolean {
  if (expiryTimestamp === 0) return false; // perpetual license
  return Date.now() / 1000 > expiryTimestamp;
}

// Helper function to format license duration
export function formatDuration(seconds: number): string {
  if (seconds === 0) return "Perpetual";
  const days = Math.floor(seconds / 86400);
  if (days > 365) return `${Math.floor(days / 365)} Year(s)`;
  if (days > 30) return `${Math.floor(days / 30)} Month(s)`;
  return `${days} Day(s)`;
}