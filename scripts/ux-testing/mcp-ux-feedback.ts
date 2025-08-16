import { PuppeteerUXAnalyzer, analyzeVorbaWebUX } from './puppeteer-ux-analyzer';
import * as fs from 'fs';
import * as path from 'path';

interface MCPUXFeedback {
  type: 'analysis' | 'screenshot' | 'recommendation' | 'error';
  timestamp: string;
  data: any;
  message: string;
}

export class MCPUXFeedbackProvider {
  private analyzer: PuppeteerUXAnalyzer;
  private feedbackLog: MCPUXFeedback[] = [];
  private logFile: string;

  constructor() {
    this.analyzer = new PuppeteerUXAnalyzer();
    this.logFile = path.join(process.cwd(), 'ux-analysis-results', 'mcp-feedback.log');
  }

  async initialize(): Promise<void> {
    await this.analyzer.initialize();
    this.logFeedback({
      type: 'analysis',
      data: { status: 'initialized' },
      message: 'MCP UX Feedback Provider initialized successfully'
    });
  }

  private logFeedback(feedback: Omit<MCPUXFeedback, 'timestamp'>): void {
    const fullFeedback: MCPUXFeedback = {
      ...feedback,
      timestamp: new Date().toISOString()
    };
    
    this.feedbackLog.push(fullFeedback);
    
    // Write to log file
    fs.appendFileSync(this.logFile, JSON.stringify(fullFeedback) + '\n');
    
    // Console output for MCP
    console.log(`[MCP-UX] ${fullFeedback.type.toUpperCase()}: ${fullFeedback.message}`);
  }

  async analyzeCurrentPage(url: string): Promise<MCPUXFeedback> {
    try {
      const analysis = await this.analyzer.analyzePage(url);
      
      const feedback: MCPUXFeedback = {
        type: 'analysis',
        timestamp: new Date().toISOString(),
        data: analysis,
        message: `UX Analysis completed for ${url} - Accessibility Score: ${analysis.accessibility.score}/100`
      };

      this.logFeedback(feedback);
      return feedback;
    } catch (error) {
      const errorFeedback: MCPUXFeedback = {
        type: 'error',
        timestamp: new Date().toISOString(),
        data: { error: (error as Error).message },
        message: `Failed to analyze ${url}: ${(error as Error).message}`
      };
      
      this.logFeedback(errorFeedback);
      throw error;
    }
  }

  async capturePageScreenshot(url: string, description: string): Promise<MCPUXFeedback> {
    try {
      const filename = `mcp-screenshot-${Date.now()}`;
      const screenshotPath = await this.analyzer.captureScreenshot(url, filename);
      
      const feedback: MCPUXFeedback = {
        type: 'screenshot',
        timestamp: new Date().toISOString(),
        data: { 
          path: screenshotPath,
          url,
          description
        },
        message: `Screenshot captured: ${description}`
      };

      this.logFeedback(feedback);
      return feedback;
    } catch (error) {
      const errorFeedback: MCPUXFeedback = {
        type: 'error',
        timestamp: new Date().toISOString(),
        data: { error: (error as Error).message },
        message: `Failed to capture screenshot: ${(error as Error).message}`
      };
      
      this.logFeedback(errorFeedback);
      throw error;
    }
  }

  async generateUXRecommendations(analysis: any): Promise<MCPUXFeedback> {
    const recommendations = this.generateSmartRecommendations(analysis);
    
    const feedback: MCPUXFeedback = {
      type: 'recommendation',
      timestamp: new Date().toISOString(),
      data: { recommendations },
      message: `Generated ${recommendations.length} UX recommendations`
    };

    this.logFeedback(feedback);
    return feedback;
  }

  private generateSmartRecommendations(analysis: any): string[] {
    const recommendations: string[] = [];

    // Accessibility recommendations
    if (analysis.accessibility.score < 90) {
      recommendations.push('🔧 **High Priority**: Improve accessibility score by addressing missing alt attributes and form labels');
    }
    if (analysis.accessibility.issues.length > 5) {
      recommendations.push('🎯 **Medium Priority**: Reduce accessibility issues by implementing proper ARIA labels');
    }

    // Performance recommendations
    if (analysis.performance.loadTime > 2000) {
      recommendations.push('⚡ **High Priority**: Optimize page load time through code splitting and lazy loading');
    }

    // Visual recommendations
    if (analysis.visual.images.some((img: any) => !img.loaded)) {
      recommendations.push('🖼️ **Medium Priority**: Implement proper image optimization and lazy loading');
    }

    // Interaction recommendations
    if (!analysis.interactions.focusStates) {
      recommendations.push('⌨️ **Medium Priority**: Add visible focus states for keyboard navigation');
    }

    // General UX recommendations
    recommendations.push('📊 **Continuous**: Implement user analytics to track real user behavior');
    recommendations.push('🎨 **Design**: Consider implementing a design system for consistency');
    recommendations.push('📱 **Mobile**: Ensure responsive design works across all device sizes');

    return recommendations;
  }

  async runFullUXAudit(baseUrl: string = 'http://localhost:4200'): Promise<MCPUXFeedback[]> {
    const feedbacks: MCPUXFeedback[] = [];
    
    try {
      this.logFeedback({
        type: 'analysis',
        data: { baseUrl },
        message: `Starting full UX audit for ${baseUrl}`
      });

      const pages = [
        { path: '/', name: 'Home Page' },
        { path: '/about', name: 'About Page' },
        { path: '/contact', name: 'Contact Page' },
        { path: '/quiz', name: 'Quiz Page' },
        { path: '/file-upload', name: 'File Upload Page' }
      ];

      for (const page of pages) {
        try {
          const url = `${baseUrl}${page.path}`;
          
          // Analyze page
          const analysisFeedback = await this.analyzeCurrentPage(url);
          feedbacks.push(analysisFeedback);
          
          // Capture screenshot
          const screenshotFeedback = await this.capturePageScreenshot(url, page.name);
          feedbacks.push(screenshotFeedback);
          
          // Generate recommendations
          const recommendationFeedback = await this.generateUXRecommendations(analysisFeedback.data);
          feedbacks.push(recommendationFeedback);
          
        } catch (error) {
          const errorFeedback: MCPUXFeedback = {
            type: 'error',
            timestamp: new Date().toISOString(),
            data: { page: page.path, error: (error as Error).message },
            message: `Failed to audit ${page.name}: ${(error as Error).message}`
          };
          feedbacks.push(errorFeedback);
        }
      }

      this.logFeedback({
        type: 'analysis',
        data: { pagesAnalyzed: pages.length },
        message: `Full UX audit completed - ${pages.length} pages analyzed`
      });

    } catch (error) {
      const errorFeedback: MCPUXFeedback = {
        type: 'error',
        timestamp: new Date().toISOString(),
        data: { error: (error as Error).message },
        message: `Full UX audit failed: ${(error as Error).message}`
      };
      feedbacks.push(errorFeedback);
    }

    return feedbacks;
  }

  getFeedbackSummary(): MCPUXFeedback[] {
    return this.feedbackLog.slice(-10); // Return last 10 feedback items
  }

  async close(): Promise<void> {
    await this.analyzer.close();
    this.logFeedback({
      type: 'analysis',
      data: { status: 'closed' },
      message: 'MCP UX Feedback Provider closed'
    });
  }
}

// MCP Server Integration
export class MCPServer {
  private feedbackProvider: MCPUXFeedbackProvider;
  private isRunning: boolean = false;

  constructor() {
    this.feedbackProvider = new MCPUXFeedbackProvider();
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    
    await this.feedbackProvider.initialize();
    this.isRunning = true;
    
    console.log('🚀 MCP UX Feedback Server started');
    console.log('📡 Ready to receive UX analysis requests');
  }

  async handleRequest(request: any): Promise<any> {
    if (!this.isRunning) {
      throw new Error('MCP Server not running');
    }

    switch (request.type) {
      case 'analyze_page':
        return await this.feedbackProvider.analyzeCurrentPage(request.url);
      
      case 'capture_screenshot':
        return await this.feedbackProvider.capturePageScreenshot(request.url, request.description);
      
      case 'full_audit':
        return await this.feedbackProvider.runFullUXAudit(request.baseUrl);
      
      case 'get_summary':
        return this.feedbackProvider.getFeedbackSummary();
      
      default:
        throw new Error(`Unknown request type: ${request.type}`);
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;
    
    await this.feedbackProvider.close();
    this.isRunning = false;
    
    console.log('🛑 MCP UX Feedback Server stopped');
  }
}

// CLI Usage for MCP Integration
// Normalize paths for comparison
const currentFile = import.meta.url.replace('file:///', '').replace(/\//g, '\\');
const scriptFile = process.argv[1].replace(/\//g, '\\');

if (currentFile.endsWith(scriptFile)) {
  const server = new MCPServer();
  
  async function main() {
    try {
      await server.start();
      
      // Example: Run full audit
      const results = await server.handleRequest({
        type: 'full_audit',
        baseUrl: 'http://localhost:4200'
      });
      
      console.log('📊 UX Audit Results:');
      results.forEach((result: MCPUXFeedback) => {
        console.log(`- ${result.type}: ${result.message}`);
        
        // Display recommendations if this is a recommendation result
        if (result.type === 'recommendation' && result.data.recommendations) {
          console.log('  💡 Recommendations:');
          result.data.recommendations.forEach((rec: string, index: number) => {
            console.log(`    ${index + 1}. ${rec}`);
          });
          console.log(''); // Add spacing
        }
      });
      
    } catch (error) {
      console.error('💥 MCP Server error:', error);
    } finally {
      await server.stop();
    }
  }
  
  main();
}

// Classes are already exported above with 'export class' declarations 