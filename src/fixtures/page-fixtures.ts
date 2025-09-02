import { test as base } from './base-fixtures';
import { ExamplePage } from '../pages/example-page';

// Extend base fixtures with page object fixtures
export const test = base.extend<{
  examplePage: ExamplePage;
}>({
  // Example Page fixture (automation-friendly test site)
  examplePage: async ({ page, logger }, use) => {
    const examplePage = new ExamplePage(page, logger);
    await use(examplePage);
  }
});

export { expect } from '@playwright/test';
