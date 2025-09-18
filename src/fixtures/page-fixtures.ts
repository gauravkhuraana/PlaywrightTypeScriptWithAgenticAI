import { test as base } from './base-fixtures';
import { ExamplePage } from '../pages/example-page';
import { GoogleHomePage } from '../pages/google-home-page';

// Extend base fixtures with page object fixtures
export const test = base.extend<{
  examplePage: ExamplePage;
  googleHomePage: GoogleHomePage;
}>({
  // Example Page fixture (automation-friendly test site)
  examplePage: async ({ page, logger }, use) => {
    const examplePage = new ExamplePage(page, logger);
    await use(examplePage);
  },

  // Google Home Page fixture
  googleHomePage: async ({ page, logger }, use) => {
    const googleHomePage = new GoogleHomePage(page, logger);
    await use(googleHomePage);
  }
});

export { expect } from '@playwright/test';
