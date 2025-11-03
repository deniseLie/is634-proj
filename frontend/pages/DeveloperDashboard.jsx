import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect } from "react";
import { HexString } from "aptos";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Plus } from "lucide-react";
import { title } from "process";

// ------------------ APTOS SETUP ------------------
const config = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(config);
const MODULE_ADDRESS =
  import.meta.env.VITE_MODULE_ADDRESS ||
  "0xc5d8f29f688c22ced2b33ba05d7d5241a21ece238ad1657e922251995b059ebc";

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

// ------------------ COMPONENT ------------------
export function DeveloperDashboard() {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [newGame, setNewGame] = useState({
    price: "",
    title: "",
    description: "",
    metadataUri: "",
  });

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
            metadataUri: hexToString(game.metadata_uri),
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

  useEffect(() => {
    fetchGames();
  }, [account?.address]);

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
                  placeholder="Game Title"
                  value={newGame.title}
                  onChange={(e) =>
                    setNewGame({ ...newGame, title: e.target.value })
                  }
                />
                <Input
                  placeholder="Description"
                  value={newGame.description}
                  onChange={(e) =>
                    setNewGame({ ...newGame, description: e.target.value })
                  }
                />
                <Input
                  placeholder="Metadata URI (IPFS / CDN link)"
                  value={newGame.metadataUri}
                  onChange={(e) =>
                    setNewGame({ ...newGame, metadataUri: e.target.value })
                  }
                />
                <Input
                  placeholder="Price in APT"
                  type="number"
                  value={newGame.price}
                  onChange={(e) =>
                    setNewGame({ ...newGame, price: e.target.value })
                  }
                />
                <Button type="submit" disabled={uploading}>
                  {uploading && <Loader2 className="animate-spin mr-2" />}
                  Upload Game
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Game List */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-4">My Games</h2>
              {loading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="animate-spin" />
                </div>
              ) : games.length === 0 ? (
                <p className="text-gray-500">No games uploaded yet.</p>
              ) : (
                <div className="grid gap-4">
                  {games.map((g) => (
                    <div
                      key={g.id}
                      className="flex justify-between items-center border rounded-lg p-3 hover:bg-muted/40 transition"
                    >
                      <div>
                        <h3 className="font-medium">{g.title}</h3>
                        <p className="text-sm text-gray-600">
                          {g.description}
                        </p>
                        <Badge className="mt-1">
                          {g.price} APT
                        </Badge>
                      </div>
                      {/* <Button variant="outline" size="sm">
                        View Details
                      </Button> */}
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
