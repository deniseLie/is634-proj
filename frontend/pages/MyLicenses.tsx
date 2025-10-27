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
          <h1 className="text-4xl font-bold mb-2">My Game Licenses</h1>
          <p className="text-muted-foreground">
            You own {licenses.length} {licenses.length === 1 ? 'license' : 'licenses'}
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
            <h3 className="text-2xl font-semibold">No Licenses Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You haven't purchased any games yet. Visit the marketplace to get your first blockchain-verified game license!
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
              <Card key={license.license_id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={game?.coverImage || 'https://via.placeholder.com/400x200'} 
                    alt={game?.title || gameId}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Owned
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <h3 className="font-bold text-lg line-clamp-1">
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

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">License ID:</span>
                      <span className="font-mono">#{license.license_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transferable:</span>
                      <span className={license.transferable ? 'text-green-600' : 'text-red-600'}>
                        {license.transferable ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {license.expiry !== '0' && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expires:</span>
                        <span>
                          {new Date(parseInt(license.expiry) * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                      onClick={() => navigate("/launcher")}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </Button>
                    {license.transferable && (
                      <Button 
                        variant="outline"
                        size="icon"
                        onClick={() => setTransferModal({
                          open: true,
                          licenseId: license.license_id,
                          gameName: game?.title || gameId
                        })}
                        title="Transfer License"
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

      {/* Transfer Modal */}
      {transferModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-2xl font-bold">Transfer License</h3>
              <p className="text-muted-foreground">
                Transfer "{transferModal.gameName}" to another address
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
                    'Transfer'
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