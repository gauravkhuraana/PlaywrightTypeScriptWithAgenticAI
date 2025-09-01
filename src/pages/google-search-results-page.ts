import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';
import { Logger } from '../utils/logger';

/**
 * Google Search Results Page Object
 * Represents the Google search results page
 */
export class GoogleSearchResultsPage extends BasePage {
  // Locators
  private readonly searchBox: Locator;
  private readonly searchResults: Locator;
  private readonly resultStats: Locator;
  private readonly nextButton: Locator;
  private readonly previousButton: Locator;
  private readonly paginationNumbers: Locator;
  private readonly imagesTab: Locator;
  private readonly videosTab: Locator;
  private readonly newsTab: Locator;
  private readonly shoppingTab: Locator;
  private readonly mapsTab: Locator;
  private readonly moreTab: Locator;
  private readonly toolsButton: Locator;
  private readonly suggestionContainer: Locator;
  private readonly resultsContainer: Locator;

  constructor(page: Page, logger: Logger) {
    super(page, logger);
    
    // Initialize locators
    this.searchBox = page.locator('[name=\"q\"]');
    this.searchResults = page.locator('#search .g, #search .hlcw0c');
    this.resultStats = page.locator('#result-stats');
    this.nextButton = page.locator('#pnnext');
    this.previousButton = page.locator('#pnprev');
    this.paginationNumbers = page.locator('#nav [role=\"navigation\"] a');
    this.imagesTab = page.locator('[data-hveid] a:has-text(\"Images\")');
    this.videosTab = page.locator('[data-hveid] a:has-text(\"Videos\")');
    this.newsTab = page.locator('[data-hveid] a:has-text(\"News\")');
    this.shoppingTab = page.locator('[data-hveid] a:has-text(\"Shopping\")');
    this.mapsTab = page.locator('[data-hveid] a:has-text(\"Maps\")');
    this.moreTab = page.locator('[data-hveid] a:has-text(\"More\")');
    this.toolsButton = page.locator('#hdtb-tls');
    this.suggestionContainer = page.locator('#brs');
    this.resultsContainer = page.locator('#search');
  }

  /**
   * Navigate to search results page with query
   */
  async goto(query: string = ''): Promise<void> {
    const searchUrl = query ? `${this.baseUrl}/search?q=${encodeURIComponent(query)}` : `${this.baseUrl}/search`;
    this.logger.info(`Navigating to search results page: ${searchUrl}`);
    await this.page.goto(searchUrl);
    await this.waitForPageLoad();
  }

  /**
   * Wait for the search results page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    this.logger.info('Waiting for search results page to load');
    await Promise.all([
      this.waitForElement(this.searchBox),
      this.waitForElement(this.resultsContainer),
      this.page.waitForLoadState('networkidle')
    ]);
  }

  /**
   * Get the number of search results on the current page
   */
  async getResultCount(): Promise<number> {
    await this.waitForElement(this.searchResults.first());
    const results = await this.searchResults.all();
    this.logger.info(`Found ${results.length} search results`);
    return results.length;
  }

  /**
   * Get search result statistics text
   */
  async getResultStats(): Promise<string> {
    try {
      await this.waitForElement(this.resultStats);
      const stats = await this.getElementText(this.resultStats);
      this.logger.info(`Result stats: ${stats}`);
      return stats;
    } catch {
      this.logger.warn('Result stats not found');
      return '';
    }
  }

  /**
   * Get all search result titles
   */
  async getSearchResultTitles(): Promise<string[]> {
    const titleSelectors = [
      'h3',
      '.LC20lb',
      '[data-attrid] h3',
      '.r h3'
    ];
    
    const titles: string[] = [];
    
    for (const selector of titleSelectors) {
      const elements = await this.page.locator(`#search .g ${selector}, #search .hlcw0c ${selector}`).all();
      for (const element of elements) {
        const title = await element.textContent();
        if (title && title.trim()) {
          titles.push(title.trim());
        }
      }
    }
    
    this.logger.info(`Found ${titles.length} result titles`);
    return titles;
  }

  /**
   * Get all search result URLs
   */
  async getSearchResultUrls(): Promise<string[]> {
    const urlSelectors = [
      'h3 a',
      '.LC20lb a',
      '.r a'
    ];
    
    const urls: string[] = [];
    
    for (const selector of urlSelectors) {
      const elements = await this.page.locator(`#search .g ${selector}, #search .hlcw0c ${selector}`).all();
      for (const element of elements) {
        const href = await element.getAttribute('href');
        if (href && !href.startsWith('/search') && !href.includes('google.com/search')) {
          urls.push(href);
        }
      }
    }
    
    this.logger.info(`Found ${urls.length} result URLs`);
    return urls;
  }

  /**
   * Click on a search result by index
   */
  async clickSearchResult(index: number): Promise<void> {
    this.logger.info(`Clicking search result at index: ${index}`);
    const results = await this.searchResults.all();
    
    if (index >= results.length) {
      throw new Error(`Result index ${index} is out of bounds. Found ${results.length} results.`);
    }
    
    const resultLink = results[index].locator('h3 a, .LC20lb a').first();
    await this.clickElement(resultLink);
    await this.waitForNavigation();
  }

  /**
   * Search for a new query from results page
   */
  async searchNewQuery(query: string): Promise<void> {
    this.logger.info(`Searching for new query: ${query}`);
    await this.searchBox.clear();
    await this.fillInput(this.searchBox, query);
    await this.pressKey('Enter');
    await this.waitForNavigation();
  }

  /**
   * Go to next page of results
   */
  async goToNextPage(): Promise<void> {
    this.logger.info('Going to next page of results');
    if (await this.isElementVisible(this.nextButton)) {
      await this.clickElement(this.nextButton);
      await this.waitForNavigation();
    } else {
      throw new Error('Next button is not available');
    }
  }

  /**
   * Go to previous page of results
   */
  async goToPreviousPage(): Promise<void> {
    this.logger.info('Going to previous page of results');
    if (await this.isElementVisible(this.previousButton)) {
      await this.clickElement(this.previousButton);
      await this.waitForNavigation();
    } else {
      throw new Error('Previous button is not available');
    }
  }

  /**
   * Go to specific page number
   */
  async goToPage(pageNumber: number): Promise<void> {
    this.logger.info(`Going to page: ${pageNumber}`);
    const pageLink = this.page.locator(`#nav a[aria-label=\"Page ${pageNumber}\"]`);
    if (await this.isElementVisible(pageLink)) {
      await this.clickElement(pageLink);
      await this.waitForNavigation();
    } else {
      throw new Error(`Page ${pageNumber} is not available`);
    }
  }

  /**
   * Get current page number
   */
  async getCurrentPageNumber(): Promise<number> {
    try {
      const url = await this.getCurrentUrl();
      const urlObj = new URL(url);
      const start = urlObj.searchParams.get('start');
      return start ? Math.floor(parseInt(start) / 10) + 1 : 1;
    } catch {
      return 1;
    }
  }

  /**
   * Check if next page is available
   */
  async isNextPageAvailable(): Promise<boolean> {
    return await this.isElementVisible(this.nextButton);
  }

  /**
   * Check if previous page is available
   */
  async isPreviousPageAvailable(): Promise<boolean> {
    return await this.isElementVisible(this.previousButton);
  }

  /**
   * Click on Images tab
   */
  async clickImagesTab(): Promise<void> {
    this.logger.info('Clicking Images tab');
    await this.clickElement(this.imagesTab);
    await this.waitForNavigation();
  }

  /**
   * Click on Videos tab
   */
  async clickVideosTab(): Promise<void> {
    this.logger.info('Clicking Videos tab');
    await this.clickElement(this.videosTab);
    await this.waitForNavigation();
  }

  /**
   * Click on News tab
   */
  async clickNewsTab(): Promise<void> {
    this.logger.info('Clicking News tab');
    await this.clickElement(this.newsTab);
    await this.waitForNavigation();
  }

  /**
   * Get search suggestions (related searches)
   */
  async getRelatedSearches(): Promise<string[]> {
    try {
      const relatedSearches = await this.page.locator('#brs a').allTextContents();
      const filtered = relatedSearches.filter(search => search.trim() !== '');
      this.logger.info(`Found ${filtered.length} related searches`);
      return filtered;
    } catch {
      this.logger.info('No related searches found');
      return [];
    }
  }

  /**
   * Check if search has results
   */
  async hasResults(): Promise<boolean> {
    const resultCount = await this.getResultCount();
    return resultCount > 0;
  }

  /**
   * Get search query from URL or search box
   */
  async getCurrentSearchQuery(): Promise<string> {
    const url = await this.getCurrentUrl();
    const urlParams = new URL(url).searchParams;
    const queryFromUrl = urlParams.get('q');
    
    if (queryFromUrl) {
      return queryFromUrl;
    }
    
    return await this.searchBox.inputValue();
  }

  /**
   * Validate search results page elements
   */
  async validatePageElements(): Promise<{ [key: string]: boolean }> {
    const results = {
      searchBox: await this.isElementVisible(this.searchBox),
      searchResults: await this.getResultCount() > 0,
      resultStats: await this.isElementVisible(this.resultStats),
      resultsContainer: await this.isElementVisible(this.resultsContainer)
    };
    
    this.logger.info('Search results page elements validation:', results);
    return results;
  }

  /**
   * Extract structured data from search results
   */
  async getStructuredResults(): Promise<Array<{ title: string; url: string; snippet: string }>> {
    const results: Array<{ title: string; url: string; snippet: string }> = [];
    const resultElements = await this.searchResults.all();
    
    for (const result of resultElements) {
      try {
        const titleElement = result.locator('h3, .LC20lb').first();
        const linkElement = result.locator('a').first();
        const snippetElement = result.locator('.VwiC3b, .s3v9rd, .IsZvec').first();
        
        const title = await titleElement.textContent() || '';
        const url = await linkElement.getAttribute('href') || '';
        const snippet = await snippetElement.textContent() || '';
        
        if (title && url) {
          results.push({ title: title.trim(), url, snippet: snippet.trim() });
        }
      } catch (error) {
        // Skip results that can't be parsed
        continue;
      }
    }
    
    this.logger.info(`Extracted ${results.length} structured results`);
    return results;
  }
}
