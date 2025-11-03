import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { WalletSelector } from "@/components/WalletSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockGames } from "@/data/mockGames";
import { hexToString, arrayToString, checkRegistryInitialized } from "@/utils/helpers";
import { generateRandomGame } from "@/utils/gameHelper";

// Initialize Aptos client
const config = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(config);

const MODULE_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS || "0xc5d8f29f688c22ced2b33ba05d7d5241a21ece238ad1657e922251995b059ebc";

const formatPrice = (price) => {
  return price === 0 ? "Free" : `${price} APT`;
};
export function Marketplace() {
  const wallet = useWallet();
  const { connected, account } = wallet;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [ownedGames, setOwnedGames] = useState(new Set());
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const allGenres = ["all", ...new Set(games.flatMap(game => game.genre))];

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "all" || game.genre.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  // Fetch games from registry
  useEffect(() => {
    fetchGames();
  }, []);

  // Check which games the user owns
  useEffect(() => {
    if (connected && account) {
      checkOwnedGames();
    }
  }, [connected, account]);

  // Fetch game
  const fetchGames = async () => {
    try {
      setLoading(true);

      try {

        // Check game registry initialization
        if (!checkRegistryInitialized(aptos, MODULE_ADDRESS)) {
          console.warn("Registry not initialized. Initializing now...");

          // initialize registry
          const payload = {
            function: `${MODULE_ADDRESS}::license::initialize_registry`,
            type_arguments: [],
            functionArguments: [],
          };
          const response = await wallet.signAndSubmitTransaction({ 
            sender: account.address,
            data: payload
          });
          await aptos.waitForTransaction({ transactionHash: response.hash });
          console.log("Registry initialized!");
        }
      } catch (e) {
        // ERROR
        console.error("Init registry error:", e);
        console.warn("Game registry not found.");
        setGames([]);
        setLoading(false);
        return;
      }

      // Get the GameRegistry resource
      const registryResource = await aptos.getAccountResource({
        accountAddress: MODULE_ADDRESS,
        resourceType: `${MODULE_ADDRESS}::license::GameRegistry`
      });
      if (!registryResource) {
        console.error('GameRegistry resource not found');
        setGames([]);
        return;
      }

      console.log('Registry resource:', registryResource);

      const gamesTableHandle = registryResource.games.handle;

      // Get all games - we need to query the view function instead
      const response = await aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::license::get_all_games`,
          typeArguments: [],
          functionArguments: [],
        },
      });

      console.log('=== Fetching Games from Registry ===');
      console.log('Games response:', response);

      // Parse the games data
      const gamesData = response[0];
      
      const parsedGames = gamesData.map((game, index) => {
        game_id: game.game_id === "" ? "0" : game.game_id,
        
        game.title = typeof game.title === 'string'
          ? hexToString(game.title)
          : arrayToString(game.title);

        game.description = typeof game.description === 'string'
          ? hexToString(game.description)
          : arrayToString(game.description);

        game.metadataUri = typeof game.metadata_uri === 'string'
          ? hexToString(game.metadata_uri)
          : arrayToString(game.metadata_uri);

        return generateRandomGame(game);
      });

      console.log('Parsed games:', parsedGames);
      setGames(parsedGames);
      
    } catch (error) {
      console.error('Error fetching games:', error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const checkOwnedGames = async () => {
    if (!account) return;

    try {
      const response = await aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::license::get_user_licenses`,
          typeArguments: [],
          functionArguments: [account.address],
        },
      });

      console.log('=== Checking Owned Games ===');
      const licenses = response[0] as any[];
      console.log('Licenses:', licenses);
      
      const owned = new Set(
        licenses.map(license => {
          // Handle both hex string and array format
          let gameId;
          if (typeof license.game_id === 'string') {
            gameId = hexToString(license.game_id);
          } else if (Array.isArray(license.game_id)) {
            gameId = arrayToString(license.game_id);
          } else {
            gameId = '';
          }
          
          console.log('Converted game ID:', gameId);
          return gameId;
        }).filter(id => id.length > 0)
      );
      
      console.log('Owned games set:', owned);
      setOwnedGames(owned);
    } catch (error) {
      console.error('Error checking owned games:', error);
    }
  };

  return (
    <div className="space-y-8">
      {!connected && (
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-none text-white">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Connect Your Wallet to Buy Games
                </h2>
                <p className="opacity-90">
                  Browse games below, but you'll need to connect a wallet to purchase licenses
                </p>
              </div>
              <WalletSelector />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Game Marketplace
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover and purchase blockchain-verified game licenses. True ownership, forever.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <select 
          value={selectedGenre} 
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="w-full md:w-48 px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
          {allGenres.map(genre => (
            <option key={genre} value={genre}>
              {genre === "all" ? "All Genres" : genre}
            </option>
          ))}
        </select>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game, id) => {
          console.log('Checking ownership for game:', game.id, 'Owned games:', ownedGames);
          const isOwned = ownedGames.has(game.id);

          return (
            <Link 
              to={`/game/${game.id}`} 
              key={`id-${game.id}`} 
              className="block"
              state={{ game }} // Pass the game data
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={game.coverImage} 
                    alt={game.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {game.price === 0 && (
                    <span className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Free
                    </span>
                  )}
                  {isOwned && (
                    <span className="absolute top-2 left-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      ✓ Owned
                    </span>
                  )}
                </div>

                <CardContent className="p-4 space-y-3 flex flex-col flex-grow">
                  <h3 className="font-bold text-lg line-clamp-1">{game.title}</h3>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {game.shortDescription}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {game.genre.slice(0, 3).map(genre => (
                      <span key={genre} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                        {genre}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-yellow-500">★</span>
                    <span className="font-semibold">{game.rating}</span>
                    <span className="text-muted-foreground">
                      ({game.reviewCount.toLocaleString()} reviews)
                    </span>
                  </div>

                  {game.transferable && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <span>🔄</span>
                      <span>Resellable License</span>
                    </div>
                  )}

                  {/* Spacer to push content to bottom */}
                  <div className="flex-grow"></div>

                  <div className="flex items-center justify-between pt-2 mt-auto">
                    <span className="text-2xl font-bold">
                      {formatPrice(game.price)}
                    </span>
                    
                    {isOwned ? (
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                      >
                        In Library
                      </Button>
                    ) : (
                      <Button 
                        className="bg-gradient-to-r from-blue-600 to-purple-600"
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filteredGames.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            No games found matching your criteria
          </p>
        </div>
      )}
    </div>
  );
}