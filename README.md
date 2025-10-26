# 🎮 Aegis - Blockchain Game Marketplace

A decentralized game marketplace built on Aptos blockchain where users can purchase, own, and trade game licenses using cryptocurrency. True digital ownership powered by blockchain technology.

## 🌟 Features

- **Browse Games** - Explore a marketplace of blockchain-verified game licenses
- **Purchase with Crypto** - Buy games using APT (Aptos cryptocurrency)
- **True Ownership** - Your game licenses are stored on the blockchain
- **Resellable Licenses** - Transfer or trade your game licenses to other users
- **Game Launcher** - Access and launch your owned games from a dedicated launcher
- **License Management** - View and manage all your game licenses in one place

## 🛠️ Technology Stack

- **Blockchain**: Aptos (Move Language)
- **Frontend**: React + TypeScript + Vite
- **Wallet Integration**: Aptos Wallet Adapter (Petra, Martian, etc.)
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Smart Contracts**: Move

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Aptos CLI](https://aptos.dev/en/build/cli)
- [Petra Wallet](https://petra.app/) (browser extension)

## 🚀 Getting Started

### 1. Install Aptos CLI
```bash
brew install aptos
```

### 2. Initialize Aptos Account
```bash
aptos init
aptos init --network devnet (use the secret key here)
```

This will create a new account and save the configuration in `.aptos/config.yaml`.

### 3. Fund Your Account

Get test APT tokens from the faucet:
```bash
aptos account fund-with-faucet --account default
```

Or visit: https://aptos.dev/en/network/faucet

### 4. Deploy Smart Contract

Navigate to the contract directory and compile:
```bash
cd contract
aptos move compile --named-addresses aegis_addr=<YOUR_ACCOUNT_ADDRESS>
```

Deploy the contract:
```bash
aptos move publish --named-addresses aegis_addr=<YOUR_ACCOUNT_ADDRESS>
```

Replace `<YOUR_ACCOUNT_ADDRESS>` with your actual account address from step 2.

### 5. Configure Frontend

Create a `.env` file in the project root:
```env
VITE_MODULE_ADDRESS=<YOUR_DEPLOYED_CONTRACT_ADDRESS>
VITE_SELLER_ADDRESS=<YOUR_ACCOUNT_ADDRESS>
VITE_NETWORK=devnet
```

### 6. Install Dependencies
```bash
npm install
```

### 7. Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🔧 Setup Petra Wallet

1. Install [Petra Wallet](https://petra.app/) browser extension
2. Create a new wallet or import existing one
3. Switch to **Devnet** network (click network dropdown in Petra)
4. Fund your Petra wallet from https://aptos.dev/en/network/faucet
5. Connect wallet to the app

## 📖 Usage

### Buying a Game

1. Connect your Petra wallet
2. Browse the marketplace
3. Click on a game to view details
4. Click "Buy Now" and approve the transaction
5. Game license will appear in "My Licenses"

### Launching a Game

1. Go to the "Launcher" page
2. Click on any owned game
3. License verification happens on-chain
4. Game launches (demo simulation)

### Transferring a License

1. Go to "My Licenses"
2. Find a transferable game
3. Click the transfer icon
4. Enter recipient's address
5. Confirm the transaction

## 🏗️ Project Structure
```
├── contract/                 # Move smart contracts
│   ├── sources/
│   │   └── aegis_v2.move    # Main license contract
│   └── Move.toml
├── src/
│   ├── components/          # React components
│   ├── pages/               # Page components
│   │   ├── Marketplace.tsx  # Game marketplace
│   │   ├── GameDetail.tsx   # Game details page
│   │   ├── MyLicenses.tsx   # User's licenses
│   │   └── Launcher.tsx     # Game launcher
│   ├── data/
│   │   └── mockGames.ts     # Game data
│   └── App.tsx
└── README.md
```

## 🔐 Smart Contract Functions

### User Functions

- `buy_game_license()` - Purchase a game license (free demo version)
- `transfer_license()` - Transfer license to another user
- `get_user_licenses()` - View all owned licenses
- `has_game_license()` - Check if user owns a specific game

### Admin Functions

- `initialize_registry()` - Initialize game registry
- `list_game()` - List a game for sale (with payment version)

## 🧪 Testing

### Test Purchase Flow

1. Ensure you have Devnet APT
2. Connect wallet on Devnet
3. Browse marketplace and purchase a free game
4. Check "My Licenses" to verify ownership

### Test Transfer Flow

1. Get a second wallet address
2. Transfer a license from "My Licenses"
3. Verify on Aptos Explorer

## 🌐 Networks

- **Devnet** (Development): Testing and development
- **Testnet** (Staging): Pre-production testing
- **Mainnet** (Production): Live network (not deployed yet)

Current deployment: **Devnet**

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_MODULE_ADDRESS` | Deployed contract address | `0xc5d8f...` |
| `VITE_SELLER_ADDRESS` | Registry owner address | `0xc5d8f...` |
| `VITE_NETWORK` | Aptos network | `devnet` |

## 🐛 Troubleshooting

### "Wrong Network" Error
- Ensure Petra wallet is set to Devnet
- Check `.env` has `VITE_NETWORK=devnet`

### Balance Shows 0
- Switch Petra to Devnet network
- Import your CLI account to Petra using private key
- Fund account from faucet

### Transaction Fails
- Ensure sufficient APT for gas fees
- Check wallet is connected
- Verify you're on the correct network

### "Module not found" Error
- Redeploy the contract
- Update `VITE_MODULE_ADDRESS` in `.env`
- Restart dev server

## 🔗 Useful Links

- [Aptos Documentation](https://aptos.dev)
- [Aptos Devnet Faucet](https://aptos.dev/en/network/faucet)
- [Petra Wallet](https://petra.app/)
- [Move Language Guide](https://move-language.github.io/move/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Built by Group 2 for IS634 Web3 Project

## 🙏 Acknowledgments

- Aptos Labs for the blockchain infrastructure
- shadcn/ui for the component library
- SMU MITB Program

---

**Note**: This is a demonstration project for educational purposes. Game licenses are simulated and have no real-world value.