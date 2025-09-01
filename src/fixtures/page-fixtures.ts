import { test as base } from './base-fixtures';
import { GoogleHomePage } from '../pages/google-home-page';
import { GoogleSearchResultsPage } from '../pages/google-search-results-page';

// Extend base fixtures with page object fixtures
export const test = base.extend<{
  googleHomePage: GoogleHomePage;
  googleSearchResultsPage: GoogleSearchResultsPage;
}>({
  // Google Home Page fixture
  googleHomePage: async ({ page, logger }, use) => {
    const googleHomePage = new GoogleHomePage(page, logger);
    await use(googleHomePage);
  },

  // Google Search Results Page fixture
  googleSearchResultsPage: async ({ page, logger }, use) => {
    const googleSearchResultsPage = new GoogleSearchResultsPage(page, logger);
    await use(googleSearchResultsPage);
  }
});

export { expect } from '@playwright/test';
