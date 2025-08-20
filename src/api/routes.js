/**
 * 🔥 AlphaScroll - Backend API Routes
 * 
 * Serves crypto data to the frontend
 * Connects data services to REST endpoints
 */

const express = require('express')
const cors = require('cors')
const { DataFetcher } = require('../services/data_fetcher')
const { AIAgent } = require('../services/ai_agent')

const app = express()
let dataFetcher = new DataFetcher()
let aiAgent = null

function getAIAgent() {
  if (aiAgent) return aiAgent
  try {
    aiAgent = new AIAgent()
    return aiAgent
  } catch (e) {
    console.warn('⚠️ AI agent unavailable, using fallback:', e.message)
    aiAgent = {
      analyzeToken: async () => 'AI analysis temporarily unavailable.',
      analyzeMiningOpportunity: async () => 'Mining analysis temporarily unavailable.'
    }
    return aiAgent
  }
}

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  exposedHeaders: ['*'],
  allowedHeaders: ['*']
}))

app.use(express.json())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
})

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'AlphaScroll API'
  })
})

// Get top gainers
app.get('/api/alpha/gainers', async (req, res) => {
  try {
    console.log('📈 Fetching top gainers...')
    const limit = parseInt(req.query.limit) || 10
    const gainers = await dataFetcher.getTopGainers(limit)
    
    console.log(`✅ Found ${gainers.length} gainers`)
    res.json(gainers)
  } catch (error) {
    console.error('❌ Error fetching gainers:', error)
    // Fallback mock data
    const mock = [
      { id: 'base-dog', name: 'Base Dog', symbol: 'BASEDOG', current_price: 0.00234, price_change_percentage_24h: 156.7, market_cap: 12500000, total_volume: 2100000 },
      { id: 'base-punk', name: 'Base Punk', symbol: 'BPUNK', current_price: 0.0156, price_change_percentage_24h: 89.3, market_cap: 45000000, total_volume: 8700000 }
    ]
    res.json(mock)
  }
})

// Get top losers  
app.get('/api/alpha/losers', async (req, res) => {
  try {
    console.log('📉 Fetching top losers...')
    const limit = parseInt(req.query.limit) || 10
    const losers = await dataFetcher.getTopLosers(limit)
    
    console.log(`✅ Found ${losers.length} losers`)
    res.json(losers)
  } catch (error) {
    console.error('❌ Error fetching losers:', error)
    // Fallback mock data
    const mock = [
      { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', current_price: 3456.78, price_change_percentage_24h: -8.4, market_cap: 415000000000, total_volume: 12500000000 }
    ]
    res.json(mock)
  }
})

// Get mining opportunities
app.get('/api/alpha/mining', async (req, res) => {
  try {
    console.log('⛏️ Fetching mining opportunities...')
    const miningData = await dataFetcher.getMiningOpportunities()
    
    // Sort by profitability and take top opportunities
    const sortedMining = miningData
      .sort((a, b) => (b.profitability || 0) - (a.profitability || 0))
      .slice(0, parseInt(req.query.limit) || 10)
    
    console.log(`✅ Found ${sortedMining.length} mining opportunities`)
    res.json(sortedMining)
  } catch (error) {
    console.error('❌ Error fetching mining data:', error)
    // Return mock mining data as fallback
    const mockMining = [
      {
        name: 'Kaspa',
        tag: 'KAS',
        profitability: 1.45,
        estimatedDaily: 25.67,
        roi: 23.4,
        algorithm: 'kHeavyHash'
      },
      {
        name: 'Ethereum Classic',
        tag: 'ETC',
        profitability: 1.12,
        estimatedDaily: 18.34,
        roi: 15.2,
        algorithm: 'Ethash'
      }
    ];
    console.log('📊 Using fallback mining data')
    res.json(mockMining)
  }
})

// Get trending tokens
app.get('/api/alpha/trending', async (req, res) => {
  try {
    console.log('🔥 Fetching trending tokens...')
    const trending = await dataFetcher.getTrendingCoins()
    
    console.log(`✅ Found ${trending.length} trending tokens`)
    res.json(trending.slice(0, parseInt(req.query.limit) || 10))
  } catch (error) {
    console.error('❌ Error fetching trending:', error)
    res.json([])
  }
})

// Get market overview
app.get('/api/alpha/overview', async (req, res) => {
  try {
    console.log('📊 Fetching market overview...')
    const overview = await dataFetcher.getMarketOverview()
    
    console.log('✅ Market overview fetched')
    res.json(overview)
  } catch (error) {
    console.error('❌ Error fetching overview:', error)
    res.status(500).json({ 
      error: 'Failed to fetch market overview',
      message: error.message 
    })
  }
})

// Get AI analysis for a token
app.post('/api/alpha/analyze', async (req, res) => {
  try {
    const { tokenData, type } = req.body
    
    if (!tokenData) {
      return res.status(400).json({ error: 'Token data required' })
    }
    
    console.log(`🤖 Analyzing ${tokenData.name}...`)
    const analysis = await getAIAgent().analyzeToken(tokenData, type)
    
    console.log(`✅ Analysis complete for ${tokenData.name}`)
    res.json(analysis)
  } catch (error) {
    console.error('❌ Error analyzing token:', error)
    res.status(500).json({ 
      error: 'Failed to analyze token',
      message: error.message 
    })
  }
})

// Get all alpha data (mixed feed)
app.get('/api/alpha/feed', async (req, res) => {
  try {
    console.log('🔥 Fetching full alpha feed...')
    
    // Fetch all data types in parallel
    const [gainers, losers, mining, trending] = await Promise.all([
      dataFetcher.getTopGainers(3).catch(() => []),
      dataFetcher.getTopLosers(2).catch(() => []),
      dataFetcher.getMiningOpportunities().catch(() => []),
      dataFetcher.getTrendingCoins().catch(() => [])
    ])
    
    // Combine and format for frontend
    const feed = {
      gainers,
      losers, 
      mining: mining.slice(0, 2),
      trending: trending.slice(0, 1),
      timestamp: new Date().toISOString()
    }
    
    console.log('✅ Alpha feed compiled:', {
      gainers: gainers.length,
      losers: losers.length, 
      mining: feed.mining.length,
      trending: feed.trending.length
    })
    
    res.json(feed)
  } catch (error) {
    console.error('❌ Error fetching alpha feed:', error)
    res.status(500).json({ 
      error: 'Failed to fetch alpha feed',
      message: error.message 
    })
  }
})

const PORT = process.env.API_PORT || 3003

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 AlphaScroll API Server running on port ${PORT}`)
    console.log(`📊 Endpoints available:`)
    console.log(`   - GET  /api/alpha/gainers`)
    console.log(`   - GET  /api/alpha/losers`) 
    console.log(`   - GET  /api/alpha/mining`)
    console.log(`   - GET  /api/alpha/trending`)
    console.log(`   - GET  /api/alpha/overview`)
    console.log(`   - GET  /api/alpha/feed`)
    console.log(`   - POST /api/alpha/analyze`)
    console.log(`   - GET  /health`)
  })
}

module.exports = app