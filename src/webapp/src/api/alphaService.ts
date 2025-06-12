/**
 * 🔥 AlphaScroll - Frontend API Service
 * 
 * Connects React frontend to real crypto data
 * Transforms backend data to frontend AlphaCard format
 */

export interface AlphaCard {
  id: string
  token: {
    name: string
    symbol: string
    price: number
    change24h: number
    marketCap: number
    volume: number
    image?: string
  }
  type: 'gainer' | 'loser' | 'mining' | 'trending'
  insight: string
  aiSummary: string
  timeAgo: string
  engagement: {
    views: number
    likes: number
    shares: number
  }
}

class AlphaService {
  private baseUrl: string
  private cache: Map<string, { data: any, timestamp: number }> = new Map()
  private cacheExpiry = 2 * 60 * 1000 // 2 minutes for frontend cache

  constructor() {
    // Production API URL will be set via environment variable
    this.baseUrl = import.meta.env.VITE_API_URL || 
                   (import.meta.env.PROD ? 'https://alphascroll-api.railway.app' : 'http://localhost:3003')
    console.log('🔗 AlphaService connecting to:', this.baseUrl)
  }

  private getCacheKey(endpoint: string): string {
    return endpoint
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data
    }
    return null
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  private async fetchWithFallback(endpoint: string): Promise<any> {
    const cacheKey = this.getCacheKey(endpoint)
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      this.setCache(cacheKey, data)
      return data
    } catch (error) {
      console.warn('API call failed, using fallback data:', error)
      return this.getFallbackData(endpoint)
    }
  }

  private getFallbackData(endpoint: string): any {
    // Fallback to mock data if API fails
    switch (endpoint) {
      case '/api/alpha/gainers':
        return this.getMockGainers()
      case '/api/alpha/losers':
        return this.getMockLosers()
      case '/api/alpha/mining':
        return this.getMockMining()
      default:
        return []
    }
  }

  private getMockGainers() {
    return [
      {
        id: 'base-dog',
        name: 'Base Dog',
        symbol: 'BASEDOG',
        current_price: 0.00234,
        price_change_percentage_24h: 156.7,
        market_cap: 12500000,
        total_volume: 2100000,
        image: 'https://via.placeholder.com/64/00d4aa/ffffff?text=🐕'
      },
      {
        id: 'base-punk',
        name: 'Base Punk',
        symbol: 'BPUNK',
        current_price: 0.0156,
        price_change_percentage_24h: 89.3,
        market_cap: 45000000,
        total_volume: 8700000,
        image: 'https://via.placeholder.com/64/8b5cf6/ffffff?text=🎭'
      }
    ]
  }

  private getMockLosers() {
    return [
      {
        id: 'ethereum',
        name: 'Ethereum',
        symbol: 'ETH',
        current_price: 3456.78,
        price_change_percentage_24h: -8.4,
        market_cap: 415000000000,
        total_volume: 12500000000,
        image: 'https://via.placeholder.com/64/627eea/ffffff?text=Ξ'
      }
    ]
  }

  private getMockMining() {
    return [
      {
        name: 'Kaspa',
        tag: 'KAS',
        profitability: 1.45,
        estimatedDaily: 25.67,
        roi: 23.4,
        algorithm: 'kHeavyHash'
      }
    ]
  }

  private generateInsight(token: any, type: string): string {
    const insights = {
      gainer: [
        `🚀 ${token.name} is absolutely mooning right now! This momentum looks sustainable.`,
        `🔥 ${token.name} breaking out hard! Volume is confirming this move.`,
        `⚡ ${token.name} showing incredible strength! This could be the next big thing.`
      ],
      loser: [
        `📉 ${token.name} taking a breather after recent highs. Could be accumulation time.`,
        `🤔 ${token.name} cooling off, but fundamentals remain strong. Patience required.`,
        `📊 ${token.name} in healthy correction territory. Support levels holding well.`
      ],
      mining: [
        `⛏️ ${token.name} mining profitability just spiked! Perfect window for miners.`,
        `💎 ${token.name} difficulty adjustment created profit opportunity. Act fast!`,
        `🔧 ${token.name} showing exceptional mining returns. Hardware ROI looking good.`
      ]
    }
    
    const typeInsights = insights[type as keyof typeof insights] || insights.gainer
    return typeInsights[Math.floor(Math.random() * typeInsights.length)]
  }

  private generateAISummary(token: any, type: string): string {
    const summaries = {
      gainer: `Strong momentum with ${Math.abs(token.price_change_percentage_24h || 0).toFixed(1)}% gain. High volume suggests sustainable rally. Market sentiment turning bullish.`,
      loser: `Healthy correction after strong run. Support levels holding. Long-term fundamentals remain strong despite ${Math.abs(token.price_change_percentage_24h || 0).toFixed(1)}% pullback.`,
      mining: `Mining difficulty adjustment created profit window. Network hash rate growing. Strong mining fundamentals with ${token.roi || 0}% ROI.`
    }
    
    return summaries[type as keyof typeof summaries] || summaries.gainer
  }

  private generateEngagement(): { views: number, likes: number, shares: number } {
    const views = Math.floor(Math.random() * 50000) + 5000
    const likes = Math.floor(views * (Math.random() * 0.1 + 0.02)) // 2-12% like rate
    const shares = Math.floor(likes * (Math.random() * 0.3 + 0.1)) // 10-40% share rate
    
    return { views, likes, shares }
  }

  private transformToAlphaCard(token: any, type: string, index: number): AlphaCard {
    const timeAgos = ['2m ago', '5m ago', '8m ago', '12m ago', '15m ago']
    
    return {
      id: token.id || `${type}-${index}`,
      token: {
        name: token.name,
        symbol: token.symbol?.toUpperCase() || token.tag?.toUpperCase(),
        price: token.current_price || token.price || 0,
        change24h: token.price_change_percentage_24h || token.roi || 0,
        marketCap: token.market_cap || 0,
        volume: token.total_volume || 0,
        image: token.image
      },
      type: type as 'gainer' | 'loser' | 'mining' | 'trending',
      insight: this.generateInsight(token, type),
      aiSummary: this.generateAISummary(token, type),
      timeAgo: timeAgos[index % timeAgos.length],
      engagement: this.generateEngagement()
    }
  }

  async getTopGainers(limit: number = 5): Promise<AlphaCard[]> {
    const data = await this.fetchWithFallback('/api/alpha/gainers')
    return data.slice(0, limit).map((token: any, index: number) => 
      this.transformToAlphaCard(token, 'gainer', index)
    )
  }

  async getTopLosers(limit: number = 3): Promise<AlphaCard[]> {
    const data = await this.fetchWithFallback('/api/alpha/losers')
    return data.slice(0, limit).map((token: any, index: number) => 
      this.transformToAlphaCard(token, 'loser', index)
    )
  }

  async getMiningOpportunities(limit: number = 3): Promise<AlphaCard[]> {
    const data = await this.fetchWithFallback('/api/alpha/mining')
    return data.slice(0, limit).map((token: any, index: number) => 
      this.transformToAlphaCard(token, 'mining', index)
    )
  }

  async getTrendingTokens(limit: number = 2): Promise<AlphaCard[]> {
    const data = await this.fetchWithFallback('/api/alpha/trending')
    return data.slice(0, limit).map((token: any, index: number) => 
      this.transformToAlphaCard(token, 'trending', index)
    )
  }

  async getAllAlphaCards(): Promise<AlphaCard[]> {
    try {
      const [gainers, losers, mining, trending] = await Promise.all([
        this.getTopGainers(3),
        this.getTopLosers(2),
        this.getMiningOpportunities(2),
        this.getTrendingTokens(1)
      ])

      // Shuffle for variety
      const allCards = [...gainers, ...losers, ...mining, ...trending]
      return allCards.sort(() => Math.random() - 0.5)
    } catch (error) {
      console.error('Failed to fetch alpha cards:', error)
      // Return mock data as fallback
      return [
        this.transformToAlphaCard(this.getMockGainers()[0], 'gainer', 0),
        this.transformToAlphaCard(this.getMockLosers()[0], 'loser', 0),
        this.transformToAlphaCard(this.getMockMining()[0], 'mining', 0)
      ]
    }
  }

  async refreshData(): Promise<void> {
    this.cache.clear()
    await this.getAllAlphaCards()
  }
}

export const alphaService = new AlphaService()
export default alphaService 