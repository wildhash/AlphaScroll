/**
 * 🔥 AlphaScroll - Configuration
 * 
 * Central configuration management for all services
 */

require('dotenv').config();

const config = {
  // XMTP Configuration
  XMTP_PRIVATE_KEY: process.env.XMTP_PRIVATE_KEY,
  XMTP_ENV: process.env.XMTP_ENV || 'production',

  // API Keys
  COINGECKO_API_KEY: process.env.COINGECKO_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  // Coinbase Developer Platform
  CDP_API_KEY: process.env.CDP_API_KEY,
  CDP_SECRET: process.env.CDP_SECRET,

  // Firebase Configuration
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,

  // Base Configuration
  BASE_RPC_URL: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
  BASE_CHAIN_ID: parseInt(process.env.BASE_CHAIN_ID) || 8453,

  // Mini-App Configuration
  WEBAPP_URL: process.env.WEBAPP_URL || 'http://localhost:3000',
  AGENT_NAME: process.env.AGENT_NAME || 'AlphaGPT',
  AGENT_PERSONALITY: process.env.AGENT_PERSONALITY || 'professional',

  // Optional APIs
  TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN,
  LUNARCRUSH_API_KEY: process.env.LUNARCRUSH_API_KEY,

  // Application Settings
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 3000,

  // Rate Limiting & Performance
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes

  // Alpha Detection Thresholds
  PUMP_THRESHOLD: 15, // % price increase to trigger pump alert
  DUMP_THRESHOLD: -15, // % price decrease to trigger dump alert
  VOLUME_SPIKE_THRESHOLD: 200, // % volume increase to trigger alert
  
  // Mining Configuration
  MIN_MINING_PROFITABILITY: 0.1, // Minimum profitability threshold
  
  // Leaderboard Settings
  LEADERBOARD_SIZE: 100,
  PREDICTION_WINDOW_HOURS: 24,

  // Message Limits
  MAX_MESSAGE_LENGTH: 4000, // XMTP message limit
  MAX_TOKENS_PER_ANALYSIS: 200,

  // Update Frequencies (in cron format)
  HOURLY_UPDATES_CRON: '0 * * * *',
  MINING_ALERTS_CRON: '0 */4 * * *',
  BREAKOUT_MONITORING_CRON: '*/15 * * * *', // Every 15 minutes

  // Social Features
  ENABLE_LEADERBOARD: true,
  ENABLE_PREDICTIONS: true,
  ENABLE_SOCIAL_SHARING: true
};

// Validation
function validateConfig() {
  const required = [
    'XMTP_PRIVATE_KEY',
    'OPENAI_API_KEY'
  ];

  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required configuration:');
    missing.forEach(key => console.error(`  - ${key}`));
    process.exit(1);
  }

  // Validate private key format
  if (config.XMTP_PRIVATE_KEY && !config.XMTP_PRIVATE_KEY.startsWith('0x')) {
    config.XMTP_PRIVATE_KEY = '0x' + config.XMTP_PRIVATE_KEY;
  }

  console.log('✅ Configuration validated');
}

// Initialize configuration
if (process.env.NODE_ENV !== 'test') {
  validateConfig();
}

module.exports = { config }; 