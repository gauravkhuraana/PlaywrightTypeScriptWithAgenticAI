import { Page, TestInfo } from '@playwright/test';
import { Logger } from './logger';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Screenshot Helper for taking and managing screenshots
 */
export class ScreenshotHelper {
  private readonly page: Page;
  private readonly testInfo: TestInfo;
  private readonly logger: Logger;
  private readonly screenshotDir: string;

  constructor(page: Page, testInfo: TestInfo) {
    this.page = page;
    this.testInfo = testInfo;
    this.logger = new Logger('ScreenshotHelper');
    this.screenshotDir = path.join('test-results', 'screenshots');
    this.ensureDirectoryExists();
  }

  /**
   * Ensure screenshot directory exists
   */
  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  /**
   * Take full page screenshot
   */
  async takeFullPageScreenshot(name?: string): Promise<string> {
    const screenshotName = name || `fullpage-${Date.now()}`;
    const fileName = this.generateFileName(screenshotName);
    
    this.logger.info(`Taking full page screenshot: ${fileName}`);
    
    await this.page.screenshot({
      path: fileName,
      fullPage: true,
      type: 'png'
    });

    this.logger.success(`Full page screenshot saved: ${fileName}`);
    return fileName;
  }

  /**
   * Take viewport screenshot
   */
  async takeViewportScreenshot(name?: string): Promise<string> {
    const screenshotName = name || `viewport-${Date.now()}`;
    const fileName = this.generateFileName(screenshotName);
    
    this.logger.info(`Taking viewport screenshot: ${fileName}`);
    
    await this.page.screenshot({
      path: fileName,
      fullPage: false,
      type: 'png'
    });

    this.logger.success(`Viewport screenshot saved: ${fileName}`);
    return fileName;
  }

  /**
   * Take element screenshot
   */
  async takeElementScreenshot(selector: string, name?: string): Promise<string> {
    const screenshotName = name || `element-${Date.now()}`;
    const fileName = this.generateFileName(screenshotName);
    
    this.logger.info(`Taking element screenshot for selector: ${selector}`);
    
    const element = this.page.locator(selector);
    await element.screenshot({
      path: fileName,
      type: 'png'
    });

    this.logger.success(`Element screenshot saved: ${fileName}`);
    return fileName;
  }

  /**
   * Take screenshot on failure
   */
  async takeFailureScreenshot(): Promise<string> {
    const testName = this.testInfo.title.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = this.generateFileName(`failure-${testName}`);
    
    this.logger.info(`Taking failure screenshot: ${fileName}`);
    
    await this.page.screenshot({
      path: fileName,
      fullPage: true,
      type: 'png'
    });

    // Attach to test report
    await this.testInfo.attach('failure-screenshot', {
      path: fileName,
      contentType: 'image/png'
    });

    this.logger.success(`Failure screenshot saved and attached: ${fileName}`);
    return fileName;
  }

  /**
   * Take comparison screenshots for visual testing
   */
  async takeComparisonScreenshot(name: string, threshold: number = 0.2): Promise<void> {
    this.logger.info(`Taking comparison screenshot: ${name}`);
    
    // Use Playwright's built-in visual comparison
    await this.page.screenshot({
      path: this.generateFileName(`comparison-${name}`),
      fullPage: true
    });

    // Use expect().toHaveScreenshot() for actual comparison
    // This should be called from the test itself
    this.logger.info(`Comparison screenshot saved for: ${name}`);
  }

  /**
   * Take mobile responsive screenshots
   */
  async takeMobileScreenshots(name?: string): Promise<string[]> {
    const screenshotName = name || `mobile-${Date.now()}`;
    const screenshots: string[] = [];
    
    const devices = [
      { name: 'mobile-portrait', width: 375, height: 667 },
      { name: 'mobile-landscape', width: 667, height: 375 },
      { name: 'tablet-portrait', width: 768, height: 1024 },
      { name: 'tablet-landscape', width: 1024, height: 768 }
    ];

    for (const device of devices) {
      await this.page.setViewportSize({ width: device.width, height: device.height });
      await this.page.waitForTimeout(1000); // Wait for reflow
      
      const fileName = this.generateFileName(`${screenshotName}-${device.name}`);
      await this.page.screenshot({
        path: fileName,
        fullPage: true,
        type: 'png'
      });
      
      screenshots.push(fileName);
      this.logger.info(`Mobile screenshot saved: ${fileName} (${device.width}x${device.height})`);
    }

    return screenshots;
  }

  /**
   * Take before/after screenshots for comparison
   */
  async takeBeforeAfterScreenshots(
    name: string,
    action: () => Promise<void>
  ): Promise<{ before: string; after: string }> {
    const beforeFileName = this.generateFileName(`${name}-before`);
    const afterFileName = this.generateFileName(`${name}-after`);

    // Take before screenshot
    this.logger.info(`Taking before screenshot: ${beforeFileName}`);
    await this.page.screenshot({
      path: beforeFileName,
      fullPage: true,
      type: 'png'
    });

    // Perform action
    await action();

    // Take after screenshot
    this.logger.info(`Taking after screenshot: ${afterFileName}`);
    await this.page.screenshot({
      path: afterFileName,
      fullPage: true,
      type: 'png'
    });

    return { before: beforeFileName, after: afterFileName };
  }

  /**
   * Take timed screenshots
   */
  async takeTimedScreenshots(
    name: string,
    intervalMs: number,
    durationMs: number
  ): Promise<string[]> {
    const screenshots: string[] = [];
    const startTime = Date.now();
    let index = 0;

    this.logger.info(`Starting timed screenshots: ${name} for ${durationMs}ms`);

    while (Date.now() - startTime < durationMs) {
      const fileName = this.generateFileName(`${name}-${index++}`);
      await this.page.screenshot({
        path: fileName,
        fullPage: true,
        type: 'png'
      });
      screenshots.push(fileName);
      
      await this.page.waitForTimeout(intervalMs);
    }

    this.logger.success(`Completed timed screenshots: ${screenshots.length} screenshots taken`);
    return screenshots;
  }

  /**
   * Take screenshot with annotation
   */
  async takeAnnotatedScreenshot(
    name: string,
    annotations: Array<{ x: number; y: number; text: string }>
  ): Promise<string> {
    // First take a regular screenshot
    const fileName = this.generateFileName(name);
    await this.page.screenshot({
      path: fileName,
      fullPage: true,
      type: 'png'
    });

    // Add annotations using page.evaluate
    await this.page.evaluate((annotations) => {
      annotations.forEach((annotation, index) => {
        const div = document.createElement('div');
        div.innerHTML = annotation.text;
        div.style.position = 'absolute';
        div.style.left = `${annotation.x}px`;
        div.style.top = `${annotation.y}px`;
        div.style.backgroundColor = 'yellow';
        div.style.border = '2px solid red';
        div.style.padding = '5px';
        div.style.zIndex = '9999';
        div.style.fontSize = '12px';
        div.id = `annotation-${index}`;
        document.body.appendChild(div);
      });
    }, annotations);

    // Take annotated screenshot
    const annotatedFileName = this.generateFileName(`${name}-annotated`);
    await this.page.screenshot({
      path: annotatedFileName,
      fullPage: true,
      type: 'png'
    });

    // Remove annotations
    await this.page.evaluate(() => {
      const annotations = document.querySelectorAll('[id^="annotation-"]');
      annotations.forEach(annotation => annotation.remove());
    });

    this.logger.success(`Annotated screenshot saved: ${annotatedFileName}`);
    return annotatedFileName;
  }

  /**
   * Generate filename for screenshot
   */
  private generateFileName(name: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const testName = this.testInfo.title.replace(/[^a-zA-Z0-9]/g, '_');
    return path.join(this.screenshotDir, `${testName}-${name}-${timestamp}.png`);
  }

  /**
   * Get all screenshots for current test
   */
  getTestScreenshots(): string[] {
    const testName = this.testInfo.title.replace(/[^a-zA-Z0-9]/g, '_');
    if (!fs.existsSync(this.screenshotDir)) {
      return [];
    }
    
    return fs.readdirSync(this.screenshotDir)
      .filter(file => file.includes(testName) && file.endsWith('.png'))
      .map(file => path.join(this.screenshotDir, file));
  }

  /**
   * Clean up old screenshots
   */
  cleanupOldScreenshots(daysOld: number = 7): void {
    if (!fs.existsSync(this.screenshotDir)) {
      return;
    }

    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    
    fs.readdirSync(this.screenshotDir).forEach(file => {
      const filePath = path.join(this.screenshotDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime.getTime() < cutoffTime) {
        fs.unlinkSync(filePath);
        this.logger.info(`Cleaned up old screenshot: ${file}`);
      }
    });
  }
}
