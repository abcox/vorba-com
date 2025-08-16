#!/usr/bin/env tsx

/**
 * Example: MCP Feedback Loop for UX Improvement
 * 
 * This script demonstrates how to use the MCP integration to create
 * a continuous feedback loop for UX improvement in the vorba-web project.
 */

import { MCPServer } from './mcp-ux-feedback';
import { PuppeteerUXAnalyzer } from './puppeteer-ux-analyzer';

interface UXImprovementTracker {
  baseline: any;
  current: any;
  improvements: string[];
  regressions: string[];
  recommendations: string[];
}

class UXFeedbackLoop {
  private server: MCPServer;
  private analyzer: PuppeteerUXAnalyzer;
  private baseUrl: string;
  private tracker: UXImprovementTracker;

  constructor(baseUrl: string = 'http://localhost:4200') {
    this.server = new MCPServer();
    this.analyzer = new PuppeteerUXAnalyzer();
    this.baseUrl = baseUrl;
    this.tracker = {
      baseline: null,
      current: null,
      improvements: [],
      regressions: [],
      recommendations: []
    };
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing UX Feedback Loop...');
    await this.server.start();
    await this.analyzer.initialize();
    console.log('✅ UX Feedback Loop initialized');
  }

  async establishBaseline(): Promise<void> {
    console.log('📊 Establishing UX baseline...');
    
    const baselineResults = await this.server.handleRequest({
      type: 'full_audit',
      baseUrl: this.baseUrl
    });

    this.tracker.baseline = this.extractKeyMetrics(baselineResults);
    
    console.log('📈 Baseline established:');
    console.log(`   - Accessibility Score: ${this.tracker.baseline.accessibilityScore}/100`);
    console.log(`   - Average Load Time: ${this.tracker.baseline.avgLoadTime}ms`);
    console.log(`   - Total Issues: ${this.tracker.baseline.totalIssues}`);
  }

  async analyzeCurrentState(): Promise<void> {
    console.log('🔍 Analyzing current UX state...');
    
    const currentResults = await this.server.handleRequest({
      type: 'full_audit',
      baseUrl: this.baseUrl
    });

    this.tracker.current = this.extractKeyMetrics(currentResults);
    
    console.log('📊 Current state:');
    console.log(`   - Accessibility Score: ${this.tracker.current.accessibilityScore}/100`);
    console.log(`   - Average Load Time: ${this.tracker.current.avgLoadTime}ms`);
    console.log(`   - Total Issues: ${this.tracker.current.totalIssues}`);
  }

  private extractKeyMetrics(results: any[]): any {
    const analysisResults = results.filter(r => r.type === 'analysis');
    
    if (analysisResults.length === 0) {
      return {
        accessibilityScore: 0,
        avgLoadTime: 0,
        totalIssues: 0
      };
    }

    const accessibilityScores = analysisResults.map(r => r.data.accessibility.score);
    const loadTimes = analysisResults.map(r => r.data.performance.loadTime);
    const totalIssues = analysisResults.reduce((sum, r) => sum + r.data.accessibility.issues.length, 0);

    return {
      accessibilityScore: Math.round(accessibilityScores.reduce((a, b) => a + b, 0) / accessibilityScores.length),
      avgLoadTime: Math.round(loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length),
      totalIssues
    };
  }

  compareAndGenerateFeedback(): void {
    if (!this.tracker.baseline || !this.tracker.current) {
      console.log('⚠️ No baseline or current data available for comparison');
      return;
    }

    console.log('🔄 Comparing baseline vs current state...');

    // Check for improvements
    if (this.tracker.current.accessibilityScore > this.tracker.baseline.accessibilityScore) {
      const improvement = this.tracker.current.accessibilityScore - this.tracker.baseline.accessibilityScore;
      this.tracker.improvements.push(`🎉 Accessibility score improved by ${improvement} points`);
    }

    if (this.tracker.current.avgLoadTime < this.tracker.baseline.avgLoadTime) {
      const improvement = this.tracker.baseline.avgLoadTime - this.tracker.current.avgLoadTime;
      this.tracker.improvements.push(`⚡ Load time improved by ${improvement}ms`);
    }

    if (this.tracker.current.totalIssues < this.tracker.baseline.totalIssues) {
      const improvement = this.tracker.baseline.totalIssues - this.tracker.current.totalIssues;
      this.tracker.improvements.push(`🔧 Fixed ${improvement} accessibility issues`);
    }

    // Check for regressions
    if (this.tracker.current.accessibilityScore < this.tracker.baseline.accessibilityScore) {
      const regression = this.tracker.baseline.accessibilityScore - this.tracker.current.accessibilityScore;
      this.tracker.regressions.push(`⚠️ Accessibility score decreased by ${regression} points`);
    }

    if (this.tracker.current.avgLoadTime > this.tracker.baseline.avgLoadTime) {
      const regression = this.tracker.current.avgLoadTime - this.tracker.baseline.avgLoadTime;
      this.tracker.regressions.push(`🐌 Load time increased by ${regression}ms`);
    }

    if (this.tracker.current.totalIssues > this.tracker.baseline.totalIssues) {
      const regression = this.tracker.current.totalIssues - this.tracker.baseline.totalIssues;
      this.tracker.regressions.push(`❌ ${regression} new accessibility issues introduced`);
    }

    // Generate recommendations
    this.generateRecommendations();
  }

  private generateRecommendations(): void {
    this.tracker.recommendations = [];

    if (this.tracker.current.accessibilityScore < 90) {
      this.tracker.recommendations.push('🔧 **High Priority**: Focus on improving accessibility score to 90+');
    }

    if (this.tracker.current.avgLoadTime > 2000) {
      this.tracker.recommendations.push('⚡ **High Priority**: Optimize page load times to under 2 seconds');
    }

    if (this.tracker.current.totalIssues > 10) {
      this.tracker.recommendations.push('🎯 **Medium Priority**: Reduce accessibility issues to under 10');
    }

    if (this.tracker.regressions.length > 0) {
      this.tracker.recommendations.push('🚨 **Critical**: Address regressions before continuing development');
    }

    // Add general recommendations
    this.tracker.recommendations.push('📊 **Continuous**: Set up automated UX monitoring in CI/CD');
    this.tracker.recommendations.push('🧪 **Testing**: Implement user testing for critical user journeys');
    this.tracker.recommendations.push('📱 **Mobile**: Ensure responsive design works on all devices');
  }

  printFeedbackReport(): void {
    console.log('\n📋 UX Feedback Report');
    console.log('====================\n');

    if (this.tracker.improvements.length > 0) {
      console.log('✅ Improvements:');
      this.tracker.improvements.forEach(improvement => {
        console.log(`   ${improvement}`);
      });
      console.log('');
    }

    if (this.tracker.regressions.length > 0) {
      console.log('❌ Regressions:');
      this.tracker.regressions.forEach(regression => {
        console.log(`   ${regression}`);
      });
      console.log('');
    }

    if (this.tracker.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      this.tracker.recommendations.forEach(recommendation => {
        console.log(`   ${recommendation}`);
      });
      console.log('');
    }

    // Summary
    console.log('📈 Summary:');
    console.log(`   - Improvements: ${this.tracker.improvements.length}`);
    console.log(`   - Regressions: ${this.tracker.regressions.length}`);
    console.log(`   - Recommendations: ${this.tracker.recommendations.length}`);
    
    if (this.tracker.improvements.length > this.tracker.regressions.length) {
      console.log('🎉 Overall: UX is improving!');
    } else if (this.tracker.regressions.length > this.tracker.improvements.length) {
      console.log('⚠️ Overall: UX needs attention');
    } else {
      console.log('➡️ Overall: UX is stable');
    }
  }

  async captureBeforeAfterScreenshots(): Promise<void> {
    console.log('📸 Capturing before/after screenshots...');
    
    const pages = ['/', '/about', '/contact', '/quiz', '/file-upload'];
    
    for (const page of pages) {
      const url = `${this.baseUrl}${page}`;
      const pageName = page === '/' ? 'home' : page.substring(1);
      
      try {
        await this.analyzer.captureScreenshot(url, `before-${pageName}`);
        console.log(`   ✅ Captured screenshot for ${pageName}`);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`   ❌ Failed to capture screenshot for ${pageName}: ${errorMessage}`);
      }
    }
  }

  async close(): Promise<void> {
    await this.server.stop();
    await this.analyzer.close();
    console.log('🛑 UX Feedback Loop closed');
  }
}

// Example usage
async function runUXFeedbackExample() {
  const feedbackLoop = new UXFeedbackLoop();
  
  try {
    // Initialize
    await feedbackLoop.initialize();
    
    // Establish baseline (first run)
    await feedbackLoop.establishBaseline();
    
    // Simulate some development time
    console.log('\n⏳ Simulating development time...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Analyze current state (after changes)
    await feedbackLoop.analyzeCurrentState();
    
    // Compare and generate feedback
    feedbackLoop.compareAndGenerateFeedback();
    
    // Print report
    feedbackLoop.printFeedbackReport();
    
    // Capture screenshots
    await feedbackLoop.captureBeforeAfterScreenshots();
    
  } catch (error) {
    console.error('💥 Error in UX feedback loop:', error);
  } finally {
    await feedbackLoop.close();
  }
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runUXFeedbackExample()
    .then(() => {
      console.log('\n🎉 UX Feedback Example completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 UX Feedback Example failed:', error);
      process.exit(1);
    });
}

export { UXFeedbackLoop }; 