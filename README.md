# 🧪 Playwright TypeScript Test Automation Framework

A modern, scalable, and modular test automation framework built with Playwright and TypeScript, featuring comprehensive testing capabilities including UI, API, visual regression, accessibility, and performance testing.

[![Playwright Tests](https://github.com/gauravkhuraana/PlaywrightTypeScriptWithAgenticAI/actions/workflows/playwright-tests.yml/badge.svg)](https://github.com/gauravkhuraana/PlaywrightTypeScriptWithAgenticAI/actions/workflows/playwright-tests.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)

## 🌟 Features

### Core Capabilities
- **Cross-Browser Testing**: Chromium, Firefox, WebKit support
- **Multiple Test Types**: UI, API, Visual Regression, Accessibility, Performance
- **Page Object Model**: Scalable and maintainable test architecture
- **Dependency Injection**: Custom fixtures for clean test organization
- **Parallel Execution**: Fast test execution with built-in parallelization
- **Comprehensive Reporting**: HTML, Allure, JUnit XML, Custom CSV/JSON reports

### Advanced Features
- **Visual Regression Testing**: Automated screenshot comparison with configurable thresholds
- **Accessibility Testing**: WCAG compliance validation with detailed reporting
- **Performance Testing**: Core Web Vitals monitoring and performance benchmarking
- **API Testing**: Full HTTP client with response validation and performance tracking
- **Mobile Testing**: Device emulation and responsive testing
- **Video Recording**: Test execution recording for debugging
- **Screenshot Capture**: Automated screenshot capture on failures

### DevOps & CI/CD
- **Docker Support**: Containerized test execution
- **GitHub Actions**: Automated CI/CD pipeline with matrix strategy
- **Report Publishing**: Automatic report deployment to GitHub Pages
- **Notifications**: Slack and Teams integration
- **Security Scanning**: Vulnerability scanning with Trivy
- **Environment Management**: Multi-environment configuration support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gauravkhuraana/PlaywrightTypeScriptWithAgenticAI.git
   cd PlaywrightTypeScriptWithAgenticAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

4. **Run sample tests**
   ```bash
   npm run test
   ```

## 📁 Project Structure

```
PlaywrightTypeScriptWithAgenticAI/
├── .github/workflows/          # GitHub Actions CI/CD
├── src/
│   ├── fixtures/              # Custom test fixtures
│   ├── pages/                 # Page Object Model classes
│   ├── types/                 # TypeScript type definitions
│   ├── utils/                 # Utility classes and helpers
│   └── reporters/             # Custom test reporters
├── tests/
│   ├── accessibility/         # Accessibility tests
│   ├── api/                   # API integration tests
│   ├── performance/           # Performance tests
│   ├── ui/                    # UI/functional tests
│   └── visual/                # Visual regression tests
├── test-data/                 # Test data files
├── docker-compose.yml         # Docker configuration
├── Dockerfile                 # Container definition
├── playwright.config.ts       # Playwright configuration
└── package.json              # Dependencies and scripts
```

## 🎯 Usage Examples

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test suite
npm run test:smoke
npm run test:regression
npm run test:api
npm run test:visual
npm run test:accessibility
npm run test:performance

# Run tests in specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Run tests in headed mode
npm run test:headed

# Run tests with debug
npm run test:debug
```

### Test Categories by Tags

```bash
# Smoke tests
npx playwright test --grep "@smoke"

# Regression tests  
npx playwright test --grep "@regression"

# API tests
npx playwright test --grep "@api"

# Visual tests
npx playwright test --grep "@visual"

# Accessibility tests
npx playwright test --grep "@accessibility"

# Performance tests
npx playwright test --grep "@performance"
```

### Generate Reports

```bash
# Generate HTML report
npm run report

# Generate Allure report
npm run allure:generate
npm run allure:serve

# Test Allure configuration
npm run allure:test

# Open last HTML report
npm run report:open
```

### Troubleshooting Allure Reports

If you see "No Allure test results available" in your CI/CD pipeline:

1. **Local Verification**: Run `npm run allure:test` to verify Allure works locally
2. **Check Results**: Ensure `allure-results/` directory contains `.json` files after test runs
3. **Validate Configuration**: Verify `playwright.config.ts` includes the `allure-playwright` reporter
4. **CI Debugging**: The GitHub Actions workflow includes debug steps to show artifact structure

Common fixes:
- Ensure tests are actually running in CI (check test execution logs)
- Verify `allure-playwright` package is installed
- Check that Allure results are being uploaded as artifacts correctly
- Ensure the merge-reports job properly combines results from multiple shards

## 🏗️ Framework Architecture

### Page Object Model
```typescript
// Example: Example.com Page (automation-friendly test site)
export class ExamplePage extends BasePage {
  private readonly pageHeading: Locator;
  private readonly pageDescription: Locator;
  private readonly moreInfoLink: Locator;

  constructor(page: Page, logger?: Logger) {
    super(page, logger || new Logger('ExamplePage'), 'https://example.com');
    this.pageHeading = page.locator('h1');
    this.pageDescription = page.locator('p');
    this.moreInfoLink = page.locator('a[href*="iana.org"]');
  }

  async validatePageStructure(): Promise<boolean> {
    const heading = await this.getHeading();
    const description = await this.getDescription();
    return heading.includes('Example Domain') && description.length > 0;
  }
}
```

### Custom Fixtures
```typescript
// Example: Using custom fixtures with automation-friendly sites
test('should validate example page with fixtures', async ({ 
  examplePage, 
  logger, 
  testDataManager 
}) => {
  await examplePage.goto();
  await examplePage.waitForPageLoad();
  
  const isValid = await examplePage.hasExpectedContent();
  expect(isValid).toBe(true);
  
  logger.info('Example page validation completed');
});
```

### Utility Classes
- **Logger**: Structured logging with multiple output formats
- **ApiClient**: HTTP client with response validation and metrics
- **ScreenshotHelper**: Advanced screenshot management
- **VideoHelper**: Video recording and processing
- **PerformanceHelper**: Performance metrics collection
- **AccessibilityHelper**: WCAG compliance validation
- **TestDataManager**: Test data management with JSON/YAML support

## 🐳 Docker Usage

### Run tests in Docker
```bash
# Build and run tests
docker-compose up --build

# Run specific test suite
docker-compose run playwright-tests npm run test:smoke

# Run with custom command
docker-compose run playwright-tests npx playwright test --grep "@api"
```

### View reports
```bash
# Access reports at:
# Playwright reports: http://localhost:8080/playwright
# Allure reports: http://localhost:5050
```

## 🔧 Configuration

### Environment Variables
```bash
# Core configuration - using automation-friendly sites
BASE_URL=https://example.com
API_BASE_URL=https://httpbin.org
TEST_ENV=staging
CI=true

# Feature toggles
DEBUG=pw:api*
LOG_TO_FILE=true
ENABLE_NOTIFICATIONS=true
START_SERVER=false

# Notification webhooks
SLACK_WEBHOOK_URL=your-slack-webhook
TEAMS_WEBHOOK_URL=your-teams-webhook
EMAIL_ENABLED=true
```

### Playwright Configuration
The framework supports multiple projects and environments:
- **Cross-browser testing**: Chromium, Firefox, WebKit
- **Mobile testing**: iPhone, Android device emulation
- **API testing**: Dedicated API test project
- **Visual testing**: Screenshot comparison project

## 📊 Test Reporting

### HTML Reports
- Interactive test results with filtering
- Screenshots and videos for failed tests
- Performance metrics and timing data
- Test retry information

### Allure Reports
- Comprehensive test analytics
- Historical trend analysis
- Test categorization and tagging
- Rich attachments and screenshots

### Custom Reports
- CSV export for test metrics
- JSON reports for CI/CD integration
- Performance benchmarking reports
- Accessibility compliance reports

## 🚦 CI/CD Pipeline

The framework includes a comprehensive GitHub Actions pipeline:

### Features
- **Matrix Testing**: Parallel execution across browsers and shards
- **Report Merging**: Consolidated reports from multiple shards
- **Artifact Management**: Automatic report archiving
- **GitHub Pages**: Automatic report publishing
- **Notifications**: Slack and Teams integration
- **Security Scanning**: Vulnerability assessment
- **Environment Support**: Multiple deployment environments

### Workflow Triggers
- Push to main/develop branches
- Pull request creation
- Scheduled runs (daily at 2 AM UTC)
- Manual workflow dispatch with parameters

## 🔒 Security & Best Practices

### Security Features
- Container security scanning with Trivy
- npm audit integration
- Secrets management for sensitive data
- Non-root container execution

### Code Quality
- TypeScript strict mode
- ESLint configuration
- Prettier code formatting
- Husky git hooks
- Dependency vulnerability scanning

## 🛠️ Development

### Adding New Tests
1. Create test files in appropriate directory (`tests/ui/`, `tests/api/`, etc.)
2. Use custom fixtures for dependency injection
3. Follow Page Object Model patterns
4. Add appropriate test tags (`@smoke`, `@regression`, etc.)
5. Include allure annotations for reporting

### Adding New Page Objects
1. Extend `BasePage` class
2. Define locators in constructor
3. Implement page-specific methods
4. Add to fixtures for dependency injection

### Adding New Utilities
1. Create utility class in `src/utils/`
2. Add to base fixtures
3. Include proper TypeScript types
4. Add comprehensive error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Playwright](https://playwright.dev/) - Modern web testing framework
- [Allure](https://docs.qameta.io/allure/) - Test reporting framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript

## 📚 Documentation

- **[Symbol Definitions Guide](SYMBOL_DEFINITIONS.md)** - Learn how types, interfaces, classes, and other symbols are defined in this repository
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - Overview of completed features and framework components
- **[Allure Fix Summary](ALLURE_FIX_SUMMARY.md)** - Allure reporting configuration and troubleshooting

## 📞 Support

- 💬 Slack: #test-automation
- 🐛 Issues: [GitHub Issues](https://github.com/gauravkhuraana/PlaywrightTypeScriptWithAgenticAI/issues)
- 📖 Wiki: [Documentation](https://github.com/gauravkhuraana/PlaywrightTypeScriptWithAgenticAI/wiki)

---

**Built with ❤️ for the testing community**
