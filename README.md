# Playwright TypeScript Test Automation Framework

Enterprise-grade, scalable test automation framework built with **Playwright** and **TypeScript**.  
Covers UI, API, visual-regression, accessibility and performance testing out of the box.

[![Playwright Tests](https://github.com/gauravkhuraana/PlaywrightTypeScriptWithAgenticAI/actions/workflows/playwright-tests.yml/badge.svg)](https://github.com/gauravkhuraana/PlaywrightTypeScriptWithAgenticAI/actions/workflows/playwright-tests.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)

---

## Table of Contents

1. [Features](#features)
2. [Quick Start](#quick-start)
3. [Project Structure](#project-structure)
4. [Running Tests](#running-tests)
5. [Parallelism & Sharding](#parallelism--sharding)
6. [Multi-Browser Testing](#multi-browser-testing)
7. [Multi-Environment Support](#multi-environment-support)
8. [Test Data Handling](#test-data-handling)
9. [File Handling](#file-handling)
10. [Reporting](#reporting)
11. [CI/CD Pipelines](#cicd-pipelines)
12. [Docker](#docker)
13. [Framework Architecture](#framework-architecture)
14. [Configuration Reference](#configuration-reference)
15. [Contributing](#contributing)

---

## Features

| Category | Capability |
|---|---|
| **Browsers** | Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari, Tablet |
| **Test Types** | UI · API · Visual Regression · Accessibility · Performance |
| **Architecture** | Page Object Model · Custom Fixtures · Dependency Injection |
| **Parallelism** | Fully parallel execution · CI sharding across agents |
| **Environments** | dev · staging · production — switchable via `TEST_ENV` |
| **Test Data** | JSON / YAML / API sourced · per-environment data files |
| **File Handling** | Download verification · Upload helpers · CSV/JSON readers |
| **Reporting** | HTML · Allure · JUnit XML · Custom JSON/CSV/HTML · Metrics |
| **CI/CD** | GitHub Actions · **Azure DevOps Pipelines** |
| **Containers** | Docker & Docker Compose with report serving |
| **Notifications** | Slack · Microsoft Teams · Email |
| **Security** | Trivy scanning · npm audit · non-root containers |
| **Code Quality** | TypeScript strict mode · ESLint · Prettier · Husky hooks |

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** (ships with Node)
- **Git**

### Install & Run

```bash
# 1. Clone
git clone https://github.com/gauravkhuraana/PlaywrightTypeScriptWithAgenticAI.git
cd PlaywrightTypeScriptWithAgenticAI

# 2. Install dependencies
npm install

# 3. Install browsers
npx playwright install --with-deps

# 4. Copy environment config (edit as needed)
cp .env.example .env

# 5. Run all tests
npm test
```

---

## Project Structure

```
├── .github/workflows/           # GitHub Actions pipeline
├── azure-pipelines.yml          # Azure DevOps pipeline
├── src/
│   ├── data/                    # Test data (per-environment JSON)
│   │   ├── default.json
│   │   ├── dev.json
│   │   ├── staging.json
│   │   └── production.json
│   ├── fixtures/                # Custom Playwright fixtures
│   │   ├── base-fixtures.ts     # Core fixtures (logger, API, helpers)
│   │   └── page-fixtures.ts     # Page-object fixtures
│   ├── pages/                   # Page Object Model classes
│   │   ├── base-page.ts
│   │   └── example-page.ts
│   ├── reporters/               # Custom reporters
│   │   └── custom-reporter.ts
│   ├── types/                   # TypeScript interfaces
│   │   ├── test-data.ts
│   │   └── test-options.ts
│   └── utils/                   # Utility classes
│       ├── accessibility-helper.ts
│       ├── api-client.ts
│       ├── file-helper.ts       # Download/upload/file operations
│       ├── logger.ts
│       ├── performance-helper.ts
│       ├── screenshot-helper.ts
│       ├── test-data-manager.ts
│       └── video-helper.ts
├── tests/
│   ├── api/                     # API integration tests
│   ├── demo/                    # Demo / sample tests
│   └── page-object/             # POM-based UI tests
├── playwright.config.ts         # Playwright configuration
├── global-setup.ts              # Runs once before all tests
├── global-teardown.ts           # Runs once after all tests
├── docker-compose.yml
├── Dockerfile
├── .env.example                 # Environment variable template
└── package.json
```

---

## Running Tests

```bash
# All tests
npm test

# By browser
npm run test:chromium
npm run test:firefox
npm run test:webkit
npm run test:mobile

# By type
npm run test:api
npm run test:ui
npm run test:visual
npm run test:accessibility
npm run test:performance

# By tag
npx playwright test --grep "@smoke"
npx playwright test --grep "@regression"

# Interactive / debug
npm run test:headed        # Visible browser
npm run test:debug         # Step-through debugger
npm run test:ui-mode       # Playwright UI mode
npx playwright codegen     # Code generator
```

---

## Parallelism & Sharding

The framework is configured for maximum parallel execution:

| Setting | Value | Where |
|---|---|---|
| `fullyParallel` | `true` | `playwright.config.ts` — runs tests in each file in parallel |
| `workers` | auto (CPU count) locally, `1` on CI | `playwright.config.ts` |
| CI sharding | 4 shards × 3 browsers = 12 parallel jobs | GitHub Actions / Azure DevOps |

### Run with sharding locally

```bash
# Split into 4 shards, run shard 1
npx playwright test --shard=1/4

# Run only chromium, shard 2 of 4
npx playwright test --project=chromium --shard=2/4
```

### CI Matrix Strategy

Both GitHub Actions and Azure DevOps pipelines use a **browser × shard** matrix so tests run across multiple agents simultaneously, dramatically reducing wall-clock time.

---

## Multi-Browser Testing

Configured projects in `playwright.config.ts`:

| Project | Device / Engine |
|---|---|
| `chromium` | Desktop Chrome |
| `firefox` | Desktop Firefox |
| `webkit` | Desktop Safari |
| `mobile-chrome` | Pixel 5 emulation |
| `mobile-safari` | iPhone 12 emulation |
| `tablet` | iPad Pro emulation |
| `api` | Headless (API-only tests) |
| `visual-chromium` | Chrome for screenshot comparison |

```bash
# Run a specific project
npx playwright test --project=firefox

# Run multiple projects
npx playwright test --project=chromium --project=firefox
```

---

## Multi-Environment Support

Switch environments with the `TEST_ENV` variable. Each environment loads its own test data file from `src/data/`.

```bash
# Run against staging (default)
npm test

# Run against dev
TEST_ENV=dev npm test

# Run against production
TEST_ENV=production BASE_URL=https://prod.example.com npm test
```

### Environment data files

| File | Purpose |
|---|---|
| `src/data/default.json` | Fallback data used when env-specific file is absent |
| `src/data/dev.json` | Dev environment users, URLs, credentials |
| `src/data/staging.json` | Staging environment data |
| `src/data/production.json` | Production (read-only / smoke) data |

Configuration is loaded automatically by `TestDataManager` based on `TEST_ENV`.

---

## Test Data Handling

### Data Manager

The `TestDataManager` class loads environment-specific JSON, with fallback to `default.json`:

```typescript
test('query search data', async ({ testDataManager }) => {
  const queries = testDataManager.getSearchQueriesByCategory('valid');
  const user = testDataManager.getUsersByRole('admin')[0];
  // ...
});
```

### Supported data sources

| Source | How to use |
|---|---|
| JSON files | Place in `src/data/`, auto-loaded by env name |
| YAML files | `testDataManager.loadFromYaml('path/to/data.yaml')` |
| API endpoint | `testDataManager.loadFromApi('https://api/data')` |

### Type safety

All test data is strongly typed via interfaces in `src/types/test-data.ts`: `User`, `SearchQuery`, `UrlData`, `Environment`, etc.

---

## File Handling

The `FileHelper` fixture provides download/upload support:

```typescript
test('download and verify report', async ({ page, fileHelper }) => {
  // Wait for download triggered by a click
  const filePath = await fileHelper.waitForDownload(() => page.click('#export'));
  expect(fileHelper.verifyDownload(filePath, 1024)).toBe(true);
});

test('upload a document', async ({ fileHelper }) => {
  await fileHelper.uploadFile('input[type="file"]', 'src/data/uploads/doc.pdf');
});

test('read CSV test data', async ({ fileHelper }) => {
  const rows = fileHelper.readCsv('src/data/test-cases.csv');
});
```

---

## Reporting

### Built-in reporters (configured in `playwright.config.ts`)

| Reporter | Output | Open |
|---|---|---|
| **HTML** | `playwright-report/` | `npm run test:report` |
| **Allure** | `allure-results/` → `allure-report/` | `npm run allure:serve` |
| **JUnit XML** | `test-results/junit.xml` | CI integration |
| **JSON** | `test-results/results.json` | Programmatic access |
| **Custom** | `test-results/custom-reports/` | JSON, HTML, CSV, metrics |

### Custom reporter features

- Per-test pass/fail/skip/timeout tracking
- Success rate and duration metrics
- Slowest / fastest test identification
- Per-project breakdown
- Slack / Teams / Email notifications (via env vars)

```bash
# Generate and open HTML report
npm run test:report

# Generate and serve Allure report
npm run allure:generate
npm run allure:serve
```

---

## CI/CD Pipelines

### GitHub Actions (`.github/workflows/playwright-tests.yml`)

- **Triggers**: push, PR, schedule (daily 2 AM UTC), manual dispatch
- **Matrix**: 3 browsers × 4 shards = 12 parallel jobs
- **Reports**: Merged HTML + Allure deployed to GitHub Pages
- **Notifications**: Slack & Teams webhooks
- **Security**: Trivy + npm audit

### Azure DevOps (`azure-pipelines.yml`)

- **Triggers**: push, PR, nightly schedule
- **Parameters**: test suite, browser, environment (selectable at queue time)
- **Matrix**: 3 browsers × 2 shards = 6 parallel jobs (configurable)
- **Stages**: Setup → Test → Report
- **Reports**: JUnit published to Azure Test Plans, Allure as pipeline artifact

#### Azure DevOps setup

1. Create a new pipeline pointing to `azure-pipelines.yml`
2. Add pipeline variables:
   - `BASE_URL` — target application URL
   - `API_BASE_URL` — API endpoint
3. Optionally add variable groups for secrets

---

## Docker

```bash
# Build and run all tests
docker-compose up --build

# Run specific suite
docker-compose run playwright-tests npm run test:api

# Run with tag filter
docker-compose run playwright-tests npx playwright test --grep "@smoke"
```

Reports are served at:
- Playwright HTML: `http://localhost:8080/playwright`
- Allure: `http://localhost:5050`

---

## Framework Architecture

### Page Object Model

Every page extends `BasePage`, which provides common helpers (wait, click with retry, fill with retry, screenshot, navigation):

```typescript
export class LoginPage extends BasePage {
  private readonly usernameInput = this.page.locator('#username');
  private readonly passwordInput = this.page.locator('#password');
  private readonly submitButton  = this.page.locator('button[type="submit"]');

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async waitForPageLoad(): Promise<void> {
    await this.usernameInput.waitFor({ state: 'visible' });
  }

  async login(username: string, password: string): Promise<void> {
    await this.fillInput(this.usernameInput, username);
    await this.fillInput(this.passwordInput, password);
    await this.clickElement(this.submitButton);
  }
}
```

### Custom Fixtures

Fixtures provide auto-initialized, auto-cleaned dependencies to every test:

```typescript
test('full-stack test', async ({
  page,
  examplePage,         // Page object
  apiClient,           // HTTP client
  testDataManager,     // Test data
  logger,              // Structured logger
  screenshotHelper,    // Screenshots
  performanceHelper,   // Core Web Vitals
  accessibilityHelper, // WCAG checks
  fileHelper           // File operations
}) => {
  // Everything is ready to use — no manual setup or teardown
});
```

### Utility Classes

| Class | Purpose |
|---|---|
| `Logger` | Structured console + file logging with levels |
| `ApiClient` | HTTP verbs, response validation, auth, schema checks |
| `TestDataManager` | Load JSON/YAML/API data, query by role/category |
| `FileHelper` | Download/upload, CSV/JSON read/write, temp files |
| `ScreenshotHelper` | Full-page, element, mobile-responsive, annotated screenshots |
| `VideoHelper` | Recording, failure capture, cleanup |
| `PerformanceHelper` | Core Web Vitals, resource timing, memory, JS/CSS metrics |
| `AccessibilityHelper` | axe-core scan, keyboard nav, contrast, headings, ARIA |

---

## Configuration Reference

### Environment Variables

Copy `.env.example` to `.env` and adjust:

| Variable | Default | Description |
|---|---|---|
| `BASE_URL` | `https://example.com` | Application under test |
| `API_BASE_URL` | `https://httpbin.org` | API endpoint |
| `TEST_ENV` | `staging` | Environment name (`dev` / `staging` / `production`) |
| `CI` | `false` | Set `true` in CI pipelines |
| `DEBUG` | — | Playwright debug logs (e.g. `pw:api*`) |
| `LOG_TO_FILE` | `false` | Persist logs to `test-results/logs/` |
| `HEADED` | `false` | Show browser window |
| `SLOW_MO` | `0` | Slow down actions (ms) |
| `ENABLE_NOTIFICATIONS` | `false` | Send Slack/Teams/Email on completion |
| `SLACK_WEBHOOK_URL` | — | Slack incoming webhook |
| `TEAMS_WEBHOOK_URL` | — | Teams incoming webhook |
| `START_SERVER` | `false` | Start local dev server before tests |

### npm Scripts

| Script | Description |
|---|---|
| `npm test` | Run all tests |
| `npm run test:chromium` | Chromium only |
| `npm run test:firefox` | Firefox only |
| `npm run test:webkit` | WebKit only |
| `npm run test:mobile` | Mobile Chrome |
| `npm run test:api` | API tests |
| `npm run test:headed` | Headed mode |
| `npm run test:debug` | Debug mode |
| `npm run test:ui-mode` | Playwright UI |
| `npm run test:report` | Open HTML report |
| `npm run allure:generate` | Generate Allure report |
| `npm run allure:serve` | Serve Allure report |
| `npm run codegen` | Playwright code generator |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run format` | Prettier format |
| `npm run type-check` | TypeScript type check |
| `npm run clean` | Remove all generated output |
| `npm run docker:build` | Build Docker image |
| `npm run docker:run` | Run tests in Docker |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Follow Page Object Model patterns for UI tests
4. Add test tags (`@smoke`, `@regression`, etc.)
5. Ensure `npm run lint` and `npm run type-check` pass
6. Submit a pull request

---

## License

MIT — see [LICENSE](LICENSE) for details.
