// components/Header.tsx
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Link, useLocation } from "react-router-dom";
import { WalletSelector } from "./WalletSelector";
import { Button } from "./ui/button";

export function Header() {
  const { connected } = useWallet();
  const location = useLocation();

  return (
    <header className="border-b">
      <div className="bg-yellow-600 container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
          🎮 Arcadia
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <Link to="/">
            <Button 
              variant={location.pathname === "/" ? "default" : "ghost"}
            >
              Marketplace
            </Button>
          </Link>
          
          {connected && (
            <>
              <Link to="/my-licenses">
                <Button 
                  variant={location.pathname === "/my-licenses" ? "default" : "ghost"}
                >
                  My Licenses
                </Button>
              </Link>
              
              <Link to="/launcher">
                <Button 
                  variant={location.pathname === "/launcher" ? "default" : "ghost"}
                >
                  Launcher
                </Button>
              </Link>
            </>
          )}
          
          {/* Wallet Connect */}
          <WalletSelector />
        </nav>
      </div>
    </header>
  );
}