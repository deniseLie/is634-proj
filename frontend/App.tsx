import { useContext } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { UserContext } from "@/context/UserContext";

// Layout Components
import { Header } from "@/components/Header";
import { TopBanner } from "@/components/TopBanner";

// Page Components
import { Marketplace } from "@/pages/Marketplace";
import { MyLicenses } from "@/pages/MyLicenses";
import { GameDetail } from "@/pages/GameDetail";
import { Launcher } from "@/pages/Launcher";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { DeveloperDashboard } from "@/pages/DeveloperDashboard";

function App() {
  const { connected } = useWallet();
  const { user } = useContext(UserContext);

  return (
    <Router>
      <div className="min-h-screen bg-background flex flex-col">
        {/* <TopBanner /> */}
        <Header />
        
        <main className="container mx-auto px-4 py-8 flex-1">
          {!connected ? (
            // Show welcome screen if wallet not connected
            <WelcomeScreen />
          ) : (
            // Show routes if wallet is connected
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Marketplace />} />
              <Route path="/game/:gameId" element={<GameDetail />} />
              
              {/* Protected Routes - Require Wallet Connection */}
              <Route path="/my-licenses" element={<MyLicenses />} />
              <Route path="/launcher" element={<Launcher />} />

              {/* Game Developer Routes */}
              {user && user.role === "developer" && (
                <Route path="/dev-dashboard" element={<DeveloperDashboard />} />
              )}
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          )}
        </main>
        
        {/* Optional Footer */}
        <footer className="border-t mt-auto py-6 text-center text-sm text-muted-foreground">
          <p>Aegis DRM + 6 Marketplace - Powered by Aptos</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;