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
import { arrayToString, hexToString } from "@/utils/helpers"
import { NFTArtwork } from "./NFTArtwork";

// Initialize Aptos client
const config = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(config);

const MODULE_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS || "0xc5d8f29f688c22ced2b33ba05d7d5241a21ece238ad1657e922251995b059ebc";
const VITE_PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || "gateway.pinata.cloud";

// Type definitions for on-chain data
interface LicenseWithGameInfo {
  license_id: string;
  game_id: string;
  owner: string;
  expiry: string;
  transferable: boolean;
  metadata_uri: number[] | string;
  game_title: number[] | string;
  game_description: number[] | string;
  game_price: string;
  game_seller: string;
  game_active: boolean;
}

// Helper to parse license data
const parseLicense = (license: LicenseWithGameInfo): LicenseWithGameInfo => {
  
  return {
    license_id: parseInt(license.license_id),
    game_id: parseInt(license.game_id),
    owner: license.owner,
    expiry: parseInt(license.expiry),
    transferable: license.transferable,
    metadata_uri: hexToString(license.metadata_uri).replace("gateway.pinata.cloud", VITE_PINATA_GATEWAY),
    game_title: hexToString(license.game_title),
    game_description: hexToString(license.game_description),
    game_price: license.game_price / 1_000_000_000,
    game_seller: license.game_seller,
    game_active: license.game_active
  };
};

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
          function: `${MODULE_ADDRESS}::license::get_user_licenses_with_games`,
          typeArguments: [],
          functionArguments: [account.address],
        },
      });
      console.log('Respnse from get_user_licenses_with_games:', response);

      const rawLicenses = response[0] as LicenseWithGameInfo[];
      const parsedLicenses = rawLicenses.map(parseLicense);
    
      console.log('Parsed licenses:', parsedLicenses);
      setLicenses(parsedLicenses);
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
  // const getGameDetails = (gameId: string) => {
  //   return mockGames.find(g => g.id === gameId);
  // };

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
                      src={license?.metadata_uri || 'https://via.placeholder.com/400x200'} 
                      alt={license?.game_title || 'Untitled Game'}
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
                      {license?.game_title || 'Untitled Game'}
                    </h3>
                    {license.genre && (
                      <div className="flex flex-wrap gap-1">
                        {license.genre.slice(0, 2).map(genre => (
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
                        gameName: license?.game_title || gameId,
                        gameImage: license?.coverImage || 'https://via.placeholder.com/400x200'
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
                          gameName: license?.game_title || gameId
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
                    <p className="text-white font-mono font-bold">#{viewNFTModal.license_id}</p>
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