import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect } from "react";
import { HexString } from "aptos";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Plus, Upload, Image as ImageIcon } from "lucide-react";

// ------------------ APTOS SETUP ------------------
const config = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(config);
const MODULE_ADDRESS =
  import.meta.env.VITE_MODULE_ADDRESS ||
  "0xc5d8f29f688c22ced2b33ba05d7d5241a21ece238ad1657e922251995b059ebc";

// ------------------ PINATA CONFIG ------------------
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || "YOUR_PINATA_API_KEY";
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || "YOUR_PINATA_SECRET_KEY";
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || "YOUR_PINATA_JWT";
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || "gateway.pinata.cloud";

// ------------------ HELPER ------------------
const arrayToString = (arr) => {
  try {
    if (typeof arr === "string") return arr;
    const filtered = arr.filter((n) => n > 0 && n < 128);
    return String.fromCharCode(...filtered).trim();
  } catch {
    return "";
  }
};

function hexToString(hex) {
  // Remove '0x' prefix if present
  const hexString = hex.startsWith('0x') ? hex.slice(2) : hex;
  
  // Convert hex pairs to characters
  let str = '';
  for (let i = 0; i < hexString.length; i += 2) {
    const hexChar = hexString.substr(i, 2);
    str += String.fromCharCode(parseInt(hexChar, 16));
  }
  
  return str;
}

// ------------------ PINATA UPLOAD ------------------
const uploadToPinata = async (file) => {
  try {
    const formData = new FormData();

    // Build form data
    formData.append('file', file); 
    formData.append("pinataMetadata", JSON.stringify({ name: file.name }));
    formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

    // Use JWT authentication (recommended)
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });
    console.log("Response from Pinata:", response);

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('data from Pinata:', data);

    const ipfsUrl = `https://${PINATA_GATEWAY}/ipfs/${data.IpfsHash}`;
    
    return {
      ipfsHash: data.IpfsHash,
      ipfsUrl: ipfsUrl,
    };
  } catch (error) {
    console.error('Pinata upload error:', error);
    throw error;
  }
};

// ------------------ COMPONENT ------------------
export function DeveloperDashboard() {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [newGame, setNewGame] = useState({
    price: "",
    title: "",
    description: "",
    metadataUri: "",
  });

  useEffect(() => {
    fetchGames();
  }, [account?.address]);


  // ------------------ FETCH GAMES ------------------
  const fetchGames = async () => {
    if (!account?.address) return;
    setLoading(true);
    try {
      console.log('im here fetchGames');
      // Example: read on-chain developer’s games
      const resources = await aptos.getAccountResources({
        accountAddress: MODULE_ADDRESS,
      });
      console.log('resources', resources);

      // Get Game Registry
      let gameStore = resources.find((r) =>
        r.type.includes("::license::GameRegistry")
      );
      console.log('gameStore', gameStore);

      if (!gameStore) {
        try {
          
          // initialize registry
          const payload = {
            function: `${MODULE_ADDRESS}::license::initialize_registry`,
            type_arguments: [],
            functionArguments: [],
          };
          console.log('payload', payload);

          const response = await signAndSubmitTransaction({ 
            sender: account.address,
            data: payload
          });
          console.log('response', response);

          const txn = await aptos.waitForTransaction({ transactionHash: response.hash });
          console.log('Transaction confirmed:', txn);

          console.log("Registry initialized!");
          
          // get game registry again
          gameStore = resources.find((r) =>
            r.type.includes("::license::GameRegistry")
          );

          console.log('gameStore after init', gameStore);
        
        // ERROR
        } catch (e) {
          console.error("Init registry error:", e);
          console.warn("Game registry not found.");
          setGames([]);
          setLoading(false);
          return;
        }
      }

      if (!gameStore || gameStore === undefined || gameStore.data === null) {
          setGames([]);
          return;
      }

      // Get the games table handle
      const tableHandle_devgames = gameStore?.data.dev_games.handle;
      const addressHex = HexString.fromUint8Array(account.address.data).toString();
      console.log('tableHandle (dev games)', tableHandle_devgames);
      console.log('addressHex', addressHex);

      // Get all game IDs for the connected wallet
      let devGames = [];
      try {
        devGames = await aptos.getTableItem({
          handle: tableHandle_devgames, // registry.dev_games handle
          data: {
            key_type: "address", // Key is the developer's address
            value_type: "vector<u64>",  // Value is a vector of game IDs
            key: addressHex,
          }
        });
      } catch (e) {
        console.error('e : ', e)
        console.warn("No games found for developer:", addressHex);
        setGames([]);
        setLoading(false);
        return;
      }

      console.log('devGames', devGames);

      // Get all keys in table (Aptos supports table items query only by key
      const myGames = []
      const tableHandle_game = gameStore.data.games.handle;

      for (const gameId  of devGames) {
        try {

          // Query the games table with the game ID
          const game = await aptos.getTableItem({
            handle: tableHandle_game,
            data: {
              key_type: "u64", // Game ID is u64
              value_type: `${MODULE_ADDRESS}::license::GameInfo`, // Value is GameInfo struct
              key: gameId, // Use the game ID as key
            }
          });
          console.log('game', game);

          myGames.push({
            title: hexToString(game.title),
            description: hexToString(game.description),
            metadataUri: hexToString(game.metadata_uri).replace("gateway.pinata.cloud", PINATA_GATEWAY),
            price: game.price / 1_000_000,
          });
        } catch (e) {
          // game not found, skip
          console.error("e : ", e);
        }
      }

      setGames(myGames);
    } catch (err) {
      console.error("Fetch games error:", err);
    }
    setLoading(false);
  };

  // ------------------ IMAGE UPLOAD ------------------
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    try {
      setImageUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to Pinata
      const result = await uploadToPinata(file);
      
      // Set the IPFS URL as metadata URI
      setNewGame({ ...newGame, metadataUri: result.ipfsUrl });
      
      alert(`Image uploaded successfully! IPFS Hash: ${result.ipfsHash}`);
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image to IPFS. Please check your Pinata credentials.');
    } finally {
      setImageUploading(false);
    }
  };

  // ------------------ REGISTER GAME ------------------
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!connected || !account) return alert("Connect your wallet first!");

    try {
      setUploading(true);

      const payload = {
        function: `${MODULE_ADDRESS}::license::register_game`,
        type_arguments: [],
        functionArguments: [
          // newGame.id,     // game id
          Math.floor(parseFloat(newGame.price) * 1_000_000), // rice (in APT)
          newGame.title,
          newGame.description,
          newGame.metadataUri,
        ],
      };

      const response = await signAndSubmitTransaction({ 
        sender: account.address,
        data: payload
      });
      console.log('response', response);
      
      const txn = await aptos.waitForTransaction({ transactionHash: response.hash });
      console.log('Transaction confirmed:', txn);

      alert("Game uploaded successfully!");
      setNewGame({ id: 0, price: "", title: "", description: "", metadataUri: "" });
      setImagePreview(null);
      fetchGames();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload game.");
    } finally {
      setUploading(false);
    }
  };

  // ------------------ UI ------------------
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Package size={24} /> Developer Dashboard
      </h1>

      {!connected ? (
        <p className="text-gray-600">Please connect your Aptos wallet.</p>
      ) : (
        <>
          {/* Upload Form */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Plus size={18} /> Register New Game
              </h2>
              <form onSubmit={handleRegister} className="space-y-3">
                {/* <Input
                  placeholder="Unique Game ID (e.g. 'cool_game_01')"
                  value={newGame.id}
                  onChange={(e) =>
                    setNewGame({ ...newGame, id: e.target.value })
                  }
                  required
                /> */}
                <Input
                  placeholder="Game Title*"
                  value={newGame.title}
                  onChange={(e) =>
                    setNewGame({ ...newGame, title: e.target.value })
                  }
                />
                <Input
                  placeholder="Description*"
                  value={newGame.description}
                  onChange={(e) =>
                    setNewGame({ ...newGame, description: e.target.value })
                  }
                />
{/* 
                <Input
                  placeholder="Metadata URI (IPFS link)"
                  value={newGame.metadataUri}
                  onChange={(e) =>
                    setNewGame({ ...newGame, metadataUri: e.target.value })
                  }
                /> */}
                <Input
                  placeholder="Price in APT*"
                  type="number"
                  value={newGame.price}
                  onChange={(e) =>
                    setNewGame({ ...newGame, price: e.target.value })
                  }
                />

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Game Cover Image
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-upload').click()}
                      disabled={imageUploading}
                      className="w-full"
                    >
                      {imageUploading ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={18} />
                          Uploading to IPFS...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2" size={18} />
                          Upload Image to Pinata
                        </>
                      )}
                    </Button>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  
                  {imagePreview && (
                    <div className="mt-2 relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <Badge className="absolute top-2 right-2 bg-green-500">
                        Uploaded to IPFS
                      </Badge>
                    </div>
                  )}
                </div>

                {/* SUBMIT */}
                <Button type="submit" disabled={uploading}>
                  {uploading && <Loader2 className="animate-spin mr-2" />}
                  Upload Game
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Game List */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">My Games</h2>
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : games.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground text-lg">No games uploaded yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Upload your first game to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {games.map((g) => (
                    <div
                      key={g.id}
                      className="group relative overflow-hidden rounded-xl border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Cover image */}
                      <div className="relative aspect-video w-full overflow-hidden bg-muted">
                        {g.metadataUri ? (
                          <img
                            src={g.metadataUri}
                            alt={g.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"%3E%3Crect fill="%23f1f5f9" width="400" height="225"/%3E%3Ctext fill="%2394a3b8" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{g.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
                          {g.description}
                        </p>
                        
                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">
                            {g.price} APT
                          </span>
                          {g.metadataUri && (
                            <a
                              href={g.metadataUri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <span>View IPFS</span>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
