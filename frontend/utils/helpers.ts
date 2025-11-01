import { Network } from "@aptos-labs/ts-sdk";
import { NetworkInfo, isAptosNetwork } from "@aptos-labs/wallet-adapter-react";

export const isValidNetworkName = (network: NetworkInfo | null) => {
  if (isAptosNetwork(network)) {
    return Object.values<string | undefined>(Network).includes(network?.name);
  }
  // If the configured network is not an Aptos network, i.e is a custom network
  // we resolve it as a valid network name
  return true;
};

// Helper function to convert hex to string
export const hexToString = (hex) => {
  if (!hex) return '';
  const hexString = hex.startsWith('0x') ? hex.slice(2) : hex;
  let str = '';
  for (let i = 0; i < hexString.length; i += 2) {
    const hexChar = hexString.substr(i, 2);
    const charCode = parseInt(hexChar, 16);
    if (charCode > 0 && charCode < 128) {
      str += String.fromCharCode(charCode);
    }
  }
  return str.trim();
}

// Helper function to convert byte array to string
export const arrayToString = (arr) => {
  if (!arr || !Array.isArray(arr)) return '';
  const filtered = arr.filter(n => n > 0 && n < 128);
  return String.fromCharCode(...filtered).trim();
}

export async function checkRegistryInitialized(aptos, MODULE_ADDRESS): Promise<boolean> {
  try {
    // Method 1: Use view function if you added it to Move
    const response = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::license::is_registry_initialized`,
        typeArguments: [],
        functionArguments: [],
      },
    });
    
    return response[0] as boolean;
  } catch (error) {
    console.error('Error checking registry:', error);
    return false;
  }
}