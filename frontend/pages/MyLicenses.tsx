import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { WalletSelector } from "@/components/WalletSelector";
import { Loader2, Package, Play, Send } from "lucide-react";
import { mockGames } from "@/data/mockGames";

// Initialize Aptos client
const config = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(config);

const MODULE_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS || "0xc5d8f29f688c22ced2b33ba05d7d5241a21ece238ad1657e922251995b059ebc";

// Helper to convert byte array to string
const arrayToString = (arr: number[] | string): string => {
  try {
    let bytes: number[];
    
    // If it's a hex string, convert it to byte array
    if (typeof arr === 'string') {
      // Remove '0x' prefix if present
      const hex = arr.startsWith('0x') ? arr.slice(2) : arr;
      // Convert hex pairs to numbers
      bytes = [];
      for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
      }
    } else if (Array.isArray(arr)) {
      bytes = arr;
    } else {
      console.error('Invalid input type:', typeof arr);
      return '';
    }
    
    console.log('Bytes to convert:', bytes);
    
    // Convert bytes to string, filtering out null bytes
    const filtered = bytes.filter(n => n > 0 && n < 128);
    const result = String.fromCharCode(...filtered);
    
    console.log('Converted string:', result);
    return result.trim();
  } catch (error) {
    console.error('Error converting to string:', error);
    return '';
  }
};

// NFT Artwork Generator Component - Creates unique monkey NFT art for each license
const NFTArtwork = ({ 
  gameTitle, 
  licenseId, 
  ownerAddress, 
}: { 
  gameTitle: string; 
  licenseId: string; 
  ownerAddress: string;
}) => {
  // Generate unique attributes based on license ID and owner
  const generateUniqueAttributes = () => {
    const hash = licenseId + ownerAddress + gameTitle;
    let h = 0;
    for (let i = 0; i < hash.length; i++) {
      h = hash.charCodeAt(i) + ((h << 5) - h);
    }
    
    // Generate 3 unique hues for gradient
    const hue1 = Math.abs(h % 360);
    const hue2 = (hue1 + 137) % 360; // Golden angle for pleasing distribution
    const hue3 = (hue1 + 274) % 360;
    
    // Determine pattern based on license ID
    const patternIndex = parseInt(licenseId) % 4;
    const patterns = ['geometric', 'circuits', 'waves', 'dots'];
    
    return {
      colors: {
        primary: `hsl(${hue1}, 80%, 60%)`,
        secondary: `hsl(${hue2}, 80%, 55%)`,
        accent: `hsl(${hue3}, 80%, 65%)`,
      },
      pattern: patterns[patternIndex],
    };
  };

  const attributes = generateUniqueAttributes();

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${attributes.colors.primary}, ${attributes.colors.secondary} 50%, ${attributes.colors.accent})`,
        }}
      />
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-15">
        {attributes.pattern === 'geometric' && (
          <div style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(0,0,0,0.3) 20px, rgba(0,0,0,0.3) 40px)',
          }} className="w-full h-full" />
        )}
        {attributes.pattern === 'circuits' && (
          <div style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h30v30h-30z M50 50h30v30h-30z M10 50h30v30h-30z M50 10h30v30h-30z' stroke='black' fill='none' stroke-width='2' opacity='0.3'/%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px',
          }} className="w-full h-full" />
        )}
        {attributes.pattern === 'waves' && (
          <div style={{
            backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, transparent 0, rgba(0,0,0,0.2) 40px, transparent 80px)',
          }} className="w-full h-full" />
        )}
        {attributes.pattern === 'dots' && (
          <div style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.3) 2px, transparent 2px)',
            backgroundSize: '30px 30px',
          }} className="w-full h-full" />
        )}
      </div>

      {/* Monkey SVG silhouette with gradient overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-12">
        <svg 
          viewBox="0 0 400 400" 
          className="w-full h-full"
          style={{
            filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.5))',
          }}
        >
          <defs>
            <linearGradient id={`monkeyGradient-${licenseId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: attributes.colors.primary, stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: attributes.colors.secondary, stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: attributes.colors.accent, stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          
          {/* Monkey head */}
          <ellipse cx="200" cy="180" rx="120" ry="140" fill={`url(#monkeyGradient-${licenseId})`} />
          
          {/* Ears */}
          <circle cx="100" cy="140" r="50" fill={`url(#monkeyGradient-${licenseId})`} opacity="0.9" />
          <circle cx="300" cy="140" r="50" fill={`url(#monkeyGradient-${licenseId})`} opacity="0.9" />
          
          {/* Inner ears */}
          <circle cx="100" cy="140" r="30" fill="rgba(0,0,0,0.3)" />
          <circle cx="300" cy="140" r="30" fill="rgba(0,0,0,0.3)" />
          
          {/* Face area (lighter) */}
          <ellipse cx="200" cy="200" rx="80" ry="90" fill="rgba(255,255,255,0.2)" />
          
          {/* Eyes */}
          <ellipse cx="170" cy="180" rx="20" ry="30" fill="rgba(0,0,0,0.8)" />
          <ellipse cx="230" cy="180" rx="20" ry="30" fill="rgba(0,0,0,0.8)" />
          <circle cx="175" cy="175" r="8" fill="white" />
          <circle cx="235" cy="175" r="8" fill="white" />
          
          {/* Nose */}
          <ellipse cx="200" cy="220" rx="25" ry="20" fill="rgba(0,0,0,0.6)" />
          <circle cx="192" cy="218" r="5" fill="rgba(0,0,0,0.9)" />
          <circle cx="208" cy="218" r="5" fill="rgba(0,0,0,0.9)" />
          
          {/* Mouth */}
          <path 
            d="M 180 240 Q 200 255 220 240" 
            stroke="rgba(0,0,0,0.7)" 
            strokeWidth="4" 
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Body/neck */}
          <ellipse cx="200" cy="320" rx="100" ry="80" fill={`url(#monkeyGradient-${licenseId})`} opacity="0.95" />
          
          {/* Arms */}
          <ellipse cx="120" cy="310" rx="35" ry="70" fill={`url(#monkeyGradient-${licenseId})`} opacity="0.9" transform="rotate(-20 120 310)" />
          <ellipse cx="280" cy="310" rx="35" ry="70" fill={`url(#monkeyGradient-${licenseId})`} opacity="0.9" transform="rotate(20 280 310)" />
          
          {/* Hands */}
          <circle cx="110" cy="360" r="25" fill={`url(#monkeyGradient-${licenseId})`} opacity="0.85" />
          <circle cx="290" cy="360" r="25" fill={`url(#monkeyGradient-${licenseId})`} opacity="0.85" />
        </svg>
      </div>

      {/* Subtle glow around monkey */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, transparent 30%, ${attributes.colors.primary}20 50%, ${attributes.colors.accent}30 70%, transparent 90%)`,
        }}
      />

      {/* License ID badge - small and subtle */}
      <div className="absolute top-6 right-6">
        <div 
          className="text-white/80 font-mono text-sm px-4 py-2 rounded-full backdrop-blur-md border border-white/20"
          style={{
            background: 'rgba(0,0,0,0.4)',
          }}
        >
          #{licenseId}
        </div>
      </div>

      {/* Owner badge at bottom */}
      <div className="absolute bottom-6 left-6 right-6">
        <div 
          className="text-white/70 text-xs font-mono px-4 py-2 rounded-lg backdrop-blur-md border border-white/10 flex items-center justify-between"
          style={{
            background: 'rgba(0,0,0,0.4)',
          }}
        >
          <span>{ownerAddress.slice(0, 8)}...{ownerAddress.slice(-6)}</span>
        </div>
      </div>
    </div>
  );
};

interface License {
  license_id: string;
  game_id: number[] | string;  // Allow both types
  owner: string;
  expiry: string;
  transferable: boolean;
  metadata_uri: number[] | string;  // Allow both types
}

export function MyLicenses() {
  const wallet = useWallet();
  const { connected, account } = wallet;
  const navigate = useNavigate();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(false);
  const [transferModal, setTransferModal] = useState<{
    open: boolean;
    licenseId: string;
    gameName: string;
  }>({ open: false, licenseId: '', gameName: '' });
  const [transferAddress, setTransferAddress] = useState('');
  const [transferring, setTransferring] = useState(false);
  
  // NFT View Modal state
  const [viewNFTModal, setViewNFTModal] = useState<{
    open: boolean;
    licenseId: string;
    gameName: string;
    gameImage: string;
  }>({ open: false, licenseId: '', gameName: '', gameImage: '' });

  useEffect(() => {
    if (connected && account) {
      fetchLicenses();
    }
  }, [connected, account]);

  const fetchLicenses = async () => {
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

      console.log('=== RAW RESPONSE ===');
      console.log('Full response:', response);
      console.log('Response[0]:', response[0]);
      console.log('Type of response[0]:', typeof response[0]);
      
      const licensesData = response[0] as License[];
      console.log('Licenses data:', licensesData);
      
      if (licensesData && licensesData.length > 0) {
        console.log('First license:', licensesData[0]);
        console.log('First license game_id:', licensesData[0].game_id);
        console.log('Type of game_id:', typeof licensesData[0].game_id);
        console.log('Is array:', Array.isArray(licensesData[0].game_id));
      }
      
      setLicenses(licensesData);
    } catch (error) {
      console.error('Error fetching licenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!account || !wallet.signAndSubmitTransaction || !transferAddress) {
      alert('Please enter a valid address');
      return;
    }

    setTransferring(true);

    try {
      const payload = {
        function: `${MODULE_ADDRESS}::license::transfer_license`,
        typeArguments: [],
        functionArguments: [
          transferAddress,
          parseInt(transferModal.licenseId)
        ]
      };

      const response = await wallet.signAndSubmitTransaction({
        sender: account.address,
        data: payload
      });

      await aptos.waitForTransaction({ 
        transactionHash: response.hash 
      });

      alert(`Successfully transferred ${transferModal.gameName}!`);
      
      // Refresh licenses
      fetchLicenses();
      
      // Close modal
      setTransferModal({ open: false, licenseId: '', gameName: '' });
      setTransferAddress('');
    } catch (error: any) {
      console.error('Transfer error:', error);
      alert(`Transfer failed: ${error?.message || 'Please try again'}`);
    } finally {
      setTransferring(false);
    }
  };

  // Get game details from mock data
  const getGameDetails = (gameId: string) => {
    return mockGames.find(g => g.id === gameId);
  };

  if (!connected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <Package className="w-16 h-16 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
            <p className="text-muted-foreground">
              Please connect your wallet to view your game licenses
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
          <p className="text-muted-foreground">Loading your licenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My NFT Game Licenses
          </h1>
          <p className="text-muted-foreground">
            You own {licenses.length} unique NFT {licenses.length === 1 ? 'license' : 'licenses'}
          </p>
        </div>
        <Button onClick={() => navigate("/marketplace")} variant="outline">
          Browse Marketplace
        </Button>
      </div>

      {licenses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <Package className="w-20 h-20 mx-auto text-muted-foreground" />
            <h3 className="text-2xl font-semibold">No NFT Licenses Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You haven't purchased any games yet. Visit the marketplace to get your first blockchain-verified NFT game license!
            </p>
            <Button 
              onClick={() => navigate("/marketplace")}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Browse Games
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {licenses.map((license) => {
            const gameId = arrayToString(license.game_id);
            console.log('License game_id bytes:', license.game_id);
            console.log('Converted game_id:', gameId);
            const game = getGameDetails(gameId);
            console.log('Found game:', game);

            return (
              <Card key={license.license_id} className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
                {/* NFT Card with Holographic Effect */}
                <div className="relative">
                  {/* Holographic Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" />
                  
                  {/* NFT Badge */}
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-20 flex items-center gap-1">
                    <span className="animate-pulse">✨</span>
                    NFT LICENSE
                  </div>

                  {/* License ID Badge */}
                  <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-mono font-semibold z-20">
                    #{license.license_id}
                  </div>

                  {/* Game Cover Image */}
                  <div className="relative h-56 overflow-hidden border-b-4 border-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 z-[5]" />
                    <img 
                      src={game?.coverImage || 'https://via.placeholder.com/400x200'} 
                      alt={game?.title || gameId}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-[15]" />
                  </div>
                </div>

                <CardContent className="p-5 space-y-4 bg-gradient-to-b from-background to-muted/20">
                  {/* Game Title */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-xl line-clamp-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {game?.title || gameId}
                    </h3>
                    {game && (
                      <div className="flex flex-wrap gap-1">
                        {game.genre.slice(0, 2).map(genre => (
                          <Badge key={genre} variant="secondary" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* NFT Metadata */}
                  <div className="space-y-2 text-sm bg-muted/50 rounded-lg p-3 border border-muted">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        🎫 Status:
                      </span>
                      <span className="font-semibold text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                        Active
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        🔄 Transferable:
                      </span>
                      <span className={license.transferable ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {license.transferable ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                    
                    {license.expiry !== '0' && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          ⏰ Expires:
                        </span>
                        <span className="font-semibold">
                          {new Date(parseInt(license.expiry) * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="text-muted-foreground flex items-center gap-1">
                        👤 Owner:
                      </span>
                      <span className="font-mono text-xs">
                        {account?.address ? `${String(account.address).slice(0, 6)}...${String(account.address).slice(-4)}` : 'You'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                      onClick={() => navigate("/launcher")}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play Game
                    </Button>
                    <Button 
                      variant="outline"
                      className="shadow-lg hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:border-transparent transition-all"
                      onClick={() => setViewNFTModal({
                        open: true,
                        licenseId: license.license_id,
                        gameName: game?.title || gameId,
                        gameImage: game?.coverImage || 'https://via.placeholder.com/400x200'
                      })}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      View NFT
                    </Button>
                    {license.transferable && (
                      <Button 
                        variant="outline"
                        size="icon"
                        className="shadow-lg hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-colors"
                        onClick={() => setTransferModal({
                          open: true,
                          licenseId: license.license_id,
                          gameName: game?.title || gameId
                        })}
                        title="Transfer NFT License"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* View NFT Modal */}
      {viewNFTModal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-3xl w-full">
            {/* NFT Display Card */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-purple-600/50">
              {/* NFT Artwork */}
              <div className="aspect-square w-full">
                <NFTArtwork
                  gameTitle={viewNFTModal.gameName}
                  licenseId={viewNFTModal.licenseId}
                  ownerAddress={String(account?.address || '')}
                />
              </div>
              
              {/* NFT Info Footer */}
              <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{viewNFTModal.gameName}</h3>
                    <p className="text-white/70 text-sm">Unique NFT License</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-xs mb-1">Token ID</p>
                    <p className="text-white font-mono font-bold">#{viewNFTModal.licenseId}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-white/50 mb-1">Blockchain</p>
                    <p className="text-white font-semibold">Aptos</p>
                  </div>
                  <div>
                    <p className="text-white/50 mb-1">Token Standard</p>
                    <p className="text-white font-semibold">Digital Asset</p>
                  </div>
                </div>

                <Button
                  onClick={() => setViewNFTModal({ open: false, licenseId: '', gameName: '', gameImage: '' })}
                  className="w-full bg-white text-black hover:bg-white/90 font-semibold"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {transferModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Transfer NFT License
                </h3>
                <span className="text-2xl">✨</span>
              </div>
              <p className="text-muted-foreground">
                Transfer "{transferModal.gameName}" NFT to another address
              </p>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Recipient Address</label>
                <Input
                  type="text"
                  placeholder="0x..."
                  value={transferAddress}
                  onChange={(e) => setTransferAddress(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ This action cannot be undone. Make sure the recipient address is correct.
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setTransferModal({ open: false, licenseId: '', gameName: '' });
                    setTransferAddress('');
                  }}
                  disabled={transferring}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                  onClick={handleTransfer}
                  disabled={!transferAddress || transferring}
                >
                  {transferring ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Transferring...
                    </>
                  ) : (
                    'Transfer NFT'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}