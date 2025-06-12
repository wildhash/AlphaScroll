import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Eye, 
  Heart, 
  Share2,
  MoreVertical,
  Play,
  User,
  RefreshCw
} from 'lucide-react'
import alphaService, { AlphaCard } from './api/alphaService'

// Mock data for demo
const mockAlphaCards: AlphaCard[] = [
  {
    id: '1',
    token: {
      name: 'Base Dog',
      symbol: 'BASEDOG',
      price: 0.00234,
      change24h: 156.7,
      marketCap: 12500000,
      volume: 2100000,
    },
    type: 'gainer',
    insight: '🚀 BASEDOG is absolutely mooning right now! This Base native memecoin is seeing massive adoption.',
    aiSummary: 'Strong momentum with 156% gain. High volume suggests sustainable rally. Base ecosystem growth is driving demand.',
    timeAgo: '2m ago',
    engagement: { views: 12500, likes: 892, shares: 156 }
  },
  {
    id: '2',
    token: {
      name: 'Ethereum',
      symbol: 'ETH',
      price: 3456.78,
      change24h: -8.4,
      marketCap: 415000000000,
      volume: 12500000000,
    },
    type: 'loser',
    insight: '📉 ETH taking a breather after recent highs. Could be a good accumulation opportunity for diamond hands.',
    aiSummary: 'Healthy correction after strong run. Support levels holding. Long-term fundamentals remain strong.',
    timeAgo: '5m ago',
    engagement: { views: 45200, likes: 1243, shares: 567 }
  },
  {
    id: '3',
    token: {
      name: 'Kaspa',
      symbol: 'KAS',
      price: 0.167,
      change24h: 23.4,
      marketCap: 4200000000,
      volume: 890000000,
    },
    type: 'mining',
    insight: '⛏️ KAS mining profitability just spiked! ASIC miners are seeing 40% higher returns today.',
    aiSummary: 'Mining difficulty adjustment created profit window. Network hash rate growing. Strong mining fundamentals.',
    timeAgo: '8m ago',
    engagement: { views: 23100, likes: 756, shares: 234 }
  }
]

function App() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cards, setCards] = useState<AlphaCard[]>(mockAlphaCards)
  const [isLiked, setIsLiked] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(Date.now())

  const currentCard = cards[currentIndex]

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % cards.length)
  }

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length)
  }

  const handleLike = (cardId: string) => {
    setIsLiked(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }))
  }

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
    return num.toString()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'gainer': return <TrendingUp className="text-green-400" />
      case 'loser': return <TrendingDown className="text-red-400" />
      case 'mining': return <Zap className="text-yellow-400" />
      default: return <TrendingUp className="text-blue-400" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'gainer': return 'from-green-500/20 to-green-600/20'
      case 'loser': return 'from-red-500/20 to-red-600/20'
      case 'mining': return 'from-yellow-500/20 to-yellow-600/20'
      default: return 'from-blue-500/20 to-blue-600/20'
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') prevCard()
      if (e.key === 'ArrowDown') nextCard()
      if (e.key === ' ') e.preventDefault() // Prevent page scroll
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Load real data on mount
  useEffect(() => {
    loadAlphaData()
  }, [])

  // Auto-advance cards (optional)
  useEffect(() => {
    const timer = setInterval(nextCard, 10000) // 10 seconds
    return () => clearInterval(timer)
  }, [])

  // Refresh data every 5 minutes
  useEffect(() => {
    const refreshTimer = setInterval(loadAlphaData, 5 * 60 * 1000)
    return () => clearInterval(refreshTimer)
  }, [])

  const loadAlphaData = async () => {
    try {
      setIsLoading(true)
      const newCards = await alphaService.getAllAlphaCards()
      if (newCards.length > 0) {
        setCards(newCards)
        setLastRefresh(Date.now())
        console.log('🔥 Loaded fresh alpha data:', newCards.length, 'cards')
      }
    } catch (error) {
      console.error('Failed to load alpha data:', error)
      // Keep existing cards on error
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    await loadAlphaData()
  }

  return (
    <div className="h-screen bg-black text-white overflow-hidden relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">🔥</div>
            <h1 className="text-xl font-bold">AlphaScroll</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
              title="Refresh alpha data"
              aria-label="Refresh alpha data"
            >
              <RefreshCw className={`w-5 h-5 text-white ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center space-x-1 text-sm text-gray-300">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="h-full flex items-center justify-center">
        <div className="w-full max-w-md h-full relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full relative"
            >
              {/* Background Gradient */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${getTypeColor(currentCard.type)} opacity-20`}
              />
              
              {/* Card Content */}
              <div className="h-full p-6 flex flex-col justify-between relative z-10">
                {/* Token Info */}
                <div className="mt-16">
                  <div className="flex items-center space-x-3 mb-4">
                    {getTypeIcon(currentCard.type)}
                    <div>
                      <h2 className="text-2xl font-bold">{currentCard.token.name}</h2>
                      <p className="text-gray-400">${currentCard.token.symbol}</p>
                    </div>
                  </div>

                  {/* Price & Change */}
                  <div className="mb-6">
                    <div className="text-3xl font-bold mb-2">
                      ${currentCard.token.price < 1 
                        ? currentCard.token.price.toFixed(6)
                        : currentCard.token.price.toFixed(2)
                      }
                    </div>
                    <div className={`text-lg font-semibold ${
                      currentCard.token.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {currentCard.token.change24h >= 0 ? '+' : ''}
                      {currentCard.token.change24h.toFixed(2)}%
                    </div>
                  </div>

                  {/* Market Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div>
                      <p className="text-gray-400">Market Cap</p>
                      <p className="font-semibold">${formatNumber(currentCard.token.marketCap)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Volume 24h</p>
                      <p className="font-semibold">${formatNumber(currentCard.token.volume)}</p>
                    </div>
                  </div>

                  {/* Alpha Insight */}
                  <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                    <p className="text-lg leading-relaxed">{currentCard.insight}</p>
                  </div>

                  {/* AI Summary */}
                  <div className="bg-blue-900/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-blue-400 text-sm font-semibold">AI Analysis</span>
                    </div>
                    <p className="text-gray-300">{currentCard.aiSummary}</p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between">
                  {/* Engagement Stats */}
                  <div className="flex items-center space-x-4 text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Eye size={16} />
                      <span className="text-sm">{formatNumber(currentCard.engagement.views)}</span>
                    </div>
                    <span className="text-gray-600">•</span>
                    <span className="text-sm">{currentCard.timeAgo}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(currentCard.id)}
                      className={`p-2 rounded-full transition-colors ${
                        isLiked[currentCard.id] 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                      title={`${isLiked[currentCard.id] ? 'Unlike' : 'Like'} ${currentCard.token.name}`}
                      aria-label={`${isLiked[currentCard.id] ? 'Unlike' : 'Like'} ${currentCard.token.name}`}
                    >
                      <Heart size={20} fill={isLiked[currentCard.id] ? 'currentColor' : 'none'} />
                    </button>
                    <button 
                      className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors"
                      title="Share this alpha"
                      aria-label="Share this alpha"
                    >
                      <Share2 size={20} />
                    </button>
                    <button 
                      className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors"
                      title="More options"
                      aria-label="More options"
                    >
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Hints */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                <div className="text-xs text-center">
                  <div className="mb-2">↑</div>
                  <div className="text-[10px]">SWIPE</div>
                  <div className="mt-2">↓</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Overlay (for touch/click) */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        <div 
          className="h-1/2 w-full pointer-events-auto cursor-pointer"
          onClick={prevCard}
        />
        <div 
          className="h-1/2 w-full pointer-events-auto cursor-pointer"
          onClick={nextCard}
        />
      </div>

      {/* Bottom Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {cards.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Quick Actions Button */}
      <button 
        className="absolute bottom-20 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        title="Quick actions"
        aria-label="Quick actions"
      >
        <Play size={24} fill="currentColor" />
      </button>

      {/* Connection Status */}
      <div className="absolute top-20 right-4 text-xs text-gray-400">
        <div className="flex items-center space-x-1">
          <User size={12} />
          <span>Connected</span>
        </div>
      </div>
    </div>
  )
}

export default App 