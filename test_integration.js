/**
 * 🔥 AlphaScroll - Integration Test Suite
 * 
 * Tests all components working together:
 * - API Server (port 3003)
 * - Frontend (port 3000) 
 * - Data Services
 * - Real API connections
 */

const axios = require('axios');

class IntegrationTester {
  constructor() {
    this.apiBaseUrl = 'http://localhost:3003';
    this.frontendUrl = 'http://localhost:3000';
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runTest(name, testFn) {
    console.log(`🧪 Testing: ${name}...`);
    try {
      const result = await testFn();
      if (result) {
        console.log(`✅ PASS: ${name}`);
        this.results.passed++;
        this.results.tests.push({ name, status: 'PASS', details: result });
      } else {
        console.log(`❌ FAIL: ${name}`);
        this.results.failed++;
        this.results.tests.push({ name, status: 'FAIL', details: 'Test returned false' });
      }
    } catch (error) {
      console.log(`❌ FAIL: ${name} - ${error.message}`);
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAIL', details: error.message });
    }
  }

  async testAPIHealth() {
    const response = await axios.get(`${this.apiBaseUrl}/health`);
    return response.status === 200 && response.data.status === 'healthy';
  }

  async testFrontendHealth() {
    const response = await axios.get(this.frontendUrl);
    return response.status === 200;
  }

  async testGainersEndpoint() {
    const response = await axios.get(`${this.apiBaseUrl}/api/alpha/gainers`);
    return response.status === 200 && Array.isArray(response.data) && response.data.length > 0;
  }

  async testLosersEndpoint() {
    const response = await axios.get(`${this.apiBaseUrl}/api/alpha/losers`);
    return response.status === 200 && Array.isArray(response.data) && response.data.length > 0;
  }

  async testTrendingEndpoint() {
    const response = await axios.get(`${this.apiBaseUrl}/api/alpha/trending`);
    return response.status === 200 && Array.isArray(response.data);
  }

  async testMiningEndpoint() {
    const response = await axios.get(`${this.apiBaseUrl}/api/alpha/mining`);
    return response.status === 200 && Array.isArray(response.data);
  }

  async testFeedEndpoint() {
    const response = await axios.get(`${this.apiBaseUrl}/api/alpha/feed`);
    const data = response.data;
    return response.status === 200 && 
           data.gainers && Array.isArray(data.gainers) &&
           data.losers && Array.isArray(data.losers) &&
           data.timestamp;
  }

  async testDataQuality() {
    const response = await axios.get(`${this.apiBaseUrl}/api/alpha/gainers?limit=1`);
    if (response.data.length === 0) return false;
    
    const token = response.data[0];
    return token.id && 
           token.name && 
           token.symbol && 
           typeof token.current_price === 'number' &&
           typeof token.price_change_percentage_24h === 'number';
  }

  async testCORSHeaders() {
    const response = await axios.get(`${this.apiBaseUrl}/health`);
    return response.headers['access-control-allow-origin'] !== undefined;
  }

  async testAPIPerformance() {
    const start = Date.now();
    await axios.get(`${this.apiBaseUrl}/api/alpha/feed`);
    const duration = Date.now() - start;
    return duration < 5000; // Should respond within 5 seconds
  }

  async testFrontendAPIIntegration() {
    // Test if frontend can reach API (CORS working)
    try {
      const response = await axios.get(`${this.apiBaseUrl}/api/alpha/gainers`, {
        headers: {
          'Origin': 'http://localhost:3000'
        }
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting AlphaScroll Integration Tests...\n');

    // Core Infrastructure Tests
    await this.runTest('API Server Health', () => this.testAPIHealth());
    await this.runTest('Frontend Health', () => this.testFrontendHealth());
    
    // API Endpoint Tests
    await this.runTest('Gainers Endpoint', () => this.testGainersEndpoint());
    await this.runTest('Losers Endpoint', () => this.testLosersEndpoint());
    await this.runTest('Trending Endpoint', () => this.testTrendingEndpoint());
    await this.runTest('Mining Endpoint', () => this.testMiningEndpoint());
    await this.runTest('Feed Endpoint', () => this.testFeedEndpoint());
    
    // Data Quality Tests
    await this.runTest('Data Quality', () => this.testDataQuality());
    await this.runTest('CORS Headers', () => this.testCORSHeaders());
    
    // Performance Tests
    await this.runTest('API Performance', () => this.testAPIPerformance());
    
    // Integration Tests
    await this.runTest('Frontend-API Integration', () => this.testFrontendAPIIntegration());

    this.printResults();
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🔥 ALPHASCROLL INTEGRATION TEST RESULTS');
    console.log('='.repeat(60));
    
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📊 Total: ${this.results.passed + this.results.failed}`);
    
    const successRate = (this.results.passed / (this.results.passed + this.results.failed) * 100).toFixed(1);
    console.log(`🎯 Success Rate: ${successRate}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.tests
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          console.log(`   - ${test.name}: ${test.details}`);
        });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (this.results.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! AlphaScroll is ready for the buildathon! 🚀');
    } else {
      console.log('⚠️  Some tests failed. Please check the issues above.');
    }
    
    console.log('='.repeat(60));
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new IntegrationTester();
  tester.runAllTests().catch(console.error);
}

module.exports = IntegrationTester; 