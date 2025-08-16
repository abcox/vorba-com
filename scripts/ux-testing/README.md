# UX Testing with Puppeteer and MCP

This directory contains tools for automated UX analysis and feedback using Puppeteer and Model Context Protocol (MCP) integration.

## 🎯 Overview

The UX testing suite provides:
- **Automated accessibility analysis** - Check for missing alt attributes, form labels, ARIA labels
- **Performance monitoring** - Measure page load times, First Contentful Paint, etc.
- **Visual element analysis** - Count elements, check images, responsive design
- **Interaction testing** - Analyze clickable elements, form elements, navigation
- **MCP integration** - Real-time feedback loop for continuous UX improvement

## 🚀 Quick Start

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Start your Angular development server:
```bash
npm start
```

### Basic Usage

#### Run Full UX Audit
```bash
npm run ux:audit
```

This will:
- Analyze all main pages (home, about, contact, quiz, file-upload)
- Capture screenshots
- Generate accessibility scores
- Provide performance metrics
- Create recommendations

#### Analyze Specific URL
```bash
npm run ux:analyze-url http://localhost:4200/about
```

#### Run Basic Analysis
```bash
npm run ux:analyze
```

## 📊 What Gets Analyzed

### Accessibility (Score: 0-100)
- ✅ Missing alt attributes on images
- ✅ Missing form labels
- ✅ ARIA label usage
- ✅ Keyboard navigation support
- ✅ Color contrast issues

### Performance Metrics
- ⚡ Page load time
- ⚡ First Contentful Paint (FCP)
- ⚡ Largest Contentful Paint (LCP)
- ⚡ Cumulative Layout Shift (CLS)
- ⚡ First Input Delay (FID)

### Visual Elements
- 🖼️ Image loading status
- 🖼️ Total element count
- 🖼️ Responsive breakpoints
- 🖼️ Color scheme detection
- 🖼️ Viewport analysis

### Interactions
- 🖱️ Clickable elements count
- 🖱️ Form elements analysis
- 🖱️ Navigation elements
- 🖱️ Hover effects detection
- 🖱️ Focus state validation

## 🔧 MCP Integration

The MCP (Model Context Protocol) integration provides a feedback loop for continuous UX improvement:

### MCP Server Features
- **Real-time analysis** - Get instant feedback on UX changes
- **Automated recommendations** - Smart suggestions based on analysis results
- **Screenshot capture** - Visual documentation of UX states
- **Logging and reporting** - Track UX improvements over time

### Using MCP for Feedback

```typescript
import { MCPServer } from './mcp-ux-feedback';

const server = new MCPServer();
await server.start();

// Analyze a specific page
const result = await server.handleRequest({
  type: 'analyze_page',
  url: 'http://localhost:4200/quiz'
});

// Capture screenshot
const screenshot = await server.handleRequest({
  type: 'capture_screenshot',
  url: 'http://localhost:4200/quiz',
  description: 'Quiz page before improvements'
});

// Run full audit
const audit = await server.handleRequest({
  type: 'full_audit',
  baseUrl: 'http://localhost:4200'
});
```

## 📁 Output Structure

Results are saved to `ux-analysis-results/`:

```
ux-analysis-results/
├── ux-report-{timestamp}.html     # Human-readable HTML report
├── ux-report-{timestamp}.json     # Raw analysis data
├── screenshot-{page}.png          # Page screenshots
├── mcp-screenshot-{timestamp}.png # MCP-captured screenshots
└── mcp-feedback.log              # MCP feedback log
```

## 🎨 Customization

### Adding New Analysis Metrics

Edit `puppeteer-ux-analyzer.ts`:

```typescript
// Add new interface
interface CustomReport {
  // Your custom metrics
}

// Add to UXAnalysisResult
interface UXAnalysisResult {
  // ... existing properties
  custom: CustomReport;
}

// Implement analysis method
private async analyzeCustom(): Promise<CustomReport> {
  // Your custom analysis logic
}
```

### Customizing Recommendations

Edit `mcp-ux-feedback.ts`:

```typescript
private generateSmartRecommendations(analysis: any): string[] {
  const recommendations: string[] = [];
  
  // Add your custom recommendation logic
  if (analysis.custom.someMetric > threshold) {
    recommendations.push('Your custom recommendation');
  }
  
  return recommendations;
}
```

## 🔍 Advanced Usage

### Continuous Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/ux-test.yml
name: UX Testing
on: [push, pull_request]

jobs:
  ux-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run ux:audit
      - uses: actions/upload-artifact@v2
        with:
          name: ux-results
          path: ux-analysis-results/
```

### Custom Page Analysis

```typescript
import { PuppeteerUXAnalyzer } from './puppeteer-ux-analyzer';

const analyzer = new PuppeteerUXAnalyzer();
await analyzer.initialize();

// Analyze custom pages
const customPages = [
  'http://localhost:4200/custom-page-1',
  'http://localhost:4200/custom-page-2'
];

for (const page of customPages) {
  const analysis = await analyzer.analyzePage(page);
  console.log(`Analysis for ${page}:`, analysis);
}

await analyzer.close();
```

## 🐛 Troubleshooting

### Common Issues

1. **Puppeteer fails to launch**
   ```bash
   # On Linux, install dependencies
   sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
   ```

2. **Port already in use**
   ```bash
   # Kill processes on port 4200
   npm run kill-port-3000
   ```

3. **Memory issues**
   ```bash
   # Increase Node.js memory limit
   node --max-old-space-size=4096 scripts/ux-testing/puppeteer-ux-analyzer.ts
   ```

### Debug Mode

Enable debug logging:

```typescript
const analyzer = new PuppeteerUXAnalyzer();
await analyzer.initialize();

// Enable debug mode
process.env.DEBUG = 'puppeteer:*';
```

## 📈 Best Practices

1. **Run regularly** - Schedule UX audits as part of your development workflow
2. **Track improvements** - Monitor accessibility scores over time
3. **Focus on priorities** - Address high-priority recommendations first
4. **Test across devices** - Use different viewport sizes
5. **Document changes** - Keep screenshots for before/after comparisons

## 🤝 Contributing

To add new UX analysis features:

1. Fork the repository
2. Create a feature branch
3. Add your analysis logic
4. Update tests and documentation
5. Submit a pull request

## 📚 Resources

- [Puppeteer Documentation](https://pptr.dev/)
- [Web Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Performance Best Practices](https://web.dev/performance/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the logs in `ux-analysis-results/`
3. Create an issue with detailed error information 