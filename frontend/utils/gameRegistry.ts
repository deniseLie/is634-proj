// utils/gameRegistry.ts
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

const MODULE_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS;

// Helper to convert price from APT to Octas
export const aptToOctas = (apt: number): number => {
  return Math.floor(apt * 100000000);
};

// Simplified purchase flow - no pre-listing required!
export const purchaseGame = async (
  signAndSubmitTransaction: any,
  account: any,
  game: any
) => {
  try {
    // Convert game ID to byte array
    const gameIdBytes = Array.from(new TextEncoder().encode(game.id));
    
    // Convert metadata URI to byte array
    const metadataBytes = Array.from(
      new TextEncoder().encode(JSON.stringify({
        name: game.title,
        image: game.coverImage,
        description: game.shortDescription
      }))
    );

    // Simple direct purchase - creates license directly
    const payload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::license::buy_game_license`,
      type_arguments: [],
      arguments: [
        gameIdBytes,
        0, // expiry (0 = no expiry)
        game.transferable,
        metadataBytes
      ]
    };

    const response = await signAndSubmitTransaction({
      sender: account.address,
      data: payload
    });

    // Wait for transaction
    await aptos.waitForTransaction({ 
      transactionHash: response.hash 
    });

    return { success: true, hash: response.hash };
  } catch (error) {
    console.error('Purchase error:', error);
    return { success: false, error };
  }
};

// Check if user owns a game
export const checkGameOwnership = async (
  userAddress: string,
  gameId: string
): Promise<boolean> => {
  try {
    const gameIdBytes = Array.from(new TextEncoder().encode(gameId));
    
    const response = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::license::has_game_license`,
        typeArguments: [],
        functionArguments: [userAddress, gameIdBytes],
      },
    });

    return response[0] as boolean;
  } catch (error) {
    console.error('Ownership check error:', error);
    return false;
  }
};