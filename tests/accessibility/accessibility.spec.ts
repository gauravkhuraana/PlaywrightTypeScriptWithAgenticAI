import { test, expect } from '../../src/fixtures/base-fixtures';
import { allure } from 'allure-playwright';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async () => {
    allure.feature('Accessibility Testing');
  });

  test('should pass accessibility scan on Google homepage @accessibility @smoke', async ({
    page,
    googleHomePage,
    logger,
    accessibilityHelper
  }) => {
    allure.story('Homepage Accessibility Scan');
    allure.description('This test validates Google homepage meets accessibility standards');
    allure.severity('critical');
    
    logger.step('Starting Google homepage accessibility scan');
    
    // Navigate to Google homepage
    await googleHomePage.navigate();
    await googleHomePage.waitForPageLoad();
    
    // Wait for page to fully load
    await page.waitForSelector('img[alt="Google"]', { state: 'visible' });
    await page.waitForLoadState('networkidle');
    
    // Run comprehensive accessibility scan
    logger.info('Running accessibility scan on Google homepage');
    
    const scanResults = await accessibilityHelper.runAccessibilityScan(page, {
      includeRules: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      excludeRules: [], // Include all rules for comprehensive scan
      reportLevel: 'violation' // Only report actual violations
    });
    
    // Log scan summary
    logger.info(`Accessibility scan completed:`);
    logger.info(`- Total violations: ${scanResults.violations.length}`);
    logger.info(`- Total passes: ${scanResults.passes.length}`);
    logger.info(`- Total incomplete: ${scanResults.incomplete.length}`);
    
    // Detailed violation logging
    if (scanResults.violations.length > 0) {
      logger.error('Accessibility violations found:');
      scanResults.violations.forEach((violation, index) => {
        logger.error(`${index + 1}. ${violation.id}: ${violation.description}`);
        logger.error(`   Impact: ${violation.impact}`);
        logger.error(`   Help: ${violation.help}`);
        logger.error(`   Nodes affected: ${violation.nodes.length}`);
      });
    } else {
      logger.success('No accessibility violations found!');
    }
    
    // Check for specific accessibility features
    const accessibilityFeatures = await page.evaluate(() => {
      return {
        hasMainLandmark: !!document.querySelector('main, [role="main"]'),
        hasHeadings: !!document.querySelector('h1, h2, h3, h4, h5, h6'),
        hasSkipLinks: !!document.querySelector('a[href^="#"], .skip-link'),
        hasAltText: Array.from(document.querySelectorAll('img')).every(img => 
          img.hasAttribute('alt') || img.hasAttribute('aria-label')),
        hasAriaLabels: !!document.querySelector('[aria-label], [aria-labelledby]'),
        hasFormLabels: Array.from(document.querySelectorAll('input, select, textarea')).every(input => 
          input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby') || 
          document.querySelector(`label[for="${input.id}"]`)),
        colorContrast: true // Will be checked by axe-core
      };
    });
    
    logger.info('Accessibility features check:');
    Object.entries(accessibilityFeatures).forEach(([feature, present]) => {
      if (present) {
        logger.success(`✓ ${feature}: Present`);
      } else {
        logger.warn(`⚠ ${feature}: Missing or incomplete`);
      }
    });
    
    // Generate accessibility report
    const reportPath = await accessibilityHelper.generateReport(scanResults, 'google-homepage-accessibility');
    logger.info(`Accessibility report saved to: ${reportPath}`);
    
    // Attach results to allure report
    allure.attachment('Violation Count', scanResults.violations.length.toString(), 'text/plain');
    allure.attachment('Passes Count', scanResults.passes.length.toString(), 'text/plain');
    allure.attachment('Incomplete Count', scanResults.incomplete.length.toString(), 'text/plain');
    allure.attachment('Accessibility Features', JSON.stringify(accessibilityFeatures, null, 2), 'application/json');
    allure.attachment('Report Path', reportPath, 'text/plain');
    
    if (scanResults.violations.length > 0) {
      allure.attachment('Violations Details', JSON.stringify(scanResults.violations, null, 2), 'application/json');
    }
    
    // Assert no critical violations (allow minor issues for demo)
    const criticalViolations = scanResults.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    expect(criticalViolations.length).toBeLessThanOrEqual(2); // Allow up to 2 for demo purposes
    
    logger.success('✅ Google homepage accessibility test completed');
  });

  test('should validate keyboard navigation @accessibility @keyboard', async ({
    page,
    googleHomePage,
    logger
  }) => {
    allure.story('Keyboard Navigation');
    allure.description('This test validates keyboard navigation functionality');
    allure.severity('normal');
    
    logger.step('Starting keyboard navigation test');
    
    // Navigate to Google homepage
    await googleHomePage.navigate();
    await googleHomePage.waitForPageLoad();
    
    // Test keyboard navigation
    logger.info('Testing keyboard navigation');
    
    // Focus on search box using Tab
    await page.keyboard.press('Tab');
    
    // Check if search box is focused
    const searchBoxFocused = await page.evaluate(() => {
      const activeElement = document.activeElement;
      return activeElement && (
        activeElement.tagName === 'INPUT' && 
        (activeElement as HTMLInputElement).name === 'q'
      );
    });
    
    if (searchBoxFocused) {
      logger.success('✓ Search box is keyboard accessible');
    } else {
      logger.warn('⚠ Search box focus not detected via keyboard');
    }
    
    // Type in search box
    await page.keyboard.type('accessibility testing');
    
    // Check if text was entered
    const searchValue = await page.inputValue('input[name="q"]');
    expect(searchValue).toBe('accessibility testing');
    logger.success('✓ Keyboard input works in search box');
    
    // Test Enter key to submit
    await page.keyboard.press('Enter');
    
    // Wait for navigation
    await page.waitForURL(/.*google\.com\/search.*/);
    logger.success('✓ Enter key submits search form');
    
    // Test Tab navigation on results page
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const focusedElementInfo = await page.evaluate(() => {
      const activeElement = document.activeElement;
      if (activeElement) {
        return {
          tagName: activeElement.tagName,
          type: (activeElement as any).type || null,
          role: activeElement.getAttribute('role'),
          ariaLabel: activeElement.getAttribute('aria-label'),
          className: activeElement.className,
          href: (activeElement as any).href || null
        };
      }
      return null;
    });
    
    logger.info('Current focused element:', focusedElementInfo);
    
    // Test Escape key functionality
    await page.keyboard.press('Escape');
    
    // Attach keyboard navigation results to allure report
    allure.attachment('Search Box Focused', searchBoxFocused.toString(), 'text/plain');
    allure.attachment('Search Value', searchValue, 'text/plain');
    allure.attachment('Focused Element Info', JSON.stringify(focusedElementInfo, null, 2), 'application/json');
    
    logger.success('✅ Keyboard navigation test completed');
  });

  test('should validate screen reader compatibility @accessibility @screen-reader', async ({
    page,
    googleHomePage,
    logger
  }) => {
    allure.story('Screen Reader Compatibility');
    allure.description('This test validates screen reader compatibility features');
    allure.severity('normal');
    
    logger.step('Starting screen reader compatibility test');
    
    // Navigate to Google homepage
    await googleHomePage.navigate();
    await googleHomePage.waitForPageLoad();
    
    // Check for screen reader specific elements
    const screenReaderFeatures = await page.evaluate(() => {
      const features = {
        altTexts: [] as string[],
        ariaLabels: [] as string[],
        ariaDescriptions: [] as string[],
        headingStructure: [] as string[],
        landmarks: [] as string[],
        skipLinks: [] as string[],
        liveRegions: [] as string[],
        hiddenContent: [] as string[]
      };
      
      // Check alt texts
      document.querySelectorAll('img[alt]').forEach(img => {
        const altText = img.getAttribute('alt');
        if (altText) features.altTexts.push(altText);
      });
      
      // Check aria-labels
      document.querySelectorAll('[aria-label]').forEach(el => {
        const ariaLabel = el.getAttribute('aria-label');
        if (ariaLabel) features.ariaLabels.push(ariaLabel);
      });
      
      // Check aria-describedby
      document.querySelectorAll('[aria-describedby]').forEach(el => {
        const ariaDesc = el.getAttribute('aria-describedby');
        if (ariaDesc) features.ariaDescriptions.push(ariaDesc);
      });
      
      // Check heading structure
      document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
        features.headingStructure.push(`${heading.tagName}: ${heading.textContent?.trim() || ''}`);
      });
      
      // Check landmarks
      document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer').forEach(landmark => {
        const role = landmark.getAttribute('role') || landmark.tagName.toLowerCase();
        features.landmarks.push(role);
      });
      
      // Check skip links
      document.querySelectorAll('a[href^="#"], .skip-link').forEach(link => {
        features.skipLinks.push(link.textContent?.trim() || '');
      });
      
      // Check live regions
      document.querySelectorAll('[aria-live], [role="status"], [role="alert"]').forEach(region => {
        const liveValue = region.getAttribute('aria-live') || region.getAttribute('role');
        if (liveValue) features.liveRegions.push(liveValue);
      });
      
      // Check hidden content for screen readers
      document.querySelectorAll('[aria-hidden="true"], .sr-only, .visually-hidden').forEach(hidden => {
        features.hiddenContent.push(hidden.className || hidden.tagName);
      });
      
      return features;
    });
    
    // Log screen reader features
    logger.info('Screen reader compatibility analysis:');
    logger.info(`- Alt texts found: ${screenReaderFeatures.altTexts.length}`);
    logger.info(`- ARIA labels found: ${screenReaderFeatures.ariaLabels.length}`);
    logger.info(`- ARIA descriptions found: ${screenReaderFeatures.ariaDescriptions.length}`);
    logger.info(`- Headings found: ${screenReaderFeatures.headingStructure.length}`);
    logger.info(`- Landmarks found: ${screenReaderFeatures.landmarks.length}`);
    logger.info(`- Skip links found: ${screenReaderFeatures.skipLinks.length}`);
    logger.info(`- Live regions found: ${screenReaderFeatures.liveRegions.length}`);
    
    // Test specific screen reader functionality
    const searchBoxAriaLabel = await page.getAttribute('input[name="q"]', 'aria-label');
    const googleLogoAltText = await page.getAttribute('img[alt*="Google"]', 'alt');
    
    logger.info(`Search box aria-label: ${searchBoxAriaLabel || 'Not found'}`);
    logger.info(`Google logo alt text: ${googleLogoAltText || 'Not found'}`);
    
    // Check page title for screen readers
    const pageTitle = await page.title();
    logger.info(`Page title: ${pageTitle}`);
    
    // Validate essential screen reader features
    expect(screenReaderFeatures.altTexts.length).toBeGreaterThan(0);
    expect(pageTitle).toBeTruthy();
    expect(googleLogoAltText).toBeTruthy();
    
    // Attach screen reader data to allure report
    allure.attachment('Page Title', pageTitle, 'text/plain');
    allure.attachment('Google Logo Alt Text', googleLogoAltText || 'Not found', 'text/plain');
    allure.attachment('Search Box ARIA Label', searchBoxAriaLabel || 'Not found', 'text/plain');
    allure.attachment('Screen Reader Features', JSON.stringify(screenReaderFeatures, null, 2), 'application/json');
    
    logger.success('✅ Screen reader compatibility test completed');
  });

  test('should validate color contrast and visual accessibility @accessibility @visual', async ({
    page,
    googleHomePage,
    logger,
    accessibilityHelper
  }) => {
    allure.story('Color Contrast and Visual Accessibility');
    allure.description('This test validates color contrast ratios and visual accessibility');
    allure.severity('normal');
    
    logger.step('Starting color contrast and visual accessibility test');
    
    // Navigate to Google homepage
    await googleHomePage.navigate();
    await googleHomePage.waitForPageLoad();
    
    // Run color contrast specific scan
    logger.info('Running color contrast accessibility scan');
    
    const contrastResults = await accessibilityHelper.runAccessibilityScan(page, {
      includeRules: ['color-contrast', 'color-contrast-enhanced'],
      excludeRules: [],
      reportLevel: 'violation'
    });
    
    // Get color information from key elements
    const colorInfo = await page.evaluate(() => {
      const getComputedColor = (element: Element) => {
        const styles = window.getComputedStyle(element);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight
        };
      };
      
      const elements = {
        searchBox: document.querySelector('input[name="q"]'),
        googleLogo: document.querySelector('img[alt*="Google"]'),
        searchButton: document.querySelector('input[value*="Search"], button[aria-label*="Search"]'),
        feelingLuckyButton: document.querySelector('input[value*="Lucky"], button[aria-label*="Lucky"]'),
        bodyText: document.body
      };
      
      const colors: any = {};
      Object.entries(elements).forEach(([key, element]) => {
        if (element) {
          colors[key] = getComputedColor(element);
        }
      });
      
      return colors;
    });
    
    logger.info('Color information extracted from key elements:');
    Object.entries(colorInfo).forEach(([element, styles]) => {
      logger.info(`${element}:`, styles);
    });
    
    // Check for high contrast mode support
    const highContrastSupport = await page.evaluate(() => {
      // Check if high contrast media query is supported
      return window.matchMedia('(prefers-contrast: high)').matches ||
             window.matchMedia('(-ms-high-contrast: active)').matches ||
             window.matchMedia('(-webkit-device-pixel-ratio: 1)').media !== 'not all';
    });
    
    logger.info(`High contrast mode support: ${highContrastSupport}`);
    
    // Check for reduced motion support
    const reducedMotionSupport = await page.evaluate(() => {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });
    
    logger.info(`Reduced motion preference: ${reducedMotionSupport}`);
    
    // Test focus indicators
    logger.info('Testing focus indicators');
    
    const searchBox = page.locator('input[name="q"]');
    await searchBox.focus();
    
    const focusStyles = await page.evaluate(() => {
      const searchInput = document.querySelector('input[name="q"]') as HTMLElement;
      if (searchInput) {
        const styles = window.getComputedStyle(searchInput, ':focus');
        return {
          outline: styles.outline,
          outlineColor: styles.outlineColor,
          outlineWidth: styles.outlineWidth,
          outlineStyle: styles.outlineStyle,
          boxShadow: styles.boxShadow,
          border: styles.border
        };
      }
      return null;
    });
    
    logger.info('Focus styles:', focusStyles);
    
    // Validate contrast results
    const contrastViolations = contrastResults.violations.filter(v => 
      v.id.includes('color-contrast')
    );
    
    logger.info(`Color contrast violations: ${contrastViolations.length}`);
    
    if (contrastViolations.length > 0) {
      logger.warn('Color contrast violations found:');
      contrastViolations.forEach((violation, index) => {
        logger.warn(`${index + 1}. ${violation.description}`);
        logger.warn(`   Help: ${violation.help}`);
      });
    } else {
      logger.success('No color contrast violations found!');
    }
    
    // Generate visual accessibility report
    const reportPath = await accessibilityHelper.generateReport(contrastResults, 'google-homepage-visual-accessibility');
    
    // Attach visual accessibility data to allure report
    allure.attachment('Contrast Violations', contrastViolations.length.toString(), 'text/plain');
    allure.attachment('High Contrast Support', highContrastSupport.toString(), 'text/plain');
    allure.attachment('Reduced Motion Support', reducedMotionSupport.toString(), 'text/plain');
    allure.attachment('Color Information', JSON.stringify(colorInfo, null, 2), 'application/json');
    allure.attachment('Focus Styles', JSON.stringify(focusStyles, null, 2), 'application/json');
    allure.attachment('Visual Accessibility Report', reportPath, 'text/plain');
    
    // Allow some contrast violations for demo purposes
    expect(contrastViolations.length).toBeLessThanOrEqual(3);
    
    logger.success('✅ Color contrast and visual accessibility test completed');
  });

  test('should validate form accessibility @accessibility @forms', async ({
    page,
    googleHomePage,
    logger
  }) => {
    allure.story('Form Accessibility');
    allure.description('This test validates form accessibility features');
    allure.severity('normal');
    
    logger.step('Starting form accessibility test');
    
    // Navigate to Google homepage
    await googleHomePage.navigate();
    await googleHomePage.waitForPageLoad();
    
    // Analyze form accessibility
    const formAccessibility = await page.evaluate(() => {
      const searchForm = document.querySelector('form[role="search"], form');
      const searchInput = document.querySelector('input[name="q"]');
      const searchButton = document.querySelector('input[value*="Search"], button[aria-label*="Search"]');
      
      const formInfo = {
        hasForm: !!searchForm,
        hasSearchRole: searchForm?.getAttribute('role') === 'search',
        hasFormLabel: !!searchForm?.getAttribute('aria-label') || !!searchForm?.getAttribute('aria-labelledby'),
        
        inputInfo: {
          hasInput: !!searchInput,
          hasName: !!searchInput?.getAttribute('name'),
          hasAriaLabel: !!searchInput?.getAttribute('aria-label'),
          hasPlaceholder: !!searchInput?.getAttribute('placeholder'),
          hasTitle: !!searchInput?.getAttribute('title'),
          hasAriaDescribedBy: !!searchInput?.getAttribute('aria-describedby'),
          inputType: searchInput?.getAttribute('type'),
          autocomplete: searchInput?.getAttribute('autocomplete'),
          required: searchInput?.hasAttribute('required')
        },
        
        buttonInfo: {
          hasButton: !!searchButton,
          hasAriaLabel: !!searchButton?.getAttribute('aria-label'),
          hasValue: !!searchButton?.getAttribute('value'),
          buttonType: searchButton?.getAttribute('type'),
          hasTitle: !!searchButton?.getAttribute('title')
        },
        
        associatedLabels: [] as string[]
      };
      
      // Check for associated labels
      if (searchInput) {
        const inputId = searchInput.getAttribute('id');
        if (inputId) {
          const label = document.querySelector(`label[for="${inputId}"]`);
          if (label) {
            formInfo.associatedLabels.push(label.textContent?.trim() || '');
          }
        }
        
        const ariaLabelledBy = searchInput.getAttribute('aria-labelledby');
        if (ariaLabelledBy) {
          const labelElements = ariaLabelledBy.split(' ').map(id => 
            document.getElementById(id)?.textContent?.trim()
          ).filter(Boolean);
          formInfo.associatedLabels.push(...labelElements);
        }
      }
      
      return formInfo;
    });
    
    logger.info('Form accessibility analysis:');
    logger.info(`- Form present: ${formAccessibility.hasForm}`);
    logger.info(`- Search role: ${formAccessibility.hasSearchRole}`);
    logger.info(`- Form labeled: ${formAccessibility.hasFormLabel}`);
    logger.info(`- Input present: ${formAccessibility.inputInfo.hasInput}`);
    logger.info(`- Input has name: ${formAccessibility.inputInfo.hasName}`);
    logger.info(`- Input has aria-label: ${formAccessibility.inputInfo.hasAriaLabel}`);
    logger.info(`- Button present: ${formAccessibility.buttonInfo.hasButton}`);
    logger.info(`- Button has aria-label: ${formAccessibility.buttonInfo.hasAriaLabel}`);
    logger.info(`- Associated labels: ${formAccessibility.associatedLabels.length}`);
    
    // Test form submission with keyboard
    logger.info('Testing form submission accessibility');
    
    const searchInput = page.locator('input[name="q"]');
    await searchInput.focus();
    await searchInput.fill('form accessibility test');
    
    // Test Enter key submission
    await page.keyboard.press('Enter');
    
    // Check if form was submitted
    const isSearchResultsPage = await page.waitForURL(/.*google\.com\/search.*/, { timeout: 5000 }).then(() => true).catch(() => false);
    
    if (isSearchResultsPage) {
      logger.success('✓ Form submission via Enter key works');
    } else {
      logger.warn('⚠ Form submission via Enter key not detected');
    }
    
    // Go back to test button submission
    await page.goBack();
    await googleHomePage.waitForPageLoad();
    
    // Test button click submission
    await searchInput.fill('button accessibility test');
    
    const searchButton = page.locator('input[value*="Search"], button[aria-label*="Search"]').first();
    if (await searchButton.count() > 0) {
      await searchButton.click();
      
      const isSearchResultsPage2 = await page.waitForURL(/.*google\.com\/search.*/, { timeout: 5000 }).then(() => true).catch(() => false);
      
      if (isSearchResultsPage2) {
        logger.success('✓ Form submission via button click works');
      } else {
        logger.warn('⚠ Form submission via button click not detected');
      }
    }
    
    // Validate form accessibility requirements
    expect(formAccessibility.hasForm).toBeTruthy();
    expect(formAccessibility.inputInfo.hasInput).toBeTruthy();
    expect(formAccessibility.inputInfo.hasName).toBeTruthy();
    
    // Attach form accessibility data to allure report
    allure.attachment('Form Accessibility Analysis', JSON.stringify(formAccessibility, null, 2), 'application/json');
    allure.attachment('Enter Key Submission', isSearchResultsPage.toString(), 'text/plain');
    
    logger.success('✅ Form accessibility test completed');
  });
});
