// pages/MyLicenses.tsx
import { useWallet } from "@aptos-labs/wallet-adapter-react";
//import { LicenseCard } from "@/components/LicenseCard";

export function MyLicenses() {
  const { account } = useWallet();
  
  // TODO: Fetch licenses from blockchain
  
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">My Game Licenses</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* License cards will go here */}
      </div>
    </div>
  );
}