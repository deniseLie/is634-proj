import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";
import { WalletSelector } from "@/components/WalletSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { mockGames } from "@/data/mockGames";

const formatPrice = (price) => {
  return price === 0 ? "Free" : `${price} APT`;
};

export function Marketplace() {
  const { connected } = useWallet();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");

  // Get unique genres
  const allGenres = ["all", ...new Set(mockGames.flatMap(game => game.genre))];

  // Filter games
  const filteredGames = mockGames.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "all" || game.genre.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="space-y-8">
      {/* Wallet Connection Banner */}
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

      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Game Marketplace
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover and purchase blockchain-verified game licenses. True ownership, forever.
        </p>
      </div>

      {/* Search and Filter Bar */}
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
        <Select value={selectedGenre} onValueChange={setSelectedGenre}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by genre" />
          </SelectTrigger>
          <SelectContent>
            {allGenres.map(genre => (
              <SelectItem key={genre} value={genre}>
                {genre === "all" ? "All Genres" : genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'}
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game) => (
          <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Cover Image */}
            <div className="relative h-48 overflow-hidden">
              <img 
                src={game.coverImage} 
                alt={game.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              {game.price === 0 && (
                <Badge className="absolute top-2 right-2 bg-green-600">
                  Free
                </Badge>
              )}
            </div>

            <CardContent className="p-4 space-y-3">
              {/* Title */}
              <h3 className="font-bold text-lg line-clamp-1">{game.title}</h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {game.shortDescription}
              </p>

              {/* Genre Tags */}
              <div className="flex flex-wrap gap-1">
                {game.genre.slice(0, 3).map(genre => (
                  <Badge key={genre} variant="secondary" className="text-xs">
                    {genre}
                  </Badge>
                ))}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-yellow-500">★</span>
                <span className="font-semibold">{game.rating}</span>
                <span className="text-muted-foreground">
                  ({game.reviewCount.toLocaleString()} reviews)
                </span>
              </div>

              {/* Transferable Badge */}
              {game.transferable && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <span>🔄</span>
                  <span>Resellable License</span>
                </div>
              )}

              {/* Price and Buy Button */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-2xl font-bold">
                  {formatPrice(game.price)}
                </span>
                <Button 
                  disabled={!connected}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {connected ? "Buy Now" : "Connect Wallet"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
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