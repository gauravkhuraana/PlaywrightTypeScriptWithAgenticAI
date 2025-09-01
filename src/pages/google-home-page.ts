import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';
import { Logger } from '../utils/logger';

/**
 * Google Home Page Object
 * Represents the main Google search page
 */
export class GoogleHomePage extends BasePage {
  // Locators
  private readonly searchBox: Locator;
  private readonly searchButton: Locator;
  private readonly feelingLuckyButton: Locator;
  private readonly googleLogo: Locator;
  private readonly googleAppsButton: Locator;
  private readonly signInButton: Locator;
  private readonly languageLinks: Locator;
  private readonly footerLinks: Locator;

  constructor(page: Page, logger: Logger) {
    super(page, logger);
    
    // Initialize locators
    this.searchBox = page.locator('[name=\"q\"]');
    this.searchButton = page.locator('[name=\"btnK\"]').first();
    this.feelingLuckyButton = page.locator('[name=\"btnI\"]').first();
    this.googleLogo = page.locator('#hplogo, [alt=\"Google\"]').first();
    this.googleAppsButton = page.locator('[aria-label=\"Google apps\"]');
    this.signInButton = page.locator('text=Sign in');
    this.languageLinks = page.locator('#SIvCob a');
    this.footerLinks = page.locator('#fsl a');
  }

  /**
   * Navigate to Google home page
   */
  async goto(path: string = ''): Promise<void> {
    this.logger.info('Navigating to Google home page');
    await this.page.goto(`${this.baseUrl}${path}`);
    await this.waitForPageLoad();
  }

  /**
   * Wait for the Google home page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    this.logger.info('Waiting for Google home page to load');
    await Promise.all([
      this.waitForElement(this.searchBox),
      this.waitForElement(this.googleLogo),
      this.page.waitForLoadState('networkidle')
    ]);
  }

  /**
   * Perform a search
   */
  async search(query: string): Promise<void> {
    this.logger.info(`Searching for: ${query}`);
    await this.fillInput(this.searchBox, query);
    await this.pressKey('Enter');
    await this.waitForNavigation();
  }

  /**
   * Perform a search using the search button
   */
  async searchWithButton(query: string): Promise<void> {
    this.logger.info(`Searching for: ${query} using search button`);
    await this.fillInput(this.searchBox, query);
    await this.clickElement(this.searchButton);
    await this.waitForNavigation();
  }

  /**
   * Click "I'm Feeling Lucky" button
   */
  async clickFeelingLucky(query: string = ''): Promise<void> {
    this.logger.info(`Clicking "I'm Feeling Lucky" with query: ${query}`);
    if (query) {
      await this.fillInput(this.searchBox, query);
    }
    await this.clickElement(this.feelingLuckyButton);
    await this.waitForNavigation();
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    this.logger.info(`Getting search suggestions for: ${query}`);
    await this.fillInput(this.searchBox, query);
    
    // Wait for suggestions to appear
    await this.page.waitForTimeout(1000);
    
    const suggestions = await this.page.locator('[role=\"listbox\"] [role=\"option\"]').allTextContents();
    return suggestions;
  }

  /**
   * Check if Google logo is visible
   */
  async isGoogleLogoVisible(): Promise<boolean> {
    return await this.isElementVisible(this.googleLogo);
  }

  /**
   * Check if search box is visible
   */
  async isSearchBoxVisible(): Promise<boolean> {
    return await this.isElementVisible(this.searchBox);
  }

  /**
   * Get all language links
   */
  async getLanguageLinks(): Promise<string[]> {
    const links = await this.languageLinks.allTextContents();
    return links.filter(link => link.trim() !== '');
  }

  /**
   * Get all footer links
   */
  async getFooterLinks(): Promise<{ text: string; href: string }[]> {
    const footerLinkElements = await this.footerLinks.all();
    const links: { text: string; href: string }[] = [];
    
    for (const link of footerLinkElements) {
      const text = await link.textContent() || '';
      const href = await link.getAttribute('href') || '';
      if (text.trim() && href) {
        links.push({ text: text.trim(), href });
      }
    }
    
    return links;
  }

  /**
   * Click on a specific language link
   */
  async clickLanguageLink(language: string): Promise<void> {
    this.logger.info(`Clicking language link: ${language}`);
    const languageLink = this.page.locator(`#SIvCob a:has-text(\"${language}\")`);
    await this.clickElement(languageLink);
    await this.waitForNavigation();
  }

  /**
   * Clear search box
   */
  async clearSearchBox(): Promise<void> {
    this.logger.info('Clearing search box');
    await this.searchBox.clear();
  }

  /**
   * Get search box placeholder text
   */
  async getSearchBoxPlaceholder(): Promise<string> {
    return await this.searchBox.getAttribute('placeholder') || '';
  }

  /**
   * Check if sign-in button is visible
   */
  async isSignInButtonVisible(): Promise<boolean> {
    return await this.isElementVisible(this.signInButton);
  }

  /**
   * Click sign-in button
   */
  async clickSignIn(): Promise<void> {
    this.logger.info('Clicking sign-in button');
    await this.clickElement(this.signInButton);
    await this.waitForNavigation();
  }

  /**
   * Get current search query from URL or search box
   */
  async getCurrentSearchQuery(): Promise<string> {
    const url = await this.getCurrentUrl();
    const urlParams = new URL(url).searchParams;
    return urlParams.get('q') || await this.searchBox.inputValue();
  }

  /**
   * Validate page elements are present
   */
  async validatePageElements(): Promise<{ [key: string]: boolean }> {
    const results = {
      searchBox: await this.isElementVisible(this.searchBox),
      searchButton: await this.isElementVisible(this.searchButton),
      feelingLuckyButton: await this.isElementVisible(this.feelingLuckyButton),
      googleLogo: await this.isElementVisible(this.googleLogo),
      signInButton: await this.isElementVisible(this.signInButton)
    };
    
    this.logger.info('Page elements validation:', results);
    return results;
  }
}
