import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Layout Components
import { Header } from "@/components/Header";
import { TopBanner } from "@/components/TopBanner";

// Page Components
import { Marketplace } from "@/pages/Marketplace";
import { MyLicenses } from "@/pages/MyLicenses";
import { GameDetail } from "@/pages/GameDetail";
import { Launcher } from "@/pages/Launcher";

function App() {
  const { connected } = useWallet();

  return (
    <Router>
      <div className="min-h-screen bg-background">
        {/* <TopBanner /> */}
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            Public Routes
            <Route path="/" element={<Marketplace />} />
            <Route path="/game/:gameId" element={<GameDetail />} />
            
            {/* Protected Routes - Require Wallet Connection */}
            <Route 
              path="/my-licenses" 
              element={connected ? <MyLicenses /> : <Navigate to="/" />} 
            />
            <Route 
              path="/launcher" 
              element={connected ? <Launcher /> : <Navigate to="/" />} 
            />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        
        {/* Optional Footer */}
        <footer className="border-t mt-auto py-6 text-center text-sm text-muted-foreground">
          <p>Aegis DRM + Arcadia Marketplace - Powered by Aptos</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;