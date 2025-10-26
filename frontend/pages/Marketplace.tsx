// import { useWallet } from "@aptos-labs/wallet-adapter-react";
// import { useState } from "react";
// import { Link } from "react-router-dom"; // ADD THIS
// import { WalletSelector } from "@/components/WalletSelector";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";

// // Replace mockGames here with import from your data file
// import { mockGames } from "@/data/mockGames"; // CHANGE THIS LINE

// const formatPrice = (price) => {
//   return price === 0 ? "Free" : `${price} APT`;
// };

// export function Marketplace() {
//   const { connected } = useWallet();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedGenre, setSelectedGenre] = useState("all");

//   const allGenres = ["all", ...new Set(mockGames.flatMap(game => game.genre))];

//   const filteredGames = mockGames.filter(game => {
//     const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                          game.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesGenre = selectedGenre === "all" || game.genre.includes(selectedGenre);
//     return matchesSearch && matchesGenre;
//   });

//   return (
//     <div className="space-y-8">
//       {!connected && (
//         <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-none text-white">
//           <CardContent className="py-6">
//             <div className="flex flex-col md:flex-row items-center justify-between gap-4">
//               <div>
//                 <h2 className="text-2xl font-bold mb-2">
//                   Connect Your Wallet to Buy Games
//                 </h2>
//                 <p className="opacity-90">
//                   Browse games below, but you'll need to connect a wallet to purchase licenses
//                 </p>
//               </div>
//               <WalletSelector />
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       <div className="text-center space-y-4">
//         <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//           Game Marketplace
//         </h1>
//         <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
//           Discover and purchase blockchain-verified game licenses. True ownership, forever.
//         </p>
//       </div>

//       <div className="flex flex-col md:flex-row gap-4">
//         <div className="flex-1">
//           <Input
//             type="text"
//             placeholder="Search games..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full"
//           />
//         </div>
//         <select 
//           value={selectedGenre} 
//           onChange={(e) => setSelectedGenre(e.target.value)}
//           className="w-full md:w-48 px-3 py-2 border border-input bg-background rounded-md text-sm"
//         >
//           {allGenres.map(genre => (
//             <option key={genre} value={genre}>
//               {genre === "all" ? "All Genres" : genre}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="text-sm text-muted-foreground">
//         Showing {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'}
//       </div>

//       {/* UPDATED SECTION - Add Link wrapper */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredGames.map((game) => (
//           <Link to={`/game/${game.id}`} key={game.id} className="block">
//             <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
//               <div className="relative h-48 overflow-hidden">
//                 <img 
//                   src={game.coverImage} 
//                   alt={game.title}
//                   className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
//                 />
//                 {game.price === 0 && (
//                   <span className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
//                     Free
//                   </span>
//                 )}
//               </div>

//               <CardContent className="p-4 space-y-3">
//                 <h3 className="font-bold text-lg line-clamp-1">{game.title}</h3>

//                 <p className="text-sm text-muted-foreground line-clamp-2">
//                   {game.shortDescription}
//                 </p>

//                 <div className="flex flex-wrap gap-1">
//                   {game.genre.slice(0, 3).map(genre => (
//                     <span key={genre} className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
//                       {genre}
//                     </span>
//                   ))}
//                 </div>

//                 <div className="flex items-center gap-2 text-sm">
//                   <span className="text-yellow-500">★</span>
//                   <span className="font-semibold">{game.rating}</span>
//                   <span className="text-muted-foreground">
//                     ({game.reviewCount.toLocaleString()} reviews)
//                   </span>
//                 </div>

//                 {game.transferable && (
//                   <div className="flex items-center gap-1 text-xs text-blue-600">
//                     <span>🔄</span>
//                     <span>Resellable License</span>
//                   </div>
//                 )}

//                 <div className="flex items-center justify-between pt-2">
//                   <span className="text-2xl font-bold">
//                     {formatPrice(game.price)}
//                   </span>
//                   <Button 
//                     disabled={!connected}
//                     className="bg-gradient-to-r from-blue-600 to-purple-600"
//                     onClick={(e) => {
//                       // Prevent navigation if wallet not connected
//                       if (!connected) {
//                         e.preventDefault();
//                       }
//                     }}
//                   >
//                     {connected ? "Buy Now" : "Connect Wallet"}
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </Link>
//         ))}
//       </div>

//       {filteredGames.length === 0 && (
//         <div className="text-center py-12">
//           <p className="text-xl text-muted-foreground">
//             No games found matching your criteria
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { WalletSelector } from "@/components/WalletSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockGames } from "@/data/mockGames";

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

  const allGenres = ["all", ...new Set(mockGames.flatMap(game => game.genre))];

  const filteredGames = mockGames.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "all" || game.genre.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  // Check which games the user owns
  useEffect(() => {
    if (connected && account) {
      checkOwnedGames();
    }
  }, [connected, account]);

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
            const hex = license.game_id.startsWith('0x') ? license.game_id.slice(2) : license.game_id;
            const bytes = [];
            for (let i = 0; i < hex.length; i += 2) {
              bytes.push(parseInt(hex.substr(i, 2), 16));
            }
            const filtered = bytes.filter(n => n > 0 && n < 128);
            gameId = String.fromCharCode(...filtered).trim();
          } else if (Array.isArray(license.game_id)) {
            const filtered = license.game_id.filter(n => n > 0 && n < 128);
            gameId = String.fromCharCode(...filtered).trim();
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

  // const handleBuyGame = async (e, game) => {
  //   e.preventDefault(); // Prevent navigation
    
  //   if (!account || !wallet.signAndSubmitTransaction) {
  //     alert('Please connect your wallet');
  //     return;
  //   }

  //   setBuyingGame(game.id);

  //   try {
  //     // Convert game ID to byte array
  //     const gameIdBytes = Array.from(new TextEncoder().encode(game.id));
      
  //     // Convert metadata to byte array
  //     const metadata = JSON.stringify({
  //       name: game.title,
  //       image: game.coverImage,
  //       description: game.shortDescription
  //     });
  //     const metadataBytes = Array.from(new TextEncoder().encode(metadata));

  //     const payload = {
  //       type: "entry_function_payload",
  //       function: `${MODULE_ADDRESS}::license::buy_game_license`,
  //       type_arguments: [],
  //       arguments: [
  //         gameIdBytes,
  //         0, // expiry (0 = no expiry)
  //         game.transferable,
  //         metadataBytes
  //       ]
  //     };

  //     console.log('Submitting transaction with payload:', payload);

  //     const response = await wallet.signAndSubmitTransaction({
  //       sender: account.address,
  //       data: payload
  //     });

  //     console.log('Transaction submitted:', response);

  //     // Wait for transaction
  //     const txn = await aptos.waitForTransaction({ 
  //       transactionHash: response.hash 
  //     });

  //     console.log('Transaction confirmed:', txn);

  //     alert(`Successfully purchased ${game.title}!`);
      
  //     // Update ownership
  //     setOwnedGames(prev => new Set([...prev, game.id]));
  //   } catch (error) {
  //     console.error('Purchase error:', error);
  //     console.error('Error details:', error?.message || 'Unknown error');
  //     alert(`Purchase failed: ${error?.message || 'Please try again'}`);
  //   } finally {
  //     setBuyingGame(null);
  //   }
  // };

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
        {filteredGames.map((game) => {
          console.log('Checking ownership for game:', game.id, 'Owned games:', ownedGames);
          const isOwned = ownedGames.has(game.id);

          return (
            <Link 
              to={`/game/${game.id}`} 
              key={game.id} 
              className="block"
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