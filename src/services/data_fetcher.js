/**
 * 🔥 AlphaScroll - Data Fetcher Service
 * 
 * Handles all external API calls for:
 * - CoinGecko (crypto prices, market data)
 * - WhatToMine (mining profitability)
 * - Additional alpha sources
 */

const axios = require('axios');
const { config } = require('../config/config');

class DataFetcher {
  constructor() {
    this.coinGeckoAPI = axios.create({
      baseURL: 'https://api.coingecko.com/api/v3',
      headers: config.COINGECKO_API_KEY ? {
        'X-CG-Pro-Api-Key': config.COINGECKO_API_KEY
      } : {},
      timeout: 10000
    });

    this.whatToMineAPI = axios.create({
      baseURL: 'https://whattomine.com/api',
      timeout: 10000
    });

    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  async initialize() {
    console.log('📊 Initializing Data Fetcher...');
    
    try {
      // Test API connections
      await this.coinGeckoAPI.get('/ping');
      console.log('✅ CoinGecko API connected');
      
      // Test WhatToMine connection
      await this.whatToMineAPI.get('/coins');
      console.log('✅ WhatToMine API connected');
      
    } catch (error) {
      console.error('❌ API connection test failed:', error.message);
      throw error;
    }
  }

  getCacheKey(method, params) {
    return `${method}_${JSON.stringify(params)}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async getTopGainers(limit = 10) {
    const cacheKey = this.getCacheKey('topGainers', { limit });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.coinGeckoAPI.get('/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'price_change_percentage_24h_desc',
          per_page: limit,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h,7d'
        }
      });

      const topGainers = response.data.filter(coin => 
        coin.price_change_percentage_24h > 0 &&
        coin.market_cap_rank <= 1000 // Filter out very small cap coins
      );

      this.setCache(cacheKey, topGainers);
      return topGainers;
    } catch (error) {
      console.error('❌ Error fetching top gainers:', error);
      throw error;
    }
  }

  async getTopLosers(limit = 10) {
    const cacheKey = this.getCacheKey('topLosers', { limit });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.coinGeckoAPI.get('/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'price_change_percentage_24h_asc',
          per_page: limit,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h,7d'
        }
      });

      const topLosers = response.data.filter(coin => 
        coin.price_change_percentage_24h < 0 &&
        coin.market_cap_rank <= 1000
      );

      this.setCache(cacheKey, topLosers);
      return topLosers;
    } catch (error) {
      console.error('❌ Error fetching top losers:', error);
      throw error;
    }
  }

  async getTrendingCoins() {
    const cacheKey = this.getCacheKey('trending', {});
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.coinGeckoAPI.get('/search/trending');
      
      const trending = response.data.coins.map(coin => ({
        id: coin.item.id,
        name: coin.item.name,
        symbol: coin.item.symbol,
        market_cap_rank: coin.item.market_cap_rank,
        thumb: coin.item.thumb,
        score: coin.item.score
      }));

      this.setCache(cacheKey, trending);
      return trending;
    } catch (error) {
      console.error('❌ Error fetching trending coins:', error);
      throw error;
    }
  }

  async getTokenData(tokenIdentifier) {
    const cacheKey = this.getCacheKey('tokenData', { tokenIdentifier });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // First try to search for the token
      const searchResponse = await this.coinGeckoAPI.get('/search', {
        params: { query: tokenIdentifier }
      });

      if (searchResponse.data.coins.length === 0) {
        return null;
      }

      const coinId = searchResponse.data.coins[0].id;

      // Get detailed data for the token
      const detailResponse = await this.coinGeckoAPI.get(`/coins/${coinId}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false,
          sparkline: false
        }
      });

      const tokenData = {
        id: detailResponse.data.id,
        name: detailResponse.data.name,
        symbol: detailResponse.data.symbol,
        current_price: detailResponse.data.market_data.current_price.usd,
        market_cap: detailResponse.data.market_data.market_cap.usd,
        market_cap_rank: detailResponse.data.market_cap_rank,
        total_volume: detailResponse.data.market_data.total_volume.usd,
        price_change_percentage_24h: detailResponse.data.market_data.price_change_percentage_24h,
        price_change_percentage_7d: detailResponse.data.market_data.price_change_percentage_7d,
        price_change_percentage_30d: detailResponse.data.market_data.price_change_percentage_30d,
        ath: detailResponse.data.market_data.ath.usd,
        atl: detailResponse.data.market_data.atl.usd,
        description: detailResponse.data.description.en?.slice(0, 500) + '...',
        homepage: detailResponse.data.links.homepage[0],
        blockchain_site: detailResponse.data.links.blockchain_site.filter(site => site),
        image: detailResponse.data.image.large
      };

      this.setCache(cacheKey, tokenData);
      return tokenData;
    } catch (error) {
      console.error('❌ Error fetching token data:', error);
      return null;
    }
  }

  async getMiningOpportunities() {
    const cacheKey = this.getCacheKey('mining', {});
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.whatToMineAPI.get('/coins.json');
      
      const coins = response.data.coins;
      const miningOpportunities = [];

      for (const [coinKey, coinData] of Object.entries(coins)) {
        if (coinData.profitability && coinData.profitability > 0) {
          miningOpportunities.push({
            id: coinKey,
            name: coinData.name || coinData.tag,
            tag: coinData.tag,
            algorithm: coinData.algorithm,
            profitability: coinData.profitability,
            difficulty: coinData.difficulty,
            block_time: coinData.block_time,
            block_reward: coinData.block_reward,
            estimatedDaily: coinData.estimated_rewards || 0,
            nethash: coinData.nethash,
            exchange_rate: coinData.exchange_rate,
            btc_revenue: coinData.btc_revenue,
            revenue: coinData.revenue,
            cost: coinData.cost,
            profit: coinData.profit,
            status: coinData.status,
            lagging: coinData.lagging,
            testing: coinData.testing,
            roi: coinData.profit && coinData.cost ? 
              ((coinData.profit / coinData.cost) * 100).toFixed(2) : 0
          });
        }
      }

      // Sort by profitability
      miningOpportunities.sort((a, b) => b.profitability - a.profitability);

      this.setCache(cacheKey, miningOpportunities.slice(0, 20));
      return miningOpportunities.slice(0, 20);
    } catch (error) {
      console.error('❌ Error fetching mining opportunities:', error);
      throw error;
    }
  }

  async getSpecificMiningData(coinTag) {
    try {
      const response = await this.whatToMineAPI.get(`/coins/${coinTag}.json`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching mining data for ${coinTag}:`, error);
      return null;
    }
  }

  async getMarketOverview() {
    const cacheKey = this.getCacheKey('marketOverview', {});
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const globalResponse = await this.coinGeckoAPI.get('/global');
      const global = globalResponse.data.data;

      const overview = {
        total_market_cap: global.total_market_cap.usd,
        total_volume: global.total_volume.usd,
        market_cap_percentage: global.market_cap_percentage,
        market_cap_change_24h: global.market_cap_change_percentage_24h_usd,
        active_cryptocurrencies: global.active_cryptocurrencies,
        markets: global.markets,
        defi_market_cap: global.defi_market_cap,
        defi_to_total_market_cap_ratio: global.defi_to_total_market_cap_ratio,
        updated_at: global.updated_at
      };

      this.setCache(cacheKey, overview);
      return overview;
    } catch (error) {
      console.error('❌ Error fetching market overview:', error);
      throw error;
    }
  }

  async getFearAndGreedIndex() {
    try {
      const response = await axios.get('https://api.alternative.me/fng/');
      return response.data.data[0];
    } catch (error) {
      console.error('❌ Error fetching Fear & Greed Index:', error);
      return null;
    }
  }

  async getGasPrice() {
    try {
      const response = await axios.get('https://api.etherscan.io/api?module=gastracker&action=gasoracle');
      return response.data.result;
    } catch (error) {
      console.error('❌ Error fetching gas prices:', error);
      return null;
    }
  }

  // Get price alerts for specific tokens
  async getPriceAlerts(tokens, alertThresholds) {
    const alerts = [];
    
    for (const token of tokens) {
      try {
        const tokenData = await this.getTokenData(token);
        if (!tokenData) continue;

        const threshold = alertThresholds[token] || { up: 10, down: -10 };
        
        if (tokenData.price_change_percentage_24h >= threshold.up) {
          alerts.push({
            type: 'PUMP',
            token: tokenData,
            change: tokenData.price_change_percentage_24h,
            message: `🚀 ${tokenData.name} is up ${tokenData.price_change_percentage_24h.toFixed(2)}% in 24h!`
          });
        } else if (tokenData.price_change_percentage_24h <= threshold.down) {
          alerts.push({
            type: 'DUMP',
            token: tokenData,
            change: tokenData.price_change_percentage_24h,
            message: `📉 ${tokenData.name} is down ${Math.abs(tokenData.price_change_percentage_24h).toFixed(2)}% in 24h`
          });
        }
      } catch (error) {
        console.error(`Error checking alerts for ${token}:`, error);
      }
    }

    return alerts;
  }

  // Clean up old cache entries
  cleanCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheExpiry) {
        this.cache.delete(key);
      }
    }
  }
}

module.exports = { DataFetcher }; 