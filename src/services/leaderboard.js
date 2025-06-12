/**
 * 🔥 AlphaScroll - Leaderboard Manager
 * 
 * Manages user predictions, scoring, and leaderboards
 * Uses Firebase for persistent storage
 */

const admin = require('firebase-admin');
const { config } = require('../config/config');

class LeaderboardManager {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  async initialize() {
    console.log('🏆 Initializing Leaderboard Manager...');
    
    try {
      // Initialize Firebase Admin if not already initialized
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: config.FIREBASE_PROJECT_ID,
            privateKey: config.FIREBASE_PRIVATE_KEY,
            clientEmail: config.FIREBASE_CLIENT_EMAIL
          }),
          databaseURL: `https://${config.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`
        });
      }

      this.db = admin.firestore();
      console.log('✅ Firebase Firestore connected');
      
      // Initialize collections if needed
      await this.initializeCollections();
      
      this.initialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize Leaderboard Manager:', error);
      // Fallback to in-memory storage for development
      this.db = new Map();
      this.initialized = true;
      console.log('⚠️ Using in-memory storage for leaderboard (development mode)');
    }
  }

  async initializeCollections() {
    try {
      // Create indexes and initial data structure
      const collections = ['users', 'predictions', 'leaderboard'];
      
      for (const collection of collections) {
        const ref = this.db.collection(collection);
        // Check if collection exists by trying to get a document
        const snapshot = await ref.limit(1).get();
        if (snapshot.empty) {
          console.log(`📝 Initializing ${collection} collection`);
        }
      }
    } catch (error) {
      console.error('❌ Error initializing collections:', error);
    }
  }

  async recordPrediction(userAddress, tokenName, direction) {
    try {
      const prediction = {
        userAddress: userAddress.toLowerCase(),
        tokenName: tokenName.toLowerCase(),
        direction: direction.toLowerCase(),
        timestamp: Date.now(),
        expiresAt: Date.now() + (config.PREDICTION_WINDOW_HOURS * 60 * 60 * 1000),
        status: 'pending', // pending, correct, incorrect
        score: 0
      };

      if (this.db instanceof Map) {
        // In-memory fallback
        const key = `${userAddress}_${Date.now()}`;
        this.db.set(key, prediction);
      } else {
        // Firestore
        await this.db.collection('predictions').add(prediction);
      }

      // Update user stats
      await this.updateUserStats(userAddress, 'prediction_made');
      
      console.log(`📊 Recorded prediction: ${tokenName} ${direction} by ${userAddress}`);
      return prediction;
    } catch (error) {
      console.error('❌ Error recording prediction:', error);
      throw error;
    }
  }

  async updateUserStats(userAddress, action, scoreChange = 0) {
    try {
      const userId = userAddress.toLowerCase();
      
      if (this.db instanceof Map) {
        // In-memory fallback
        const userKey = `user_${userId}`;
        const existingUser = this.db.get(userKey) || {
          address: userId,
          totalPredictions: 0,
          correctPredictions: 0,
          totalScore: 0,
          rank: 0,
          lastActive: Date.now(),
          joinedAt: Date.now()
        };

        switch (action) {
          case 'prediction_made':
            existingUser.totalPredictions++;
            break;
          case 'prediction_correct':
            existingUser.correctPredictions++;
            existingUser.totalScore += scoreChange;
            break;
          case 'prediction_incorrect':
            existingUser.totalScore = Math.max(0, existingUser.totalScore + scoreChange);
            break;
        }

        existingUser.lastActive = Date.now();
        existingUser.accuracy = existingUser.totalPredictions > 0 ? 
          (existingUser.correctPredictions / existingUser.totalPredictions * 100).toFixed(1) : 0;

        this.db.set(userKey, existingUser);
        return existingUser;
      } else {
        // Firestore
        const userRef = this.db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          // Create new user
          const newUser = {
            address: userId,
            totalPredictions: action === 'prediction_made' ? 1 : 0,
            correctPredictions: action === 'prediction_correct' ? 1 : 0,
            totalScore: scoreChange,
            rank: 0,
            lastActive: Date.now(),
            joinedAt: Date.now(),
            accuracy: 0
          };
          await userRef.set(newUser);
          return newUser;
        } else {
          // Update existing user
          const userData = userDoc.data();
          const updates = { lastActive: Date.now() };

          switch (action) {
            case 'prediction_made':
              updates.totalPredictions = (userData.totalPredictions || 0) + 1;
              break;
            case 'prediction_correct':
              updates.correctPredictions = (userData.correctPredictions || 0) + 1;
              updates.totalScore = (userData.totalScore || 0) + scoreChange;
              break;
            case 'prediction_incorrect':
              updates.totalScore = Math.max(0, (userData.totalScore || 0) + scoreChange);
              break;
          }

          if (updates.totalPredictions || userData.totalPredictions) {
            const total = updates.totalPredictions || userData.totalPredictions;
            const correct = updates.correctPredictions || userData.correctPredictions || 0;
            updates.accuracy = total > 0 ? (correct / total * 100).toFixed(1) : 0;
          }

          await userRef.update(updates);
          return { ...userData, ...updates };
        }
      }
    } catch (error) {
      console.error('❌ Error updating user stats:', error);
      throw error;
    }
  }

  async getTopAlphaHunters(limit = 10) {
    try {
      if (this.db instanceof Map) {
        // In-memory fallback
        const users = [];
        for (const [key, value] of this.db.entries()) {
          if (key.startsWith('user_')) {
            users.push(value);
          }
        }
        
        users.sort((a, b) => b.totalScore - a.totalScore);
        return users.slice(0, limit).map((user, index) => ({
          ...user,
          rank: index + 1,
          ensName: null, // Could be fetched separately
          predictions: user.totalPredictions
        }));
      } else {
        // Firestore
        const snapshot = await this.db.collection('users')
          .orderBy('totalScore', 'desc')
          .limit(limit)
          .get();

        const hunters = [];
        snapshot.forEach((doc, index) => {
          const data = doc.data();
          hunters.push({
            ...data,
            rank: index + 1,
            ensName: null, // Could be fetched separately
            predictions: data.totalPredictions || 0,
            score: data.totalScore || 0
          });
        });

        return hunters;
      }
    } catch (error) {
      console.error('❌ Error fetching top alpha hunters:', error);
      return [];
    }
  }

  async getUserRank(userAddress) {
    try {
      const userId = userAddress.toLowerCase();
      
      if (this.db instanceof Map) {
        // In-memory fallback
        const users = [];
        for (const [key, value] of this.db.entries()) {
          if (key.startsWith('user_')) {
            users.push(value);
          }
        }
        
        users.sort((a, b) => b.totalScore - a.totalScore);
        const userIndex = users.findIndex(user => user.address === userId);
        return userIndex >= 0 ? userIndex + 1 : null;
      } else {
        // Firestore
        const userRef = this.db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) return null;
        
        const userData = userDoc.data();
        const higherScoreCount = await this.db.collection('users')
          .where('totalScore', '>', userData.totalScore || 0)
          .get();
          
        return higherScoreCount.size + 1;
      }
    } catch (error) {
      console.error('❌ Error getting user rank:', error);
      return null;
    }
  }

  async checkPendingPredictions() {
    try {
      const now = Date.now();
      
      if (this.db instanceof Map) {
        // In-memory fallback - would need actual price checking logic
        console.log('⏳ Checking pending predictions (in-memory mode)');
        return;
      } else {
        // Firestore
        const snapshot = await this.db.collection('predictions')
          .where('status', '==', 'pending')
          .where('expiresAt', '<=', now)
          .get();

        console.log(`⏳ Checking ${snapshot.size} expired predictions`);

        for (const doc of snapshot.docs) {
          const prediction = doc.data();
          await this.evaluatePrediction(doc.id, prediction);
        }
      }
    } catch (error) {
      console.error('❌ Error checking pending predictions:', error);
    }
  }

  async evaluatePrediction(predictionId, prediction) {
    try {
      // This would integrate with DataFetcher to get actual price data
      // For now, using placeholder logic
      
      const isCorrect = Math.random() > 0.5; // Placeholder
      const scoreChange = isCorrect ? this.calculateScore(prediction) : -10;
      
      // Update prediction status
      if (this.db instanceof Map) {
        // In-memory fallback
        prediction.status = isCorrect ? 'correct' : 'incorrect';
        prediction.score = scoreChange;
      } else {
        // Firestore
        await this.db.collection('predictions').doc(predictionId).update({
          status: isCorrect ? 'correct' : 'incorrect',
          score: scoreChange,
          evaluatedAt: Date.now()
        });
      }

      // Update user stats
      const action = isCorrect ? 'prediction_correct' : 'prediction_incorrect';
      await this.updateUserStats(prediction.userAddress, action, scoreChange);
      
      console.log(`✅ Evaluated prediction: ${prediction.tokenName} ${prediction.direction} - ${isCorrect ? 'CORRECT' : 'INCORRECT'} (+${scoreChange} points)`);
      
      return { isCorrect, scoreChange };
    } catch (error) {
      console.error('❌ Error evaluating prediction:', error);
    }
  }

  calculateScore(prediction) {
    // Score calculation based on prediction difficulty and accuracy
    let baseScore = 10;
    
    // Bonus for harder predictions
    const direction = prediction.direction;
    if (direction === 'moon' || direction === 'dump') {
      baseScore = 25; // Higher risk, higher reward
    }
    
    // Time bonus (earlier predictions get more points)
    const timeToExpiry = prediction.expiresAt - prediction.timestamp;
    const fullWindow = config.PREDICTION_WINDOW_HOURS * 60 * 60 * 1000;
    const timeBonus = Math.floor((timeToExpiry / fullWindow) * 5);
    
    return baseScore + timeBonus;
  }

  async getUserPredictions(userAddress, limit = 10) {
    try {
      const userId = userAddress.toLowerCase();
      
      if (this.db instanceof Map) {
        // In-memory fallback
        const predictions = [];
        for (const [key, value] of this.db.entries()) {
          if (key.includes('prediction') && value.userAddress === userId) {
            predictions.push(value);
          }
        }
        return predictions.slice(0, limit);
      } else {
        // Firestore
        const snapshot = await this.db.collection('predictions')
          .where('userAddress', '==', userId)
          .orderBy('timestamp', 'desc')
          .limit(limit)
          .get();

        const predictions = [];
        snapshot.forEach(doc => {
          predictions.push({ id: doc.id, ...doc.data() });
        });
        
        return predictions;
      }
    } catch (error) {
      console.error('❌ Error getting user predictions:', error);
      return [];
    }
  }

  async getLeaderboardStats() {
    try {
      if (this.db instanceof Map) {
        // In-memory fallback
        let totalUsers = 0;
        let totalPredictions = 0;
        let totalCorrect = 0;
        
        for (const [key, value] of this.db.entries()) {
          if (key.startsWith('user_')) {
            totalUsers++;
            totalPredictions += value.totalPredictions || 0;
            totalCorrect += value.correctPredictions || 0;
          }
        }
        
        return {
          totalUsers,
          totalPredictions,
          overallAccuracy: totalPredictions > 0 ? (totalCorrect / totalPredictions * 100).toFixed(1) : 0
        };
      } else {
        // Firestore - would need aggregation queries
        const snapshot = await this.db.collection('users').get();
        let totalPredictions = 0;
        let totalCorrect = 0;
        
        snapshot.forEach(doc => {
          const data = doc.data();
          totalPredictions += data.totalPredictions || 0;
          totalCorrect += data.correctPredictions || 0;
        });
        
        return {
          totalUsers: snapshot.size,
          totalPredictions,
          overallAccuracy: totalPredictions > 0 ? (totalCorrect / totalPredictions * 100).toFixed(1) : 0
        };
      }
    } catch (error) {
      console.error('❌ Error getting leaderboard stats:', error);
      return { totalUsers: 0, totalPredictions: 0, overallAccuracy: 0 };
    }
  }

  // Start periodic prediction evaluation
  startPredictionEvaluation() {
    const cron = require('node-cron');
    
    // Check predictions every hour
    cron.schedule('0 * * * *', async () => {
      console.log('🔍 Running prediction evaluation...');
      await this.checkPendingPredictions();
    });
    
    console.log('⏰ Prediction evaluation scheduler started');
  }
}

module.exports = { LeaderboardManager }; 