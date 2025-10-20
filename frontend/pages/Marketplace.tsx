import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";
import { Link } from "react-router-dom"; // ADD THIS
import { WalletSelector } from "@/components/WalletSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Replace mockGames here with import from your data file
import { mockGames } from "@/data/mockGames"; // CHANGE THIS LINE

const formatPrice = (price) => {
  return price === 0 ? "Free" : `${price} APT`;
};

export function Marketplace() {
  const { connected } = useWallet();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");

  const allGenres = ["all", ...new Set(mockGames.flatMap(game => game.genre))];

  const filteredGames = mockGames.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "all" || game.genre.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

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

      {/* UPDATED SECTION - Add Link wrapper */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game) => (
          <Link to={`/game/${game.id}`} key={game.id} className="block">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
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
              </div>

              <CardContent className="p-4 space-y-3">
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

                <div className="flex items-center justify-between pt-2">
                  <span className="text-2xl font-bold">
                    {formatPrice(game.price)}
                  </span>
                  <Button 
                    disabled={!connected}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                    onClick={(e) => {
                      // Prevent navigation if wallet not connected
                      if (!connected) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {connected ? "Buy Now" : "Connect Wallet"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
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