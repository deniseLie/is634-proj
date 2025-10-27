// components/WelcomeScreen.tsx
import { WalletSelector } from "./WalletSelector";
import { Card, CardContent } from "./ui/card";

export function WelcomeScreen() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-6 text-center space-y-6">
          {/* Hero Section */}
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to Aegis
            </h1>
            <p className="text-xl text-muted-foreground">
              Decentralized Game Ownership & DRM Platform
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-4 py-8">
            <div className="space-y-2">
              <div className="text-3xl">🎮</div>
              <h3 className="font-semibold">True Ownership</h3>
              <p className="text-sm text-muted-foreground">
                Your games, stored on blockchain, forever
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">🔄</div>
              <h3 className="font-semibold">Resell Games</h3>
              <p className="text-sm text-muted-foreground">
                Trade your licenses on secondary market
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">🔒</div>
              <h3 className="font-semibold">Secure DRM</h3>
              <p className="text-sm text-muted-foreground">
                Blockchain-verified ownership rights
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4 pt-4">
            <p className="text-lg font-medium">
              Connect your wallet to get started
            </p>
            <div className="flex justify-center">
              <WalletSelector />
            </div>
            <p className="text-sm text-muted-foreground">
              Don't have an Aptos wallet? Download Petra or Martian wallet to begin
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}