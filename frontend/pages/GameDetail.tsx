import { useParams, useNavigate, Link } from "react-router-dom";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Shield, Clock, Star } from "lucide-react";

// Import your game data
import { mockGames } from "@/data/mockGames";

const formatPrice = (price: number) => {
  return price === 0 ? "Free" : `${price} APT`;
};

const formatDuration = (seconds: number) => {
  if (seconds === 0) return "Perpetual";
  const days = Math.floor(seconds / 86400);
  if (days > 365) return `${Math.floor(days / 365)} Year(s)`;
  if (days > 30) return `${Math.floor(days / 30)} Month(s)`;
  return `${days} Day(s)`;
};

export function GameDetail() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { connected } = useWallet();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Find the game
  const game = mockGames.find(g => g.id === gameId);

  if (!game) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Game Not Found</h1>
        <p className="text-muted-foreground mb-6">The game you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/")}>
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const allImages = [game.coverImage, ...game.screenshots];

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate("/")}
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </Button>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">{game.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>{game.developer}</span>
            <span>•</span>
            <span>{game.publisher}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(game.releaseDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Images and Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card>
            <CardContent className="p-0">
              {/* Main Image */}
              <div className="relative aspect-video overflow-hidden rounded-t-lg">
                <img
                  src={allImages[currentImageIndex]}
                  alt={game.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-2 p-4">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-video overflow-hidden rounded border-2 transition-all ${
                      currentImageIndex === index
                        ? "border-primary"
                        : "border-transparent hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* About This Game */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">About This Game</h2>
              <p className="text-muted-foreground leading-relaxed">
                {game.description}
              </p>

              {/* Genre Tags */}
              <div className="flex flex-wrap gap-2">
                {game.genre.map(genre => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">Key Features</h2>
              <ul className="space-y-2">
                {game.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* System Requirements */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">System Requirements</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <span className="font-semibold">OS:</span>
                  <span className="col-span-2 text-muted-foreground">
                    {game.systemRequirements.os}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="font-semibold">Processor:</span>
                  <span className="col-span-2 text-muted-foreground">
                    {game.systemRequirements.processor}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="font-semibold">Memory:</span>
                  <span className="col-span-2 text-muted-foreground">
                    {game.systemRequirements.memory}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="font-semibold">Graphics:</span>
                  <span className="col-span-2 text-muted-foreground">
                    {game.systemRequirements.graphics}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <span className="font-semibold">Storage:</span>
                  <span className="col-span-2 text-muted-foreground">
                    {game.systemRequirements.storage}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Purchase Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6 space-y-6">
              {/* Price */}
              <div>
                <div className="text-3xl font-bold mb-2">
                  {formatPrice(game.price)}
                </div>
                {game.price === 0 && (
                  <Badge className="bg-green-600">Free to Play</Badge>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  <span className="text-xl font-bold">{game.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ({game.reviewCount.toLocaleString()} reviews)
                </span>
              </div>

              {/* Buy Button */}
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
                disabled={!connected}
              >
                {connected ? "Buy License" : "Connect Wallet to Purchase"}
              </Button>

              {/* License Info */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm">License Information</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">Duration</div>
                      <div className="text-muted-foreground">
                        {formatDuration(game.licenseDuration)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">DRM Type</div>
                      <div className="text-muted-foreground">
                        Blockchain-verified ownership
                      </div>
                    </div>
                  </div>

                  {game.transferable && (
                    <div className="flex items-center gap-2 text-blue-600 bg-blue-50 dark:bg-blue-950 p-3 rounded">
                      <span>🔄</span>
                      <span className="text-sm font-medium">
                        Resellable License
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="pt-4 border-t space-y-2 text-xs text-muted-foreground">
                <p>✓ Permanent blockchain record</p>
                <p>✓ No subscription required</p>
                <p>✓ Play offline after verification</p>
                {game.transferable && <p>✓ Sell or trade your license</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tags Section */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">Popular Tags</h3>
          <div className="flex flex-wrap gap-2">
            {game.tags.map(tag => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}