import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';
import { Logger } from '../utils/logger';

/**
 * Page Object for Example.com - a simple test page
 */
export class ExamplePage extends BasePage {
  private readonly pageHeading: Locator;
  private readonly pageDescription: Locator;
  private readonly moreInfoLink: Locator;

  constructor(page: Page, logger?: Logger) {
    const pageLogger = logger || new Logger('ExamplePage');
    super(page, pageLogger, 'https://example.com');
    
    // Define locators for example.com elements - be specific to avoid strict mode violations
    this.pageHeading = page.locator('h1');
    this.pageDescription = page.locator('p').first(); // Get the first paragraph to avoid multiple matches
    this.moreInfoLink = page.locator('a[href*="iana.org"]');
  }

  /**
   * Navigate to example.com
   */
  async goto(): Promise<void> {
    this.logger.info('Navigating to example.com');
    await this.page.goto('https://example.com');
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  /**
   * Get the main heading text
   */
  async getHeading(): Promise<string> {
    this.logger.info('Getting page heading');
    return await this.pageHeading.textContent() || '';
  }

  /**
   * Get the page description text
   */
  async getDescription(): Promise<string> {
    this.logger.info('Getting page description');
    return await this.pageDescription.textContent() || '';
  }

  /**
   * Check if the page has the expected content
   */
  async hasExpectedContent(): Promise<boolean> {
    try {
      const heading = await this.getHeading();
      const description = await this.getDescription();
      
      const hasCorrectHeading = heading.includes('Example Domain');
      const hasCorrectDescription = description.includes('domain') || description.includes('example');
      
      this.logger.info(`Heading check: ${hasCorrectHeading}`);
      this.logger.info(`Description check: ${hasCorrectDescription}`);
      
      return hasCorrectHeading && hasCorrectDescription;
    } catch (error) {
      this.logger.error(`Error checking page content: ${error}`);
      return false;
    }
  }

  /**
   * Click the more information link
   */
  async clickMoreInfoLink(): Promise<void> {
    this.logger.info('Clicking more information link');
    await this.moreInfoLink.click();
  }

  /**
   * Check if more info link is visible
   */
  async isMoreInfoLinkVisible(): Promise<boolean> {
    try {
      return await this.moreInfoLink.isVisible();
    } catch (error) {
      this.logger.error(`Error checking more info link visibility: ${error}`);
      return false;
    }
  }

  /**
   * Get all links on the page
   */
  override async getAllLinks(): Promise<string[]> {
    this.logger.info('Getting all links on the page');
    const links = await this.page.locator('a').all();
    const linkUrls: string[] = [];
    
    for (const link of links) {
      try {
        const href = await link.getAttribute('href');
        if (href) {
          linkUrls.push(href);
        }
      } catch (error) {
        this.logger.warn(`Error getting link href: ${error}`);
      }
    }
    
    this.logger.info(`Found ${linkUrls.length} links`);
    return linkUrls;
  }

  /**
   * Validate page structure
   */
  async validatePageStructure(): Promise<{
    hasHeading: boolean;
    hasDescription: boolean;
    hasLinks: boolean;
    linkCount: number;
  }> {
    this.logger.info('Validating page structure');
    
    const hasHeading = await this.pageHeading.isVisible();
    const hasDescription = await this.pageDescription.isVisible(); // Uses .first() from constructor
    const links = await this.getAllLinks();
    const hasLinks = links.length > 0;
    
    const result = {
      hasHeading,
      hasDescription,
      hasLinks,
      linkCount: links.length
    };
    
    this.logger.info(`Page structure validation: ${JSON.stringify(result)}`);
    return result;
  }
}
