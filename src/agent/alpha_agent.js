#!/usr/bin/env node

/**
 * 🔥 AlphaScroll - XMTP Agent
 * 
 * Core messaging agent that:
 * - Connects to XMTP network
 * - Handles user commands (/track, /mine, /dashboard, etc.)
 * - Sends periodic alpha updates
 * - Integrates with AI for insights
 * - Manages mini-app interactions
 */

const { Client } = require('@xmtp/xmtp-js');
const { Wallet } = require('ethers');
const cron = require('node-cron');
const { DataFetcher } = require('../services/data_fetcher');
const { AIAgent } = require('../services/ai_agent');
const { LeaderboardManager } = require('../services/leaderboard');
const { config } = require('../config/config');

class AlphaScrollAgent {
  constructor() {
    this.client = null;
    this.wallet = null;
    this.dataFetcher = new DataFetcher();
    this.aiAgent = new AIAgent();
    this.leaderboard = new LeaderboardManager();
    this.activeSubscriptions = new Map(); // userAddress -> preferences
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log('🚀 Starting AlphaScroll Agent...');
      
      // Initialize wallet
      this.wallet = new Wallet(config.XMTP_PRIVATE_KEY);
      console.log(`📱 Agent wallet: ${this.wallet.address}`);

      // Initialize XMTP client
      this.client = await Client.create(this.wallet, { env: config.XMTP_ENV });
      console.log('✅ XMTP client connected');

      // Initialize services
      await this.dataFetcher.initialize();
      await this.aiAgent.initialize();
      await this.leaderboard.initialize();

      this.isInitialized = true;
      console.log('🎯 AlphaScroll Agent ready for alpha hunting!');

      // Start listening for messages
      this.startMessageListener();
      
      // Start periodic alpha updates
      this.startPeriodicUpdates();

    } catch (error) {
      console.error('❌ Failed to initialize AlphaScroll Agent:', error);
      process.exit(1);
    }
  }

  async startMessageListener() {
    console.log('👂 Listening for XMTP messages...');
    
    for await (const message of await this.client.conversations.streamAllMessages()) {
      try {
        await this.handleMessage(message);
      } catch (error) {
        console.error('❌ Error handling message:', error);
      }
    }
  }

  async handleMessage(message) {
    const senderAddress = message.senderAddress;
    const content = message.content.trim();
    
    console.log(`📨 Message from ${senderAddress}: ${content}`);

    // Ignore messages from self
    if (senderAddress === this.wallet.address) return;

    // Parse commands
    if (content.startsWith('/')) {
      await this.handleCommand(message, content);
    } else {
      // Handle natural language queries
      await this.handleNaturalLanguage(message, content);
    }
  }

  async handleCommand(message, content) {
    const [command, ...args] = content.toLowerCase().split(' ');
    const senderAddress = message.senderAddress;

    switch (command) {
      case '/start':
        await this.handleStart(message);
        break;
      
      case '/subscribe':
        await this.handleSubscribe(message);
        break;
      
      case '/unsubscribe':
        await this.handleUnsubscribe(message);
        break;
      
      case '/track':
        await this.handleTrack(message, args);
        break;
      
      case '/mine':
        await this.handleMine(message);
        break;
      
      case '/dashboard':
        await this.handleDashboard(message);
        break;
      
      case '/leaderboard':
        await this.handleLeaderboard(message);
        break;
      
      case '/predict':
        await this.handlePredict(message, args);
        break;
      
      case '/help':
        await this.handleHelp(message);
        break;
      
      default:
        await this.sendMessage(message.conversation, 
          "🤔 I don't recognize that command. Try /help to see available commands!");
    }
  }

  async handleStart(message) {
    const welcomeMessage = `
🔥 **Welcome to AlphaScroll!** 🔥

I'm AlphaGPT, your personal crypto alpha agent. I'll help you discover the hottest gainers, most profitable mining opportunities, and provide AI-powered insights directly in your DMs.

**Quick Commands:**
📈 /subscribe - Get hourly alpha updates
⛏️ /mine - Top mining opportunities right now
📊 /dashboard - Open the AlphaScroll mini-app
🏆 /leaderboard - See top alpha hunters
🎯 /predict <token> - Make a price prediction
💬 /help - Full command list

Ready to hunt some alpha? Try /subscribe to get started! 🚀
    `;
    
    await this.sendMessage(message.conversation, welcomeMessage);
  }

  async handleSubscribe(message) {
    const senderAddress = message.senderAddress;
    
    if (!this.activeSubscriptions.has(senderAddress)) {
      this.activeSubscriptions.set(senderAddress, {
        hourlyUpdates: true,
        miningAlerts: true,
        breakoutAlerts: true,
        preferences: 'all'
      });
      
      await this.sendMessage(message.conversation, 
        "✅ You're now subscribed to AlphaScroll updates! You'll receive:\n\n" +
        "📈 Hourly top gainers\n" +
        "⛏️ Mining profitability alerts\n" +
        "🚀 Breakout notifications\n\n" +
        "Use /dashboard to access the full AlphaScroll experience!"
      );
    } else {
      await this.sendMessage(message.conversation, 
        "✅ You're already subscribed! Use /dashboard to see your personalized alpha feed."
      );
    }
  }

  async handleUnsubscribe(message) {
    const senderAddress = message.senderAddress;
    
    if (this.activeSubscriptions.has(senderAddress)) {
      this.activeSubscriptions.delete(senderAddress);
      await this.sendMessage(message.conversation, 
        "😢 You've been unsubscribed from AlphaScroll updates. You can re-subscribe anytime with /subscribe"
      );
    } else {
      await this.sendMessage(message.conversation, 
        "ℹ️ You're not currently subscribed to updates."
      );
    }
  }

  async handleTrack(message, args) {
    if (args.length === 0) {
      await this.sendMessage(message.conversation, 
        "📊 Please specify a token to track. Example: /track bitcoin"
      );
      return;
    }

    const tokenName = args.join(' ');
    
    try {
      const tokenData = await this.dataFetcher.getTokenData(tokenName);
      
      if (tokenData) {
        const analysis = await this.aiAgent.analyzeToken(tokenData);
        
        const trackingMessage = `
🎯 **Now tracking ${tokenData.name} (${tokenData.symbol.toUpperCase()})**

💰 Current Price: $${tokenData.current_price}
📈 24h Change: ${tokenData.price_change_percentage_24h?.toFixed(2)}%
📊 Market Cap: $${(tokenData.market_cap / 1e9).toFixed(2)}B
🔄 Volume: $${(tokenData.total_volume / 1e6).toFixed(2)}M

🤖 **AI Analysis:**
${analysis}

📱 View full analysis: ${config.WEBAPP_URL}/token/${tokenData.id}
        `;
        
        await this.sendMessage(message.conversation, trackingMessage);
      } else {
        await this.sendMessage(message.conversation, 
          `❌ Couldn't find token "${tokenName}". Try using the full name or symbol.`
        );
      }
    } catch (error) {
      console.error('Error tracking token:', error);
      await this.sendMessage(message.conversation, 
        "❌ Failed to track token. Please try again later."
      );
    }
  }

  async handleMine(message) {
    try {
      const miningData = await this.dataFetcher.getMiningOpportunities();
      
      const miningMessage = `
⛏️ **Top Mining Opportunities Right Now** ⛏️

${miningData.slice(0, 3).map((coin, index) => 
  `${index + 1}. **${coin.name}** (${coin.tag})
💰 Profitability: ${coin.profitability}
⚡ Difficulty: ${coin.difficulty}
🔥 Est. Daily: $${coin.estimatedDaily}
`).join('\n')}

📱 Full mining dashboard: ${config.WEBAPP_URL}/mining
⚙️ Need mining setup help? Ask me anything!
      `;
      
      await this.sendMessage(message.conversation, miningMessage);
    } catch (error) {
      console.error('Error fetching mining data:', error);
      await this.sendMessage(message.conversation, 
        "❌ Failed to fetch mining data. Please try again later."
      );
    }
  }

  async handleDashboard(message) {
    const dashboardUrl = `${config.WEBAPP_URL}?ref=${message.senderAddress}`;
    
    const dashboardMessage = `
📱 **AlphaScroll Dashboard** 📱

🔥 Access your personalized alpha feed:
${dashboardUrl}

Features:
📈 TikTok-style scrolling feed
🎯 Real-time price alerts
🏆 Leaderboard & challenges
⚡ One-tap trading on Base
🤖 AI-powered insights

Optimized for mobile - swipe up for next alpha! 🚀
    `;
    
    await this.sendMessage(message.conversation, dashboardMessage);
  }

  async handleLeaderboard(message) {
    try {
      const topHunters = await this.leaderboard.getTopAlphaHunters();
      
      const leaderboardMessage = `
🏆 **Alpha Hunters Leaderboard** 🏆

${topHunters.slice(0, 5).map((hunter, index) => 
  `${['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][index]} ${hunter.ensName || hunter.address.slice(0, 8)}... 
📊 Score: ${hunter.score} | 🎯 Predictions: ${hunter.predictions}`
).join('\n\n')}

Want to climb the ranks? Make predictions with /predict!
🎯 Full leaderboard: ${config.WEBAPP_URL}/leaderboard
    `;
    
    await this.sendMessage(message.conversation, leaderboardMessage);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      await this.sendMessage(message.conversation, 
        "❌ Failed to fetch leaderboard. Please try again later."
      );
    }
  }

  async handlePredict(message, args) {
    if (args.length < 2) {
      await this.sendMessage(message.conversation, 
        "🎯 Make a prediction! Example: /predict bitcoin up (for next 24h)"
      );
      return;
    }

    const [tokenName, direction] = args;
    
    if (!['up', 'down', 'moon', 'dump'].includes(direction.toLowerCase())) {
      await this.sendMessage(message.conversation, 
        "📊 Direction must be 'up', 'down', 'moon', or 'dump'"
      );
      return;
    }

    try {
      await this.leaderboard.recordPrediction(
        message.senderAddress, 
        tokenName, 
        direction.toLowerCase()
      );
      
      await this.sendMessage(message.conversation, 
        `🎯 Prediction recorded! You think ${tokenName.toUpperCase()} will go ${direction.toUpperCase()} in the next 24h.\n\n` +
        "⏰ We'll check back tomorrow and update your alpha hunter score!\n" +
        "🏆 Current leaderboard: /leaderboard"
      );
    } catch (error) {
      console.error('Error recording prediction:', error);
      await this.sendMessage(message.conversation, 
        "❌ Failed to record prediction. Please try again."
      );
    }
  }

  async handleNaturalLanguage(message, content) {
    try {
      // Use AI to understand and respond to natural language queries
      const response = await this.aiAgent.processQuery(content);
      await this.sendMessage(message.conversation, response);
    } catch (error) {
      console.error('Error processing natural language:', error);
      await this.sendMessage(message.conversation, 
        "🤔 I didn't quite understand that. Try /help for available commands or ask me about crypto!"
      );
    }
  }

  async handleHelp(message) {
    const helpMessage = `
🔥 **AlphaScroll Commands** 🔥

**Getting Started:**
/start - Welcome & introduction
/subscribe - Get hourly alpha updates
/unsubscribe - Stop updates

**Alpha Hunting:**
/track <token> - Track a specific token
/mine - Top mining opportunities
/dashboard - Open mini-app dashboard

**Social & Gaming:**
/predict <token> <up/down> - Make price prediction
/leaderboard - See top alpha hunters

**General:**
/help - This help message

**Natural Language:**
You can also just chat with me! Ask things like:
- "What's pumping today?"
- "Should I mine Ethereum?"
- "Explain Bitcoin's price action"

Ready to hunt some alpha? 🚀
    `;
    
    await this.sendMessage(message.conversation, helpMessage);
  }

  async sendMessage(conversation, content) {
    try {
      await conversation.send(content);
      console.log(`✅ Sent message to ${conversation.peerAddress}`);
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    }
  }

  startPeriodicUpdates() {
    console.log('⏰ Starting periodic alpha updates...');
    
    // Send hourly alpha updates
    cron.schedule('0 * * * *', async () => {
      console.log('📈 Sending hourly alpha updates...');
      await this.sendAlphaUpdates();
    });

    // Send mining alerts every 4 hours
    cron.schedule('0 */4 * * *', async () => {
      console.log('⛏️ Sending mining profitability alerts...');
      await this.sendMiningAlerts();
    });
  }

  async sendAlphaUpdates() {
    try {
      const topGainers = await this.dataFetcher.getTopGainers();
      const aiInsights = await this.aiAgent.generateAlphaInsights(topGainers);
      
      const updateMessage = `
🔥 **HOURLY ALPHA UPDATE** 🔥

📈 **Top Gainers:**
${topGainers.slice(0, 3).map((coin, index) => 
  `${index + 1}. ${coin.name} (${coin.symbol.toUpperCase()})
💰 ${coin.current_price} (+${coin.price_change_percentage_24h?.toFixed(2)}%)
📊 Vol: $${(coin.total_volume / 1e6).toFixed(1)}M`
).join('\n\n')}

🤖 **AI Insights:**
${aiInsights}

📱 Full analysis: ${config.WEBAPP_URL}
      `;

      // Send to all subscribed users
      for (const [userAddress, preferences] of this.activeSubscriptions) {
        if (preferences.hourlyUpdates) {
          try {
            const conversation = await this.client.conversations.newConversation(userAddress);
            await this.sendMessage(conversation, updateMessage);
          } catch (error) {
            console.error(`Failed to send update to ${userAddress}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error sending alpha updates:', error);
    }
  }

  async sendMiningAlerts() {
    try {
      const topMining = await this.dataFetcher.getMiningOpportunities();
      
      const alertMessage = `
⛏️ **MINING PROFITABILITY ALERT** ⛏️

💎 Most profitable coins to mine right now:

${topMining.slice(0, 2).map((coin, index) => 
  `${index + 1}. **${coin.name}**
💰 Daily Profit: $${coin.estimatedDaily}
⚡ Difficulty: ${coin.difficulty}
🔥 ROI: ${coin.roi}%`
).join('\n\n')}

⚙️ Need mining setup help? Just ask!
📱 Full mining dashboard: ${config.WEBAPP_URL}/mining
      `;

      // Send to subscribed users who want mining alerts
      for (const [userAddress, preferences] of this.activeSubscriptions) {
        if (preferences.miningAlerts) {
          try {
            const conversation = await this.client.conversations.newConversation(userAddress);
            await this.sendMessage(conversation, alertMessage);
          } catch (error) {
            console.error(`Failed to send mining alert to ${userAddress}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error sending mining alerts:', error);
    }
  }
}

// Start the agent
const agent = new AlphaScrollAgent();

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down AlphaScroll Agent...');
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
});

// Initialize and start
agent.initialize().catch(console.error);

module.exports = { AlphaScrollAgent }; 