# 📚 Symbol Definitions in PlaywrightTypeScriptWithAgenticAI

This document explains how symbols (types, interfaces, classes, functions, and constants) are defined and organized in this repository.

## 🚀 Quick Reference

| Symbol Type | Location | Naming | Example |
|------------|----------|--------|---------|
| **Interfaces** | `src/types/` | PascalCase | `TestData`, `UserProfile` |
| **Classes** | `src/pages/`, `src/utils/` | PascalCase | `BasePage`, `Logger` |
| **Methods** | Within classes | camelCase | `goto()`, `waitForPageLoad()` |
| **Variables** | Any scope | camelCase | `searchBox`, `apiClient` |
| **Files** | All directories | kebab-case | `base-page.ts`, `test-data.ts` |
| **Fixtures** | `src/fixtures/` | camelCase | `logger`, `apiClient` |

## 🗂️ Symbol Organization

```
Repository Structure
├── src/types/              → TypeScript interfaces and type definitions
│   ├── test-data.ts        → Data structure interfaces
│   └── test-options.ts     → Configuration interfaces
├── src/pages/              → Page Object Model classes
│   ├── base-page.ts        → Abstract base class
│   └── *-page.ts           → Concrete page implementations
├── src/utils/              → Utility classes
│   ├── logger.ts           → Logging utility
│   ├── api-client.ts       → API testing utility
│   └── *-helper.ts         → Various helper classes
└── src/fixtures/           → Playwright test fixtures
    ├── base-fixtures.ts    → Core fixture definitions
    └── page-fixtures.ts    → Page object fixtures
```

---

## 📖 Table of Contents

1. [TypeScript Type Definitions](#typescript-type-definitions)
2. [Interfaces](#interfaces)
3. [Classes and Inheritance](#classes-and-inheritance)
4. [Functions and Methods](#functions-and-methods)
5. [Constants and Enums](#constants-and-enums)
6. [Fixtures and Dependency Injection](#fixtures-and-dependency-injection)
7. [Naming Conventions](#naming-conventions)
8. [Module Organization](#module-organization)

---

## 🔷 TypeScript Type Definitions

### Location
All TypeScript type definitions are centralized in the `src/types/` directory:
- `src/types/test-data.ts` - Test data interfaces
- `src/types/test-options.ts` - Test configuration options

### Pattern: Export Interfaces
```typescript
// src/types/test-data.ts
export interface TestData {
  users: User[];
  searchQueries: SearchQuery[];
  urls: UrlData[];
  environments: Environment[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user' | 'guest';
  profile: UserProfile;
}
```

### Key Characteristics:
- **Exported**: All interfaces use `export` keyword for reusability
- **Descriptive Names**: PascalCase naming (e.g., `UserProfile`, `TestData`)
- **Type Safety**: Strong typing with literal types (e.g., `role: 'admin' | 'user' | 'guest'`)
- **Composition**: Interfaces compose other interfaces (e.g., `User` contains `UserProfile`)

---

## 🔶 Interfaces

### Test Data Interfaces
Located in `src/types/test-data.ts`:

#### Basic Data Structures
```typescript
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark';
  notifications: boolean;
  newsletter: boolean;
}
```

#### API Response Interface
```typescript
export interface ApiResponse<T = any> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
  responseTime: number;
}
```
- **Generic Type**: Uses `<T = any>` for flexible response typing
- **Default Type**: Provides `any` as default if not specified

#### Performance Metrics
```typescript
export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}
```

#### Accessibility Testing
```typescript
export interface AccessibilityResult {
  violations: AccessibilityViolation[];
  passes: AccessibilityPass[];
  incomplete: AccessibilityIncomplete[];
  inapplicable: AccessibilityInapplicable[];
}

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  nodes: AccessibilityNode[];
}
```

### Test Options Interface
Located in `src/types/test-options.ts`:

```typescript
export interface TestOptions extends PlaywrightTestOptions {
  environment: string;
  apiBaseURL: string;
  enableVisualTesting?: boolean;
  enableAccessibilityTesting?: boolean;
  enablePerformanceTesting?: boolean;
  testDataConfig?: {
    source: 'json' | 'yaml' | 'api';
    path?: string;
    endpoint?: string;
  };
}
```
- **Extends Playwright**: Inherits from `PlaywrightTestOptions`
- **Optional Properties**: Uses `?` for optional fields
- **Nested Objects**: Configuration objects for complex settings

---

## 🏗️ Classes and Inheritance

### Abstract Base Class Pattern
Located in `src/pages/base-page.ts`:

```typescript
export abstract class BasePage {
  protected readonly page: Page;
  protected readonly logger: Logger;
  protected readonly baseUrl: string;

  constructor(page: Page, logger: Logger, baseUrl?: string) {
    this.page = page;
    this.logger = logger;
    this.baseUrl = baseUrl || 'https://www.google.com';
  }

  // Abstract methods - must be implemented by subclasses
  abstract goto(path?: string): Promise<void>;
  abstract waitForPageLoad(): Promise<void>;

  // Concrete methods - shared functionality
  async getTitle(): Promise<string> {
    return await this.page.title();
  }
}
```

**Key Features:**
- **Abstract Class**: Cannot be instantiated directly
- **Protected Members**: Use `protected` for subclass access
- **Readonly Properties**: Use `readonly` for immutable fields
- **Abstract Methods**: Force implementation in subclasses
- **Concrete Methods**: Provide shared functionality

### Concrete Page Class
Located in `src/pages/google-home-page.ts`:

```typescript
export class GoogleHomePage extends BasePage {
  // Private locators
  private readonly searchBox: Locator;
  private readonly searchButton: Locator;
  private readonly googleLogo: Locator;

  constructor(page: Page, logger: Logger) {
    super(page, logger);
    
    // Initialize locators
    this.searchBox = page.locator('[name="q"]');
    this.searchButton = page.locator('[name="btnK"]').first();
    this.googleLogo = page.locator('#hplogo, [alt="Google"]').first();
  }

  // Implement abstract methods
  async goto(path: string = ''): Promise<void> {
    await this.page.goto('https://www.google.com');
  }

  async waitForPageLoad(): Promise<void> {
    await this.searchBox.waitFor({ state: 'visible' });
  }

  // Page-specific methods
  async search(query: string): Promise<void> {
    await this.fillInput(this.searchBox, query);
    await this.pressKey('Enter');
  }
}
```

**Key Features:**
- **Extends Base**: Inherits from `BasePage`
- **Private Locators**: Use `private readonly` for locators
- **Constructor**: Calls `super()` to initialize base class
- **Method Implementation**: Implements required abstract methods

### Utility Class Pattern
Located in `src/utils/logger.ts`:

```typescript
export class Logger {
  private readonly context: string;
  private readonly timestamp: string;

  constructor(context: string) {
    this.context = context;
    this.timestamp = new Date().toISOString();
  }

  info(message: string, data?: any): void {
    this.log('INFO', message, data);
  }

  private log(level: string, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] [${this.context}] ${message}`;
    console.log(logMessage, data ? data : '');
  }

  child(additionalContext: string): Logger {
    return new Logger(`${this.context}:${additionalContext}`);
  }
}
```

**Key Features:**
- **Concrete Class**: Can be instantiated directly
- **Private Methods**: Use `private` for internal implementation
- **Public Methods**: Expose only necessary API
- **Factory Method**: `child()` creates related instances

---

## 🔧 Functions and Methods

### Async/Await Pattern
All asynchronous operations use async/await:

```typescript
async goto(path: string = ''): Promise<void> {
  await this.page.goto('https://www.google.com');
}

async search(query: string): Promise<void> {
  await this.fillInput(this.searchBox, query);
  await this.pressKey('Enter');
}
```

### Method Signatures
```typescript
// Void return type
async waitForPageLoad(): Promise<void>

// Specific return type
async getTitle(): Promise<string>

// Generic return type
async getMemoryUsage(): Promise<{
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}>

// Optional parameters
async goto(path?: string): Promise<void>

// Default parameters
async waitForElement(locator: Locator, timeout: number = 30000): Promise<void>
```

### Arrow Functions
Used primarily for callbacks and short utilities:

```typescript
// In test fixtures
logger: async ({}, use, testInfo) => {
  const logger = new Logger(testInfo.title);
  await use(logger);
}

// In data processing
const hrefs: string[] = [];
const links = await this.page.locator('a').all();
for (const link of links) {
  const href = await link.getAttribute('href');
  if (href) {
    hrefs.push(href);
  }
}
```

---

## 🎨 Constants and Enums

### Type Literals (Union Types)
Used instead of enums for better type inference:

```typescript
// In interfaces
role: 'admin' | 'user' | 'guest';
theme: 'light' | 'dark';
category: 'valid' | 'invalid' | 'edge-case' | 'performance';
impact: 'minor' | 'moderate' | 'serious' | 'critical';
```

### Configuration Objects
```typescript
const config = {
  slowMo: 0,
  devtools: false,
  recordVideo: false,
  recordHar: false
};
```

---

## 🔌 Fixtures and Dependency Injection

### Custom Fixture Definition
Located in `src/fixtures/base-fixtures.ts`:

```typescript
import { test as base } from '@playwright/test';

export const test = base.extend<TestOptions & {
  testDataManager: TestDataManager;
  apiClient: ApiClient;
  logger: Logger;
  screenshotHelper: ScreenshotHelper;
  performanceHelper: PerformanceHelper;
}>({
  // Logger fixture
  logger: async ({}, use, testInfo) => {
    const logger = new Logger(testInfo.title);
    await use(logger);
  },

  // API client fixture
  apiClient: async ({ apiBaseURL, apiConfig }, use) => {
    const apiClient = new ApiClient(apiBaseURL, apiConfig);
    await use(apiClient);
    await apiClient.cleanup();
  },
});

export { expect } from '@playwright/test';
```

**Key Features:**
- **Extend Base Test**: Uses `base.extend()` to add custom fixtures
- **Type Definition**: Fixtures are strongly typed
- **Lifecycle Management**: Setup and cleanup in fixture
- **Dependency Injection**: Fixtures can depend on other fixtures

### Using Fixtures in Tests
```typescript
import { test, expect } from '../fixtures/base-fixtures';

test('example test', async ({ logger, apiClient, page }) => {
  logger.info('Starting test');
  const response = await apiClient.get('/users');
  await page.goto('https://example.com');
});
```

---

## 📝 Naming Conventions

### Files
- **lowercase-with-dashes**: `base-page.ts`, `test-data-manager.ts`
- **Descriptive**: Name reflects purpose (`google-home-page.ts`)

### Classes
- **PascalCase**: `BasePage`, `GoogleHomePage`, `Logger`
- **Descriptive**: Clear purpose (`PerformanceHelper`, `AccessibilityHelper`)

### Interfaces
- **PascalCase**: `TestData`, `UserProfile`, `ApiResponse`
- **Descriptive**: Often noun phrases describing data structure

### Methods
- **camelCase**: `goto()`, `waitForPageLoad()`, `search()`
- **Verb-based**: Start with action verb (`get`, `wait`, `validate`)

### Variables and Properties
- **camelCase**: `searchBox`, `searchButton`, `baseUrl`
- **Descriptive**: Clear purpose without abbreviations

### Constants
- **camelCase** for object properties: `config.slowMo`
- **Descriptive**: Self-documenting names

### Private Members
- **No underscore prefix**: TypeScript `private` keyword is sufficient
- **readonly**: Often combined with `private` for immutability

---

## 📦 Module Organization

### Import/Export Patterns

#### Named Exports (Preferred)
```typescript
// Exporting
export class Logger { }
export interface TestData { }
export const test = base.extend({ });

// Importing
import { Logger } from '../utils/logger';
import { TestData } from '../types/test-data';
import { test, expect } from '../fixtures/base-fixtures';
```

#### Re-exports
```typescript
// In fixtures
export { expect } from '@playwright/test';
```

### Module Structure
```
src/
├── types/          # Type definitions (interfaces, types)
├── pages/          # Page Objects (classes)
├── utils/          # Utility classes
├── fixtures/       # Playwright fixtures
└── reporters/      # Custom reporters
```

### Path Aliases
Configured in `tsconfig.json`:

```json
{
  "baseUrl": "./",
  "paths": {
    "@/*": ["src/*"],
    "@pages/*": ["src/pages/*"],
    "@fixtures/*": ["src/fixtures/*"],
    "@utils/*": ["src/utils/*"],
    "@types/*": ["src/types/*"]
  }
}
```

**Usage:**
```typescript
import { BasePage } from '@pages/base-page';
import { Logger } from '@utils/logger';
import { TestData } from '@types/test-data';
```

---

## 🛠️ Common Utility Patterns

### Helper Class Pattern
Helper utilities follow a consistent pattern across the codebase:

#### Example: PerformanceHelper
```typescript
export class PerformanceHelper {
  private readonly page: Page;
  private readonly logger: Logger;

  constructor(page: Page) {
    this.page = page;
    this.logger = new Logger('PerformanceHelper');
  }

  async getMemoryUsage(): Promise<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  }> {
    this.logger.info('Collecting memory usage');
    
    const memoryInfo = await this.page.evaluate(() => {
      const memory = (performance as any).memory;
      if (memory) {
        return {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        };
      }
      return {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0
      };
    });

    this.logger.info('Memory usage collected:', memoryInfo);
    return memoryInfo;
  }
}
```

#### Example: ApiClient with Configuration
```typescript
export class ApiClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly retries: number;
  private readonly headers: Record<string, string>;
  private readonly logger: Logger;
  private apiContext: APIRequestContext | null = null;

  constructor(
    baseUrl: string,
    config?: {
      timeout?: number;
      retries?: number;
      headers?: Record<string, string>;
    }
  ) {
    this.baseUrl = baseUrl;
    this.timeout = config?.timeout || 30000;
    this.retries = config?.retries || 3;
    this.headers = config?.headers || {};
    this.logger = new Logger('ApiClient');
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const context = await this.getContext();
    const startTime = Date.now();
    const response = await context.get(endpoint);
    const responseTime = Date.now() - startTime;
    
    return {
      status: response.status(),
      statusText: response.statusText(),
      headers: response.headers(),
      data: await response.json() as T,
      responseTime
    };
  }
}
```

### Helper Class Characteristics:
- **Constructor Injection**: Accept dependencies via constructor
- **Private Members**: Internal state is private
- **Logger Integration**: Each helper has its own logger
- **Type-Safe Returns**: Use TypeScript types for return values
- **Error Handling**: Comprehensive error handling with logging
- **Configuration Objects**: Use optional config objects with defaults

---

## 🎯 Symbol Definition Summary

### Key Patterns Used

1. **Interfaces for Data Structures**
   - Exported from `src/types/`
   - Use for test data, configuration, and API responses

2. **Abstract Base Classes**
   - Provide common functionality
   - Force implementation of required methods
   - Use `protected` for subclass access

3. **Concrete Implementation Classes**
   - Extend base classes
   - Use `private readonly` for locators
   - Implement page-specific or utility-specific logic

4. **Dependency Injection via Fixtures**
   - Type-safe dependency injection
   - Automatic lifecycle management
   - Reusable across tests

5. **Strong Typing Throughout**
   - Strict TypeScript configuration
   - Generic types where appropriate
   - Union types instead of enums

6. **Descriptive, Self-Documenting Names**
   - PascalCase for types/classes
   - camelCase for variables/methods
   - Verb-based method names

---

## 📚 Additional Resources

- **TypeScript Configuration**: See `tsconfig.json` for compiler options
- **Project Structure**: See `README.md` for directory organization
- **Code Examples**: See `tests/` directory for usage examples
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md` for framework overview

---

## 🔍 How to Find and Use Symbols

### Looking for Data Types?
➡️ Go to `src/types/test-data.ts`
```typescript
import { User, TestData, ApiResponse } from '../types/test-data';
```

### Need a Page Object?
➡️ Check `src/pages/` directory
```typescript
import { GoogleHomePage } from '../pages/google-home-page';
import { BasePage } from '../pages/base-page';
```

### Want to Use a Utility?
➡️ Browse `src/utils/` directory
```typescript
import { Logger } from '../utils/logger';
import { ApiClient } from '../utils/api-client';
import { PerformanceHelper } from '../utils/performance-helper';
```

### Setting up Test Fixtures?
➡️ Import from `src/fixtures/base-fixtures.ts`
```typescript
import { test, expect } from '../fixtures/base-fixtures';

test('my test', async ({ logger, apiClient, performanceHelper }) => {
  // Use injected fixtures
});
```

### Configuration Options?
➡️ See `src/types/test-options.ts`
```typescript
import { TestOptions } from '../types/test-options';
```

---

## ✅ Best Practices Checklist

When defining new symbols in this repository:

- [ ] Use **PascalCase** for classes and interfaces
- [ ] Use **camelCase** for methods, variables, and fixtures  
- [ ] Use **kebab-case** for file names
- [ ] Export interfaces from `src/types/` for reusability
- [ ] Extend `BasePage` for new page objects
- [ ] Include a `Logger` in utility classes
- [ ] Add JSDoc comments for public methods
- [ ] Use `private readonly` for class properties that won't change
- [ ] Use `async/await` for asynchronous operations
- [ ] Return typed promises (`Promise<Type>`)
- [ ] Provide default values for optional parameters
- [ ] Use descriptive, self-documenting names

---

**Last Updated**: December 2024
