import puppeteer, { Browser, Page, ElementHandle } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

interface UXAnalysisResult {
  timestamp: string;
  url: string;
  pageTitle: string;
  accessibility: AccessibilityReport;
  performance: PerformanceReport;
  visual: VisualReport;
  interactions: InteractionReport;
  recommendations: string[];
}

interface AccessibilityReport {
  score: number;
  issues: string[];
  ariaLabels: string[];
  colorContrast: string[];
  keyboardNavigation: boolean;
}

interface PerformanceReport {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

interface VisualReport {
  viewportSize: { width: number; height: number };
  elementCount: number;
  images: { src: string; alt: string; loaded: boolean }[];
  responsiveBreakpoints: string[];
  colorScheme: 'light' | 'dark' | 'auto';
}

interface InteractionReport {
  clickableElements: number;
  formElements: number;
  navigationElements: number;
  hoverEffects: string[];
  focusStates: boolean;
}

export class PuppeteerUXAnalyzer {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private resultsDir: string;

  constructor() {
    this.resultsDir = path.join(process.cwd(), 'ux-analysis-results');
    this.ensureResultsDirectory();
  }

  private ensureResultsDirectory(): void {
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
    }
  }

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Puppeteer UX Analyzer...');
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Enable performance monitoring
    await this.page.setCacheEnabled(false);
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  async analyzePage(url: string): Promise<UXAnalysisResult> {
    if (!this.page) throw new Error('Page not initialized');

    console.log(`🔍 Analyzing UX for: ${url}`);
    
    const startTime = Date.now();
    await this.page.goto(url, { waitUntil: 'networkidle2' });
    
    const analysis: UXAnalysisResult = {
      timestamp: new Date().toISOString(),
      url,
      pageTitle: await this.page.title(),
      accessibility: await this.analyzeAccessibility(),
      performance: await this.analyzePerformance(startTime),
      visual: await this.analyzeVisualElements(),
      interactions: await this.analyzeInteractions(),
      recommendations: []
    };

    analysis.recommendations = this.generateRecommendations(analysis);
    
    return analysis;
  }

  private async analyzeAccessibility(): Promise<AccessibilityReport> {
    if (!this.page) throw new Error('Page not initialized');

    const accessibility = await this.page.evaluate(() => {
      const issues: string[] = [];
      const ariaLabels: string[] = [];
      const colorContrast: string[] = [];

      // Check for missing alt attributes
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.alt) {
          issues.push(`Image missing alt attribute: ${img.src}`);
        }
      });

      // Check for ARIA labels
      const elementsWithAria = document.querySelectorAll('[aria-label]');
      elementsWithAria.forEach(el => {
        ariaLabels.push(`${el.tagName.toLowerCase()}: ${el.getAttribute('aria-label')}`);
      });

      // Check for form labels
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        const id = input.getAttribute('id');
        if (id && !document.querySelector(`label[for="${id}"]`)) {
          issues.push(`Input missing label: ${id}`);
        }
      });

      // Test keyboard navigation
      const focusableElements = document.querySelectorAll('button, a, input, textarea, select, [tabindex]');
      const keyboardNavigation = focusableElements.length > 0;

      return {
        score: Math.max(0, 100 - issues.length * 10),
        issues,
        ariaLabels,
        colorContrast,
        keyboardNavigation
      };
    });

    return accessibility;
  }

  private async analyzePerformance(startTime: number): Promise<PerformanceReport> {
    if (!this.page) throw new Error('Page not initialized');

    const performanceMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: 0, // Would need to be calculated over time
        cumulativeLayoutShift: 0, // Would need to be calculated over time
        firstInputDelay: 0 // Would need to be calculated over time
      };
    });

    performanceMetrics.loadTime = Date.now() - startTime;
    
    return performanceMetrics;
  }

  private async analyzeVisualElements(): Promise<VisualReport> {
    if (!this.page) throw new Error('Page not initialized');

    const visual = await this.page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt,
        loaded: img.complete
      }));

      const elementCount = document.querySelectorAll('*').length;
      
      // Check for responsive design indicators
      const responsiveBreakpoints: string[] = [];
      const styles = getComputedStyle(document.body);
      if (styles.getPropertyValue('--breakpoint-sm')) responsiveBreakpoints.push('sm');
      if (styles.getPropertyValue('--breakpoint-md')) responsiveBreakpoints.push('md');
      if (styles.getPropertyValue('--breakpoint-lg')) responsiveBreakpoints.push('lg');
      if (styles.getPropertyValue('--breakpoint-xl')) responsiveBreakpoints.push('xl');

      // Detect color scheme
      let colorScheme: 'light' | 'dark' | 'auto' = 'auto';
      if (document.documentElement.classList.contains('dark')) colorScheme = 'dark';
      else if (document.documentElement.classList.contains('light')) colorScheme = 'light';

      return {
        viewportSize: { width: window.innerWidth, height: window.innerHeight },
        elementCount,
        images,
        responsiveBreakpoints,
        colorScheme
      };
    });

    return visual;
  }

  private async analyzeInteractions(): Promise<InteractionReport> {
    if (!this.page) throw new Error('Page not initialized');

    const interactions = await this.page.evaluate(() => {
      const clickableElements = document.querySelectorAll('button, a, [role="button"]').length;
      const formElements = document.querySelectorAll('input, textarea, select').length;
      const navigationElements = document.querySelectorAll('nav, [role="navigation"]').length;

      // Check for hover effects
      const hoverEffects: string[] = [];
      const elements = document.querySelectorAll('*');
      elements.forEach(el => {
        const styles = getComputedStyle(el);
        if (styles.transition || styles.animation) {
          hoverEffects.push(`${el.tagName.toLowerCase()}: ${styles.transition || styles.animation}`);
        }
      });

      // Check focus states
      const focusStates = document.querySelectorAll('button:focus, a:focus, input:focus').length > 0;

      return {
        clickableElements,
        formElements,
        navigationElements,
        hoverEffects: hoverEffects.slice(0, 10), // Limit to first 10
        focusStates
      };
    });

    return interactions;
  }

  private generateRecommendations(analysis: UXAnalysisResult): string[] {
    const recommendations: string[] = [];

    // Accessibility recommendations
    if (analysis.accessibility.score < 80) {
      recommendations.push('🔧 Improve accessibility: Add missing alt attributes and form labels');
    }
    if (!analysis.accessibility.keyboardNavigation) {
      recommendations.push('⌨️ Ensure keyboard navigation works for all interactive elements');
    }

    // Performance recommendations
    if (analysis.performance.loadTime > 3000) {
      recommendations.push('⚡ Optimize page load time: Consider lazy loading and code splitting');
    }

    // Visual recommendations
    if (analysis.visual.images.some(img => !img.loaded)) {
      recommendations.push('🖼️ Optimize image loading: Use proper image formats and lazy loading');
    }
    if (analysis.visual.responsiveBreakpoints.length === 0) {
      recommendations.push('📱 Implement responsive design breakpoints');
    }

    // Interaction recommendations
    if (!analysis.interactions.focusStates) {
      recommendations.push('🎯 Add visible focus states for better accessibility');
    }

    return recommendations;
  }

  async captureScreenshot(url: string, filename: string): Promise<string> {
    if (!this.page) throw new Error('Page not initialized');

    await this.page.goto(url, { waitUntil: 'networkidle2' });
    const screenshotPath = path.join(this.resultsDir, `${filename}.png`);
    await this.page.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    });
    
    return screenshotPath;
  }

  async generateReport(analysis: UXAnalysisResult): Promise<string> {
    const reportPath = path.join(this.resultsDir, `ux-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateHTMLReport(analysis);
    const htmlPath = path.join(this.resultsDir, `ux-report-${Date.now()}.html`);
    fs.writeFileSync(htmlPath, htmlReport);
    
    return htmlPath;
  }

  private generateHTMLReport(analysis: UXAnalysisResult): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UX Analysis Report - ${analysis.pageTitle}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .score { font-size: 24px; font-weight: bold; }
        .good { color: green; }
        .warning { color: orange; }
        .error { color: red; }
        .recommendation { background: #f0f8ff; padding: 10px; margin: 5px 0; border-left: 4px solid #0066cc; }
    </style>
</head>
<body>
    <h1>UX Analysis Report</h1>
    <div class="section">
        <h2>Page Information</h2>
        <p><strong>URL:</strong> ${analysis.url}</p>
        <p><strong>Title:</strong> ${analysis.pageTitle}</p>
        <p><strong>Analyzed:</strong> ${analysis.timestamp}</p>
    </div>
    
    <div class="section">
        <h2>Accessibility Score</h2>
        <div class="score ${analysis.accessibility.score >= 80 ? 'good' : analysis.accessibility.score >= 60 ? 'warning' : 'error'}">
            ${analysis.accessibility.score}/100
        </div>
        <h3>Issues Found:</h3>
        <ul>
            ${analysis.accessibility.issues.map(issue => `<li>${issue}</li>`).join('')}
        </ul>
    </div>
    
    <div class="section">
        <h2>Performance Metrics</h2>
        <p><strong>Load Time:</strong> ${analysis.performance.loadTime}ms</p>
        <p><strong>First Contentful Paint:</strong> ${analysis.performance.firstContentfulPaint}ms</p>
    </div>
    
    <div class="section">
        <h2>Visual Elements</h2>
        <p><strong>Total Elements:</strong> ${analysis.visual.elementCount}</p>
        <p><strong>Images:</strong> ${analysis.visual.images.length}</p>
        <p><strong>Color Scheme:</strong> ${analysis.visual.colorScheme}</p>
    </div>
    
    <div class="section">
        <h2>Interactions</h2>
        <p><strong>Clickable Elements:</strong> ${analysis.interactions.clickableElements}</p>
        <p><strong>Form Elements:</strong> ${analysis.interactions.formElements}</p>
        <p><strong>Navigation Elements:</strong> ${analysis.interactions.navigationElements}</p>
    </div>
    
    <div class="section">
        <h2>Recommendations</h2>
        ${analysis.recommendations.map(rec => `<div class="recommendation">${rec}</div>`).join('')}
    </div>
</body>
</html>`;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// MCP Integration Functions
export async function analyzeVorbaWebUX(baseUrl: string = 'http://localhost:4200'): Promise<UXAnalysisResult> {
  const analyzer = new PuppeteerUXAnalyzer();
  
  try {
    await analyzer.initialize();
    
    // Analyze main pages
    const pages = [
      '/',
      '/about',
      '/contact',
      '/quiz',
      '/file-upload'
    ];

    const results: UXAnalysisResult[] = [];
    
    for (const page of pages) {
      try {
        const result = await analyzer.analyzePage(`${baseUrl}${page}`);
        results.push(result);
        
        // Capture screenshot
        await analyzer.captureScreenshot(`${baseUrl}${page}`, `screenshot-${page.replace('/', '')}`);
        
        console.log(`✅ Analyzed ${page}: Accessibility Score ${result.accessibility.score}/100`);
      } catch (error) {
        console.error(`❌ Failed to analyze ${page}:`, error);
      }
    }

    // Generate comprehensive report
    const combinedResult = results[0]; // Use first result as base
    combinedResult.recommendations = [
      ...combinedResult.recommendations,
      `📊 Analyzed ${results.length} pages total`,
      '📈 Consider implementing A/B testing for key user flows',
      '🎨 Review color contrast ratios for better accessibility',
      '📱 Test on multiple device sizes and orientations'
    ];

    const reportPath = await analyzer.generateReport(combinedResult);
    console.log(`📄 UX Report generated: ${reportPath}`);

    return combinedResult;
  } finally {
    await analyzer.close();
  }
}

// CLI Usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const baseUrl = process.argv[2] || 'http://localhost:4200';
  analyzeVorbaWebUX(baseUrl)
    .then(result => {
      console.log('🎉 UX Analysis completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 UX Analysis failed:', error);
      process.exit(1);
    });
} 