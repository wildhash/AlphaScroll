/**
 * 🔥 AlphaScroll - AI Agent Service
 * 
 * Handles all AI-powered features:
 * - Token analysis & insights
 * - Natural language processing
 * - Alpha summary generation
 * - Sentiment analysis
 */

const OpenAI = require('openai');
const { config } = require('../config/config');

class AIAgent {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.OPENAI_API_KEY
    });
    
    this.systemPrompt = `You are AlphaGPT, a professional crypto analyst and trading assistant for AlphaScroll. 

Your personality:
- Professional but approachable
- Expert knowledge of crypto markets, DeFi, and blockchain
- Focuses on actionable insights
- Uses emojis sparingly but effectively
- Keeps responses concise and valuable
- Never gives financial advice, but provides educational analysis

Your capabilities:
- Analyze token data and market movements
- Explain complex crypto concepts simply
- Identify trends and patterns
- Provide context for price movements
- Help users understand risk factors

Always provide valuable, educational content while emphasizing that users should do their own research.`;
  }

  async initialize() {
    console.log('🤖 Initializing AI Agent...');
    
    try {
      // Test OpenAI connection
      await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      });
      console.log('✅ OpenAI API connected');
    } catch (error) {
      console.error('❌ OpenAI connection failed:', error.message);
      throw error;
    }
  }

  async analyzeToken(tokenData) {
    try {
      const prompt = `Analyze this crypto token data and provide a concise insight (max 150 words):

Token: ${tokenData.name} (${tokenData.symbol.toUpperCase()})
Current Price: $${tokenData.current_price}
24h Change: ${tokenData.price_change_percentage_24h?.toFixed(2)}%
7d Change: ${tokenData.price_change_percentage_7d?.toFixed(2)}%
Market Cap: $${(tokenData.market_cap / 1e9).toFixed(2)}B
Volume: $${(tokenData.total_volume / 1e6).toFixed(2)}M
Market Cap Rank: #${tokenData.market_cap_rank}

Provide:
1. Brief analysis of the price movement
2. Key observations about volume/market cap
3. Potential reasons for current performance
4. Risk level assessment

Keep it educational and actionable.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('❌ Error analyzing token:', error);
      return 'Unable to analyze token at the moment. Please try again later.';
    }
  }

  async generateAlphaInsights(topGainers) {
    try {
      const gainersData = topGainers.slice(0, 5).map(coin => 
        `${coin.name} (${coin.symbol.toUpperCase()}): +${coin.price_change_percentage_24h?.toFixed(2)}% | Vol: $${(coin.total_volume / 1e6).toFixed(1)}M`
      ).join('\n');

      const prompt = `Based on today's top crypto gainers, provide a brief market insight (max 100 words):

Top Gainers:
${gainersData}

Provide:
1. Overall market sentiment observation
2. Any notable patterns or sectors performing well
3. Key insight for traders to consider

Keep it concise and actionable.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('❌ Error generating alpha insights:', error);
      return 'Market analysis temporarily unavailable.';
    }
  }

  async processQuery(userQuery) {
    try {
      const prompt = `User question: "${userQuery}"

Respond as AlphaGPT, providing helpful information about crypto, trading, or market analysis. If the question is not crypto-related, politely redirect to crypto topics. Keep response under 200 words.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 250,
        temperature: 0.8
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('❌ Error processing query:', error);
      return "I'm having trouble processing that right now. Try asking about crypto prices, market trends, or use one of my commands like /help!";
    }
  }

  async analyzeMiningOpportunity(miningData) {
    try {
      const prompt = `Analyze this mining opportunity (max 100 words):

Coin: ${miningData.name} (${miningData.tag})
Algorithm: ${miningData.algorithm}
Profitability: ${miningData.profitability}
Daily Profit: $${miningData.estimatedDaily}
ROI: ${miningData.roi}%

Provide:
1. Assessment of the opportunity
2. Key considerations for miners
3. Risk factors to consider`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('❌ Error analyzing mining opportunity:', error);
      return 'Mining analysis temporarily unavailable.';
    }
  }

  async generateBreakoutAlert(tokenData, breakoutType) {
    try {
      const prompt = `Generate a concise breakout alert (max 80 words):

Token: ${tokenData.name} (${tokenData.symbol.toUpperCase()})
Current Price: $${tokenData.current_price}
24h Change: ${tokenData.price_change_percentage_24h?.toFixed(2)}%
Breakout Type: ${breakoutType}

Create an engaging alert message explaining what's happening and why it matters.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 120,
        temperature: 0.8
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('❌ Error generating breakout alert:', error);
      return `🚨 ${tokenData.name} breakout detected! Price: $${tokenData.current_price} (+${tokenData.price_change_percentage_24h?.toFixed(2)}%)`;
    }
  }

  async generatePredictionAnalysis(tokenName, direction, currentData) {
    try {
      const prompt = `A user predicted ${tokenName} will go ${direction}. Based on current data, provide a brief analysis (max 80 words):

Current Price Change: ${currentData?.price_change_percentage_24h?.toFixed(2)}%
Prediction: ${direction.toUpperCase()}

Assess the prediction accuracy and provide educational context.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 120,
        temperature: 0.7
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('❌ Error generating prediction analysis:', error);
      return `Prediction analysis for ${tokenName} (${direction}) recorded.`;
    }
  }

  async generateMarketSummary(marketData) {
    try {
      const prompt = `Summarize the current crypto market state (max 120 words):

Total Market Cap: $${(marketData.total_market_cap / 1e12).toFixed(2)}T
24h Change: ${marketData.market_cap_change_24h?.toFixed(2)}%
Total Volume: $${(marketData.total_volume / 1e9).toFixed(2)}B
Bitcoin Dominance: ${marketData.market_cap_percentage?.btc?.toFixed(1)}%

Provide a concise market overview with key insights.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 160,
        temperature: 0.7
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('❌ Error generating market summary:', error);
      return 'Market summary temporarily unavailable.';
    }
  }

  async generateWelcomePersonalization(userAddress) {
    try {
      const prompt = `Generate a personalized welcome message for a new AlphaScroll user (max 60 words). Make it engaging and mention key features like real-time alerts, mining insights, and the dashboard.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 80,
        temperature: 0.9
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('❌ Error generating welcome message:', error);
      return 'Welcome to AlphaScroll! Your personal crypto alpha agent is ready to help you discover the hottest opportunities. 🚀';
    }
  }

  // Helper method to determine if a query is crypto-related
  isCryptoRelated(query) {
    const cryptoKeywords = [
      'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'cryptocurrency', 
      'token', 'coin', 'defi', 'trading', 'price', 'market', 'mining',
      'blockchain', 'wallet', 'exchange', 'pump', 'dump', 'hodl',
      'altcoin', 'memecoin', 'nft', 'dao', 'yield', 'staking'
    ];
    
    const lowerQuery = query.toLowerCase();
    return cryptoKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  // Sentiment analysis for market messages
  async analyzeSentiment(text) {
    try {
      const prompt = `Analyze the sentiment of this crypto-related text. Respond with only: "bullish", "bearish", or "neutral"

Text: "${text}"`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 10,
        temperature: 0.3
      });

      const sentiment = response.choices[0].message.content.toLowerCase().trim();
      return ['bullish', 'bearish', 'neutral'].includes(sentiment) ? sentiment : 'neutral';
    } catch (error) {
      console.error('❌ Error analyzing sentiment:', error);
      return 'neutral';
    }
  }
}

module.exports = { AIAgent }; 