import { useParams, useNavigate } from "react-router-dom";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect } from "react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Shield, Clock, Star, Loader2 } from "lucide-react";

// Import your game data
import { mockGames } from "@/data/mockGames";

// Initialize Aptos client
const config = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(config);

const MODULE_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS || "0xc5d8f29f688c22ced2b33ba05d7d5241a21ece238ad1657e922251995b059ebc";

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

  const wallet = useWallet();
  const { connected, account } = wallet;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isOwned, setIsOwned] = useState(false);
  const [checkingOwnership, setCheckingOwnership] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [checkingBalance, setCheckingBalance] = useState(false);

  // Find the game
  const game = mockGames.find(g => g.id === gameId);

  // Check ownership when component mounts or wallet connects
  useEffect(() => {
    if (connected && account && game) {
      checkGameOwnership();
      fetchBalance();
    }
  }, [connected, account, game]);

  const checkGameOwnership = async () => {
    if (!account || !game) return;

    try {
      setCheckingOwnership(true);
      const gameIdBytes = Array.from(new TextEncoder().encode(game.id));
      
      const response = await aptos.view({
        payload: {
          function: `${MODULE_ADDRESS}::license::has_game_license`,
          typeArguments: [],
          functionArguments: [account.address, gameIdBytes],
        },
      });

      setIsOwned(response[0] as boolean);
    } catch (error) {
      console.error('Error checking ownership:', error);
      setIsOwned(false);
    } finally {
      setCheckingOwnership(false);
    }
  };

  const fetchBalance = async () => {
    if (!account) return;

    try {
      setCheckingBalance(true);
      const addressString = account.address.toString();
      
      const balanceInOctas = await aptos.getAccountAPTAmount({
        accountAddress: addressString
      });
      
      const balanceInAPT = balanceInOctas / 100000000;
      setBalance(balanceInAPT);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(0);
    } finally {
      setCheckingBalance(false);
    }
  };

  const handlePurchase = async () => {
    console.log('=== Purchase Debug Info ===');
    console.log('Connected:', connected);
    console.log('Account:', account);
    console.log('Wallet:', wallet);
    console.log('Wallet name:', wallet.wallet?.name);
    console.log('signAndSubmitTransaction exists:', !!wallet.signAndSubmitTransaction);

    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!account) {
      alert('No account found. Please reconnect your wallet.');
      return;
    }

    if (!game) {
      alert('Game not found');
      return;
    }

    // Check if wallet supports transactions
    if (typeof wallet.signAndSubmitTransaction !== 'function') {
      alert('Your wallet does not support transactions. Please try reconnecting or use a different wallet (like Petra).');
      return;
    }

    // CHECK BALANCE FIRST
    if (game.price > balance) {
      alert(
        `Insufficient Balance\n\n` +
        `Game Price: ${game.price} APT\n` +
        `Your Balance: ${balance.toFixed(4)} APT\n` +
        `You need ${(game.price - balance).toFixed(4)} more APT\n\n` +
        `Get more APT from the faucet: https://aptos.dev/en/network/faucet`
      );
      return;
    }

    setIsPurchasing(true);

    try {
      const gameIdBytes = Array.from(new TextEncoder().encode(game.id));
      
      const metadata = JSON.stringify({
        name: game.title,
        image: game.coverImage,
        description: game.shortDescription,
        developer: game.developer,
        genre: game.genre
      });
      const metadataBytes = Array.from(new TextEncoder().encode(metadata));

      const payload = {
        function: `${MODULE_ADDRESS}::license::buy_game_license`,
        typeArguments: [],
        functionArguments: [
          gameIdBytes,
          0,
          game.transferable,
          metadataBytes
        ]
      };

      console.log('Payload:', payload);

      const response = await wallet.signAndSubmitTransaction({
        sender: account.address,
        data: payload
      });

      console.log('Transaction response:', response);

      const txn = await aptos.waitForTransaction({ 
        transactionHash: response.hash 
      });

      console.log('Transaction confirmed:', txn);

      alert(`Successfully purchased ${game.title}!\n\nYou can now find it in your library.`);
      setIsOwned(true);
      
    } catch (error: any) {
      console.error('=== Purchase Error ===');
      console.error('Error:', error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      
      let errorMessage = 'Purchase failed. Please try again.';
      
      if (error?.message?.includes('WalletCore is not initialized')) {
        errorMessage = 'Wallet connection issue. Please disconnect and reconnect your wallet, then try again.';
      } else if (error?.message?.includes('INSUFFICIENT_BALANCE')) {
        errorMessage = 'Insufficient balance. Please add more APT to your wallet.';
      } else if (error?.message?.includes('USER_REJECTED')) {
        errorMessage = 'Transaction cancelled.';
      } else if (error?.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsPurchasing(false);
    }
  };

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
              {/* Ownership Badge */}
              {isOwned && (
                <div className="bg-green-100 dark:bg-green-900 border border-green-600 rounded-lg p-4 text-center">
                  <div className="text-green-700 dark:text-green-300 font-semibold">
                    ✓ You own this game
                  </div>
                </div>
              )}
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
              {checkingOwnership ? (
                <Button className="w-full" disabled>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking ownership...
                </Button>
              ) : isOwned ? (
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                  onClick={() => navigate("/launcher")}
                >
                  Play Now
                </Button>
              ) : (
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
                  disabled={!connected || isPurchasing}
                  onClick={handlePurchase}
                >
                  {isPurchasing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Purchasing...
                    </>
                  ) : connected ? (
                    `Buy for ${formatPrice(game.price)}`
                  ) : (
                    "Connect Wallet to Purchase"
                  )}
                </Button>
              )}

              {!connected && (
                <p className="text-xs text-center text-muted-foreground">
                  Connect your wallet to purchase this game
                </p>
              )}

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