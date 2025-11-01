import "../vite.polyfills";
import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "@/App.tsx";
// Internal components
import { Toaster } from "@/components/ui/toaster.tsx";
import { WalletProvider } from "@/components/WalletProvider.tsx";
import { WrongNetworkAlert } from "@/components/WrongNetworkAlert";

import { UserProvider } from "./context/UserContext";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UserProvider>
      <WalletProvider>
        <QueryClientProvider client={queryClient}>
          <App />
          <WrongNetworkAlert />
          <Toaster />
        </QueryClientProvider>
      </WalletProvider>
    </UserProvider>
  </React.StrictMode>,
);
