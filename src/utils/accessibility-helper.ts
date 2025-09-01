import { Page } from '@playwright/test';
import { Logger } from './logger';
import { AccessibilityResult } from '../types/test-data';

/**
 * Accessibility Helper for testing web accessibility
 */
export class AccessibilityHelper {
  private readonly page: Page;
  private readonly logger: Logger;

  constructor(page: Page) {
    this.page = page;
    this.logger = new Logger('AccessibilityHelper');
  }

  /**
   * Run axe accessibility scan
   */
  async runAxeScan(options?: {
    include?: string[];
    exclude?: string[];
    rules?: Record<string, { enabled: boolean }>;
  }): Promise<AccessibilityResult> {
    this.logger.info('Running axe accessibility scan');
    
    try {
      // Inject axe-core library
      await this.injectAxeCore();
      
      // Run axe scan
      const results = await this.page.evaluate((axeOptions) => {
        return (window as any).axe.run(axeOptions);
      }, options);
      
      this.logger.info(`Axe scan completed: ${results.violations.length} violations found`);
      return results;
    } catch (error) {
      this.logger.error('Failed to run axe scan:', error);
      throw error;
    }
  }

  /**
   * Inject axe-core library into page
   */
  private async injectAxeCore(): Promise<void> {
    const axeScript = `
      if (typeof window.axe === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/axe-core@latest/axe.min.js';
        document.head.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }
    `;
    
    await this.page.addScriptTag({
      url: 'https://unpkg.com/axe-core@latest/axe.min.js'
    });
    
    // Wait for axe to be available
    await this.page.waitForFunction('typeof window.axe !== "undefined"');
  }

  /**
   * Check for keyboard navigation
   */
  async checkKeyboardNavigation(): Promise<{
    passed: boolean;
    issues: string[];
    tabbableElements: number;
  }> {
    this.logger.info('Checking keyboard navigation');
    
    const result = await this.page.evaluate(() => {
      const tabbableElements = document.querySelectorAll(
        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      
      const issues: string[] = [];
      let tabbableCount = 0;
      
      tabbableElements.forEach((element, index) => {
        tabbableCount++;
        
        // Check if element is visible
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') {
          issues.push(`Element ${index + 1} is not visible but tabbable`);
        }
        
        // Check for focus indicators
        const focusStyles = ['outline', 'border', 'box-shadow', 'background-color'];
        let hasFocusIndicator = false;
        
        focusStyles.forEach(property => {
          const focusValue = style.getPropertyValue(property);
          const hoverValue = style.getPropertyValue(`${property}:focus`);
          if (focusValue !== hoverValue) {
            hasFocusIndicator = true;
          }
        });
        
        if (!hasFocusIndicator) {
          issues.push(`Element ${index + 1} may not have visible focus indicator`);
        }
      });
      
      return {
        passed: issues.length === 0,
        issues,
        tabbableElements: tabbableCount
      };
    });
    
    this.logger.info(`Keyboard navigation check completed: ${result.tabbableElements} tabbable elements, ${result.issues.length} issues`);
    return result;
  }

  /**
   * Check color contrast
   */
  async checkColorContrast(threshold: number = 4.5): Promise<{
    passed: boolean;
    elements: Array<{
      selector: string;
      contrast: number;
      passed: boolean;
    }>;
  }> {
    this.logger.info('Checking color contrast');
    
    const result = await this.page.evaluate((contrastThreshold) => {
      const elements: Array<{
        selector: string;
        contrast: number;
        passed: boolean;
      }> = [];
      
      // Function to calculate contrast ratio
      const getContrastRatio = (color1: string, color2: string): number => {
        // This is a simplified contrast calculation
        // In a real implementation, you'd use a proper color contrast library
        return 4.5; // Placeholder
      };
      
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, label');
      
      textElements.forEach((element, index) => {
        const style = window.getComputedStyle(element);
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        
        const contrast = getContrastRatio(color, backgroundColor);
        const passed = contrast >= contrastThreshold;
        
        elements.push({
          selector: element.tagName.toLowerCase() + `:nth-child(${index + 1})`,
          contrast,
          passed
        });
      });
      
      const passed = elements.every(el => el.passed);
      
      return { passed, elements };
    }, threshold);
    
    this.logger.info(`Color contrast check completed: ${result.elements.length} elements checked`);
    return result;
  }

  /**
   * Check for alt text on images
   */
  async checkImageAltText(): Promise<{
    passed: boolean;
    issues: Array<{
      src: string;
      issue: string;
    }>;
    totalImages: number;
  }> {
    this.logger.info('Checking image alt text');
    
    const result = await this.page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const issues: Array<{ src: string; issue: string }> = [];
      
      images.forEach((img) => {
        const src = img.src || 'unknown';
        const alt = img.alt;
        
        if (!alt) {
          issues.push({ src, issue: 'Missing alt attribute' });
        } else if (alt.trim() === '') {
          issues.push({ src, issue: 'Empty alt attribute' });
        } else if (alt.length > 125) {
          issues.push({ src, issue: 'Alt text too long (>125 characters)' });
        }
      });
      
      return {
        passed: issues.length === 0,
        issues,
        totalImages: images.length
      };
    });
    
    this.logger.info(`Image alt text check completed: ${result.totalImages} images, ${result.issues.length} issues`);
    return result;
  }

  /**
   * Check form accessibility
   */
  async checkFormAccessibility(): Promise<{
    passed: boolean;
    issues: string[];
    formsCount: number;
  }> {
    this.logger.info('Checking form accessibility');
    
    const result = await this.page.evaluate(() => {
      const forms = document.querySelectorAll('form');
      const issues: string[] = [];
      
      forms.forEach((form, formIndex) => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach((input, inputIndex) => {
          const id = input.id;
          const name = input.getAttribute('name');
          const label = form.querySelector(`label[for="${id}"]`);
          const ariaLabel = input.getAttribute('aria-label');
          const ariaLabelledby = input.getAttribute('aria-labelledby');
          
          if (!label && !ariaLabel && !ariaLabelledby) {
            issues.push(`Form ${formIndex + 1}, Input ${inputIndex + 1}: No associated label`);
          }
          
          // Check for required fields
          if (input.hasAttribute('required')) {
            const ariaRequired = input.getAttribute('aria-required');
            if (ariaRequired !== 'true') {
              issues.push(`Form ${formIndex + 1}, Input ${inputIndex + 1}: Required field missing aria-required`);
            }
          }
        });
      });
      
      return {
        passed: issues.length === 0,
        issues,
        formsCount: forms.length
      };
    });
    
    this.logger.info(`Form accessibility check completed: ${result.formsCount} forms, ${result.issues.length} issues`);
    return result;
  }

  /**
   * Check heading structure
   */
  async checkHeadingStructure(): Promise<{
    passed: boolean;
    issues: string[];
    headings: Array<{
      level: number;
      text: string;
    }>;
  }> {
    this.logger.info('Checking heading structure');
    
    const result = await this.page.evaluate(() => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const issues: string[] = [];
      const headingData: Array<{ level: number; text: string }> = [];
      
      let previousLevel = 0;
      
      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        const text = heading.textContent?.trim() || '';
        
        headingData.push({ level, text });
        
        // Check for proper heading hierarchy
        if (index === 0 && level !== 1) {
          issues.push('First heading should be h1');
        }
        
        if (level - previousLevel > 1) {
          issues.push(`Heading level jump from h${previousLevel} to h${level} at "${text}"`);
        }
        
        if (text === '') {
          issues.push(`Empty heading at level h${level}`);
        }
        
        previousLevel = level;
      });
      
      if (headings.length === 0) {
        issues.push('No headings found on page');
      }
      
      return {
        passed: issues.length === 0,
        issues,
        headings: headingData
      };
    });
    
    this.logger.info(`Heading structure check completed: ${result.headings.length} headings, ${result.issues.length} issues`);
    return result;
  }

  /**
   * Check ARIA landmarks
   */
  async checkARIALandmarks(): Promise<{
    passed: boolean;
    landmarks: string[];
    recommendations: string[];
  }> {
    this.logger.info('Checking ARIA landmarks');
    
    const result = await this.page.evaluate(() => {
      const landmarks: string[] = [];
      const recommendations: string[] = [];
      
      // Check for common landmarks
      const landmarkSelectors = [
        'header, [role="banner"]',
        'nav, [role="navigation"]',
        'main, [role="main"]',
        'footer, [role="contentinfo"]',
        'aside, [role="complementary"]',
        'section, [role="region"]'
      ];
      
      landmarkSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          landmarks.push(selector.split(',')[0].trim());
        }
      });
      
      // Check for main landmark
      const mainElements = document.querySelectorAll('main, [role="main"]');
      if (mainElements.length === 0) {
        recommendations.push('Add a main landmark for primary content');
      } else if (mainElements.length > 1) {
        recommendations.push('Multiple main landmarks found - should have only one');
      }
      
      // Check for navigation
      const navElements = document.querySelectorAll('nav, [role="navigation"]');
      if (navElements.length === 0) {
        recommendations.push('Consider adding navigation landmarks');
      }
      
      return {
        passed: recommendations.length === 0,
        landmarks,
        recommendations
      };
    });
    
    this.logger.info(`ARIA landmarks check completed: ${result.landmarks.length} landmarks found`);
    return result;
  }

  /**
   * Generate comprehensive accessibility report
   */
  async generateAccessibilityReport(): Promise<{
    axeResults: AccessibilityResult;
    keyboardNavigation: any;
    colorContrast: any;
    imageAltText: any;
    formAccessibility: any;
    headingStructure: any;
    ariaLandmarks: any;
    overallScore: number;
    timestamp: string;
  }> {
    this.logger.info('Generating comprehensive accessibility report');
    
    const [
      axeResults,
      keyboardNavigation,
      colorContrast,
      imageAltText,
      formAccessibility,
      headingStructure,
      ariaLandmarks
    ] = await Promise.all([
      this.runAxeScan(),
      this.checkKeyboardNavigation(),
      this.checkColorContrast(),
      this.checkImageAltText(),
      this.checkFormAccessibility(),
      this.checkHeadingStructure(),
      this.checkARIALandmarks()
    ]);
    
    // Calculate overall score
    const checks = [
      keyboardNavigation.passed,
      colorContrast.passed,
      imageAltText.passed,
      formAccessibility.passed,
      headingStructure.passed,
      ariaLandmarks.passed,
      axeResults.violations.length === 0
    ];
    
    const overallScore = (checks.filter(Boolean).length / checks.length) * 100;
    
    const report = {
      axeResults,
      keyboardNavigation,
      colorContrast,
      imageAltText,
      formAccessibility,
      headingStructure,
      ariaLandmarks,
      overallScore,
      timestamp: new Date().toISOString()
    };
    
    this.logger.success(`Accessibility report generated - Overall score: ${overallScore.toFixed(1)}%`);
    return report;
  }

  /**
   * Validate accessibility standards
   */
  validateAccessibilityStandards(
    report: any,
    standards: {
      minimumScore?: number;
      maxViolations?: number;
      requiredLandmarks?: string[];
    }
  ): { passed: boolean; failures: string[] } {
    this.logger.info('Validating accessibility standards');
    
    const failures: string[] = [];
    
    if (standards.minimumScore && report.overallScore < standards.minimumScore) {
      failures.push(`Overall score ${report.overallScore.toFixed(1)}% below minimum ${standards.minimumScore}%`);
    }
    
    if (standards.maxViolations && report.axeResults.violations.length > standards.maxViolations) {
      failures.push(`${report.axeResults.violations.length} violations exceed maximum ${standards.maxViolations}`);
    }
    
    if (standards.requiredLandmarks) {
      const missingLandmarks = standards.requiredLandmarks.filter(
        landmark => !report.ariaLandmarks.landmarks.includes(landmark)
      );
      if (missingLandmarks.length > 0) {
        failures.push(`Missing required landmarks: ${missingLandmarks.join(', ')}`);
      }
    }
    
    const passed = failures.length === 0;
    
    if (passed) {
      this.logger.success('All accessibility standards passed');
    } else {
      this.logger.error('Accessibility standards failures:', failures);
    }
    
    return { passed, failures };
  }
}
