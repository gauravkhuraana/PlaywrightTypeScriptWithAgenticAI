import { Page, Locator } from '@playwright/test';
import { Logger } from '../utils/logger';

/**
 * Base Page class that all page objects should extend
 * Provides common functionality and patterns for page objects
 */
export abstract class BasePage {
  protected readonly page: Page;
  protected readonly logger: Logger;
  protected readonly baseUrl: string;

  constructor(page: Page, logger: Logger, baseUrl?: string) {
    this.page = page;
    this.logger = logger;
    this.baseUrl = baseUrl || 'https://example.com';
  }

  /**
   * Navigate to the page
   */
  abstract goto(path?: string): Promise<void>;

  /**
   * Wait for the page to be loaded
   */
  abstract waitForPageLoad(): Promise<void>;

  /**
   * Get the page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get the current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Wait for an element to be visible
   */
  async waitForElement(locator: Locator, timeout: number = 30000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for an element to be hidden
   */
  async waitForElementToBeHidden(locator: Locator, timeout: number = 30000): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Take a screenshot of the page
   */
  async takeScreenshot(name: string): Promise<Buffer> {
    this.logger.info(`Taking screenshot: ${name}`);
    return await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  /**
   * Wait for network to be idle
   */
  async waitForNetworkIdle(timeout: number = 30000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Get all links on the page
   */
  async getAllLinks(): Promise<string[]> {
    const links = await this.page.locator('a[href]').all();
    const hrefs: string[] = [];
    
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href && !href.startsWith('javascript:') && !href.startsWith('#')) {
        hrefs.push(href);
      }
    }
    
    return hrefs;
  }

  /**
   * Get all images on the page
   */
  async getAllImages(): Promise<{ src: string; alt: string }[]> {
    const images = await this.page.locator('img').all();
    const imageData: { src: string; alt: string }[] = [];
    
    for (const img of images) {
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt') || '';
      if (src) {
        imageData.push({ src, alt });
      }
    }
    
    return imageData;
  }

  /**
   * Check if element exists
   */
  async isElementPresent(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'attached', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get element text content
   */
  async getElementText(locator: Locator): Promise<string> {
    await this.waitForElement(locator);
    return await locator.textContent() || '';
  }

  /**
   * Click element with retry
   */
  async clickElement(locator: Locator, retries: number = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.waitForElement(locator);
        await locator.click();
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        this.logger.warn(`Click attempt ${i + 1} failed, retrying...`);
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Fill input field with retry
   */
  async fillInput(locator: Locator, value: string, retries: number = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.waitForElement(locator);
        await locator.clear();
        await locator.fill(value);
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        this.logger.warn(`Fill attempt ${i + 1} failed, retrying...`);
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Press key
   */
  async pressKey(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Wait for page navigation
   */
  async waitForNavigation(timeout: number = 30000): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout });
  }

  /**
   * Refresh the page
   */
  async refresh(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  /**
   * Go back in browser history
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.waitForPageLoad();
  }

  /**
   * Go forward in browser history
   */
  async goForward(): Promise<void> {
    await this.page.goForward();
    await this.waitForPageLoad();
  }
}
