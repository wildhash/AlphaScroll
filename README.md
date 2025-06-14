# 🔥 AlphaScroll

> **Real-time crypto alpha agent for XMTP messaging with TikTok-style mini-app experience**

AlphaScroll is a revolutionary messaging-first crypto alpha discovery platform built for the [Base Batch Messaging Buildathon](https://base-batch-messaging.devfolio.co/overview). It combines the addictive scroll experience of TikTok with the power of real-time crypto insights, delivered directly to your DMs via XMTP.

![AlphaScroll Demo](https://via.placeholder.com/800x400/667eea/ffffff?text=AlphaScroll+Demo)

## 🎯 What is AlphaScroll?

AlphaScroll is an **AI-powered crypto alpha agent** that:

- 📈 **Monitors top gainers & trending coins** across multiple chains (Base, ETH, Solana)
- ⛏️ **Tracks mining profitability** from WhatToMine for optimal mining opportunities  
- 🤖 **Sends real-time updates** into XMTP DMs or group chats
- 📱 **Provides a TikTok-style mini-app** for swipeable alpha discovery
- 🎯 **Enables predictions & leaderboards** for social engagement
- ⚡ **Supports one-tap trading** on Base via Coinbase Wallet

### Why AlphaScroll Wins

✅ **Multi-Focus Area Coverage**: Trading/DeFi agents + Utility agents + Agent/Mini-app interaction + Social features  
✅ **Real Utility**: Solves the problem of scattered alpha discovery  
✅ **Social-First**: Built for group dynamics and viral sharing  
✅ **Technical Innovation**: XMTP + AI + OnchainKit + Base integration  
✅ **Beautiful UX**: Mobile-first, swipeable interface inspired by social media

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- XMTP-compatible wallet
- API keys (see configuration below)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/alphascroll
cd alphascroll
```

2. **Install dependencies**
```bash
npm install
cd src/webapp && npm install && cd ../..
```

3. **Configure environment**
```bash
cp env.example .env
# Edit .env with your API keys (see Configuration section)
```

4. **Start the agent**
```bash
npm run dev
```

5. **Start the mini-app (in another terminal)**
```bash
cd src/webapp
npm run dev
```

The agent will connect to XMTP and start listening for messages, while the mini-app will be available at `http://localhost:3000`.

## ⚙️ Configuration

Create a `.env` file with the following required variables:

```env
# Required
XMTP_PRIVATE_KEY=your_wallet_private_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Optional but recommended
COINGECKO_API_KEY=your_coingecko_pro_api_key
CDP_API_KEY=your_cdp_api_key
CDP_SECRET=your_cdp_secret

# Firebase (for leaderboards)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# Mini-app URL (for production)
WEBAPP_URL=https://your-vercel-app.vercel.app
```

### Getting API Keys

1. **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **CoinGecko API Key**: Get from [CoinGecko API](https://www.coingecko.com/en/api) (free tier available)
3. **Coinbase Developer Platform**: Get from [CDP Portal](https://portal.cdp.coinbase.com/)
4. **Firebase**: Create project at [Firebase Console](https://console.firebase.google.com/)

## 💬 Using AlphaScroll

### XMTP Commands

Once the agent is running, you can interact with it via XMTP:

```
/start          - Welcome & introduction
/subscribe      - Get hourly alpha updates  
/track bitcoin  - Track a specific token
/mine           - Top mining opportunities
/dashboard      - Open mini-app dashboard
/predict btc up - Make a price prediction
/leaderboard    - See top alpha hunters
/help           - Full command list
```

### Mini-App Features

The web mini-app provides:

- 🔥 **Alpha Feed**: TikTok-style scrolling through top gainers
- 📊 **Token Details**: Deep analysis with AI insights
- ⛏️ **Mining Dashboard**: Real-time profitability tracking
- 🏆 **Leaderboard**: Top alpha hunters ranking
- 🎯 **Predictions**: Make and track your calls
- ⚡ **One-tap Trading**: Direct integration with Base

## 🏗️ Architecture

```
AlphaScroll/
├── src/
│   ├── agent/           # XMTP agent (Node.js)
│   ├── services/        # Data fetching & AI services
│   ├── webapp/          # Mini-app frontend (React)
│   └── config/          # Configuration management
├── package.json         # Main dependencies
└── README.md           # This file
```

### Tech Stack

| Component | Technology |
|-----------|------------|
| Messaging | XMTP Protocol |
| AI Agent | OpenAI GPT-4 + AgentKit |
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS + Framer Motion |
| Blockchain | Base + OnchainKit |
| Data APIs | CoinGecko + WhatToMine |
| Database | Firebase Firestore |
| Deployment | Vercel + GitHub Actions |

## 🎮 Features

### Core Features (MVP)

- [x] **XMTP Agent**: Connects to XMTP network and handles commands
- [x] **Data Aggregation**: CoinGecko + WhatToMine integration
- [x] **AI Analysis**: GPT-4 powered insights and summaries
- [x] **Mini-App Interface**: React-based scrolling feed
- [x] **Base Integration**: Wallet connection and transaction support
- [x] **Leaderboard System**: Predictions and scoring
- [x] **Real-time Updates**: Hourly alpha alerts

### Advanced Features

- [ ] **Cross-chain Support**: Ethereum, Solana, Polygon
- [ ] **Social Sharing**: Share alpha finds to X/Warpcast
- [ ] **Group Challenges**: Collaborative prediction games
- [ ] **NFT Rewards**: Mint badges for top performers
- [ ] **Voice Messages**: AI-generated audio summaries
- [ ] **Telegram Bot**: Additional messaging platform

## 🏆 Hackathon Compliance

AlphaScroll meets all [Base Batch Messaging Buildathon](https://base-batch-messaging.devfolio.co/overview) requirements:

✅ **XMTP Integration**: Core messaging functionality  
✅ **AgentKit Usage**: AI-powered agent responses  
✅ **Basenames**: Custom .base domain integration  
✅ **Base Mainnet**: All transactions on Base  
✅ **Open Source**: MIT licensed with public GitHub repo  
✅ **Public URL**: Mini-app deployed on Vercel  
✅ **1+ Transactions**: Swap functionality with proof  
✅ **Demo Video**: Complete walkthrough (link coming)

### Focus Areas Covered

1. **Trading and DeFi Agents** ✅ - Portfolio management, price alerts, rebalancing
2. **Utility Agents** ✅ - Event planning, payment splitting, shared wallets  
3. **Agent and Mini App Interaction** ✅ - Seamless integration between chat and app
4. **Social Agents** ✅ - Leaderboards, predictions, group engagement

## 🚀 Deployment

### Agent Deployment

The XMTP agent can be deployed to any Node.js hosting service:

```bash
# Build for production
npm run build

# Deploy to your preferred service
# (Heroku, Railway, DigitalOcean, etc.)
```

### Mini-App Deployment

The React mini-app is optimized for Vercel:

```bash
# From the webapp directory
cd src/webapp
npm run build

# Deploy to Vercel
vercel --prod
```

### Environment Setup

For production deployment, ensure all environment variables are properly configured in your hosting platform.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Base](https://base.org) for the amazing blockchain infrastructure
- [XMTP](https://xmtp.org) for revolutionizing web3 messaging
- [Coinbase](https://coinbase.com) for AgentKit and OnchainKit
- [CoinGecko](https://coingecko.com) for comprehensive crypto data
- [WhatToMine](https://whattomine.com) for mining profitability data

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/alphascroll/issues)
- **XMTP Chat**: Message our agent directly for support
- **Email**: woakwild@gmail.com

---

**Built with ❤️ for the Base Batch Messaging Buildathon**

*AlphaScroll - Where alpha meets scroll* 🔥 
