import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WalletSelector } from "@/components/WalletSelector";
import { 
  Loader2, 
  Play, 
  Clock, 
  Trophy, 
  Settings, 
  Store,
  Library,
  TrendingUp
} from "lucide-react";
import { mockGames } from "@/data/mockGames";

// Initialize Aptos client
const config = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(config);

const MODULE_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS || "0xc5d8f29f688c22ced2b33ba05d7d5241a21ece238ad1657e922251995b059ebc";

// Helper to convert hex/array to string
const arrayToString = (arr: number[] | string): string => {
  try {
    let bytes: number[];
    
    if (typeof arr === 'string') {
      const hex = arr.startsWith('0x') ? arr.slice(2) : arr;
      bytes = [];
      for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
      }
    } else if (Array.isArray(arr)) {
      bytes = arr;
    } else {
      return '';
    }
    
    const filtered = bytes.filter(n => n > 0 && n < 128);
    return String.fromCharCode(...filtered).trim();
  } catch (error) {
    console.error('Error converting to string:', error);
    return '';
  }
};

interface License {
  license_id: string;
  game_id: number[] | string;
  owner: string;
  expiry: string;
  transferable: boolean;
  metadata_uri: number[] | string;
}

interface GameWithPlaytime {
  id: string;
  title: string;
  coverImage: string;
  lastPlayed?: Date;
  playtime: number; // hours
  achievements: number;
  totalAchievements: number;
}

export function Launcher() {
  const wallet = useWallet();
  const { connected, account } = wallet;
  const navigate = useNavigate();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [games, setGames] = useState<GameWithPlaytime[]>([]);
  const [loading, setLoading] = useState(false);
  const [launchingGame, setLaunchingGame] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameWithPlaytime | null>(null);

  useEffect(() => {
    if (connected && account) {
      fetchGamesLibrary();
    }
  }, [connected, account]);

  const fetchGamesLibrary = async () => {
    if (!account) return;

    try {
      setLoading(true);
      const response = await aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::license::get_user_licenses`,
          typeArguments: [],
          functionArguments: [account.address],
        },
      });

      const licensesData = response[0] as License[];
      setLicenses(licensesData);

      // Convert licenses to games with mock playtime data
      const gamesData: GameWithPlaytime[] = licensesData
        .map((license, index) => {
          const gameId = arrayToString(license.game_id);
          const gameDetails = mockGames.find(g => g.id === gameId);
          
          if (!gameDetails) return null;

          return {
            id: gameId,
            title: gameDetails.title,
            coverImage: gameDetails.coverImage,
            lastPlayed: index === 0 ? new Date() : new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            playtime: Math.floor(Math.random() * 100),
            achievements: Math.floor(Math.random() * 50),
            totalAchievements: 50
          };
        })
        .filter(Boolean) as GameWithPlaytime[];

      // Sort by last played
      gamesData.sort((a, b) => 
        (b.lastPlayed?.getTime() || 0) - (a.lastPlayed?.getTime() || 0)
      );

      setGames(gamesData);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchGame = (game: GameWithPlaytime) => {
    setLaunchingGame(game.id);
    setSelectedGame(game);

    // Simulate game launch
    setTimeout(() => {
      alert(
        `🎮 Launching ${game.title}...\n\n` +
        `In a production environment, this would:\n` +
        `• Verify your license on-chain\n` +
        `• Download game files if needed\n` +
        `• Start the game client\n` +
        `• Track your playtime\n` +
        `• Sync achievements to blockchain`
      );
      setLaunchingGame(null);
      setSelectedGame(null);
    }, 2000);
  };

  if (!connected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <Play className="w-16 h-16 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
            <p className="text-muted-foreground">
              Please connect your wallet to access your game library
            </p>
            <WalletSelector />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-1">Game Launcher</h1>
          <p className="text-muted-foreground">
            {games.length} {games.length === 1 ? 'game' : 'games'} in your library
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/licenses")}>
            <Library className="w-4 h-4 mr-2" />
            Manage Licenses
          </Button>
          <Button onClick={() => navigate("/marketplace")}>
            <Store className="w-4 h-4 mr-2" />
            Browse Store
          </Button>
        </div>
      </div>

      {games.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <Play className="w-20 h-20 mx-auto text-muted-foreground" />
            <h3 className="text-2xl font-semibold">Your Library is Empty</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Purchase games from the marketplace to start playing!
            </p>
            <Button 
              onClick={() => navigate("/marketplace")}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Visit Marketplace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Featured/Recently Played */}
          {games[0] && (
            <Card className="overflow-hidden border-0">
              <div className="relative h-[400px]">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img 
                    src={games[0].coverImage} 
                    alt={games[0].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/60"></div>
                </div>
                
                {/* Content */}
                <CardContent className="relative h-full flex flex-col justify-end p-8 space-y-4">
                  <Badge className="bg-blue-600 w-fit">Recently Played</Badge>
                  <h2 className="text-5xl font-bold text-white">{games[0].title}</h2>
                  
                  <div className="flex flex-wrap gap-6 text-sm text-gray-200">
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg backdrop-blur-sm">
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold">{games[0].playtime}h played</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg backdrop-blur-sm">
                      <Trophy className="w-4 h-4" />
                      <span className="font-semibold">{games[0].achievements}/{games[0].totalAchievements} achievements</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg backdrop-blur-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-semibold">Last played {games[0].lastPlayed?.toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Achievement Progress Bar */}
                  <div className="w-full max-w-md">
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span>Achievement Progress</span>
                      <span>{Math.round((games[0].achievements / games[0].totalAchievements) * 100)}%</span>
                    </div>
                    <div className="bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all"
                        style={{ width: `${(games[0].achievements / games[0].totalAchievements) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      size="lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLaunchGame(games[0]);
                      }}
                      disabled={launchingGame === games[0].id}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg"
                    >
                      {launchingGame === games[0].id ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Launching...
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Play Now
                        </>
                      )}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/game/${games[0].id}`);
                      }}
                      className="border-2 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 backdrop-blur-sm px-6 py-6 text-lg"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          )}

          {/* All Games Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Library</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {games.map((game) => (
                <Card 
                  key={game.id}
                  className="overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
                  onClick={() => handleLaunchGame(game)}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={game.coverImage} 
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {launchingGame === game.id ? (
                        <Loader2 className="w-12 h-12 text-white animate-spin" />
                      ) : (
                        <Play className="w-12 h-12 text-white" />
                      )}
                    </div>
                  </div>
                  
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-bold line-clamp-1">{game.title}</h3>
                    
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Playtime:</span>
                        <span className="font-semibold">{game.playtime}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Achievements:</span>
                        <span className="font-semibold">{game.achievements}/{game.totalAchievements}</span>
                      </div>
                      {game.lastPlayed && (
                        <div className="flex justify-between">
                          <span>Last played:</span>
                          <span className="font-semibold">
                            {game.lastPlayed.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Progress bar for achievements */}
                    <div className="pt-2">
                      <div className="bg-secondary rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all"
                          style={{ width: `${(game.achievements / game.totalAchievements) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Launching Overlay */}
      {launchingGame && selectedGame && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="text-center space-y-6">
            <Loader2 className="w-20 h-20 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="text-3xl font-bold text-white mb-2">
                Launching {selectedGame.title}
              </h3>
              <p className="text-gray-400">
                Verifying license and starting game...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}