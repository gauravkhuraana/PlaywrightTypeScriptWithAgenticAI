import { test, expect } from '../../src/fixtures/base-fixtures';
import { allure } from 'allure-playwright';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async () => {
    allure.feature('Visual Testing');
  });

  test('should match Google homepage visual baseline @visual @smoke', async ({
    page,
    googleHomePage,
    logger,
    screenshotHelper
  }) => {
    allure.story('Homepage Visual Comparison');
    allure.description('This test validates Google homepage matches the visual baseline');
    allure.severity('critical');
    
    logger.step('Starting Google homepage visual regression test');
    
    // Navigate to Google homepage
    await googleHomePage.navigate();
    await googleHomePage.waitForPageLoad();
    
    // Wait for all elements to be visible
    await page.waitForSelector('img[alt="Google"]', { state: 'visible' });
    await page.waitForLoadState('networkidle');
    
    // Hide dynamic elements that change frequently
    await page.addStyleTag({
      content: `
        /* Hide dynamic elements that change frequently */
        .gb_d, /* User profile */
        .gb_A, /* Apps menu */
        [data-ved], /* Dynamic tracking attributes */
        .RNNXgb /* Sometimes appears on Google homepage */
        {
          visibility: hidden !important;
        }
        
        /* Stabilize animations */
        *, *::before, *::after {
          animation-delay: -1ms !important;
          animation-duration: 1ms !important;
          animation-iteration-count: 1 !important;
          background-attachment: initial !important;
          scroll-behavior: auto !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
    
    // Additional wait for stability
    await page.waitForTimeout(1000);
    
    // Take full page screenshot for visual comparison
    logger.info('Taking full page screenshot for visual comparison');
    
    await expect(page).toHaveScreenshot('google-homepage-full.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
      mode: 'light',
      threshold: 0.2, // Allow 20% difference for dynamic content
      maxDiffPixels: 1000
    });
    
    // Take viewport screenshot
    logger.info('Taking viewport screenshot for visual comparison');
    
    await expect(page).toHaveScreenshot('google-homepage-viewport.png', {
      fullPage: false,
      animations: 'disabled',
      caret: 'hide',
      threshold: 0.2,
      maxDiffPixels: 500
    });
    
    // Take screenshot of specific elements
    const logoElement = page.locator('img[alt="Google"]');
    await expect(logoElement).toHaveScreenshot('google-logo.png', {
      threshold: 0.1,
      maxDiffPixels: 100
    });
    
    const searchBoxElement = page.locator('input[name="q"]');
    await expect(searchBoxElement).toHaveScreenshot('search-box.png', {
      threshold: 0.1,
      maxDiffPixels: 50
    });
    
    // Save custom screenshot with metadata
    const customScreenshot = await screenshotHelper.takeScreenshot(page, {
      name: 'google-homepage-custom',
      fullPage: true,
      quality: 90
    });
    
    logger.info(`Custom screenshot saved: ${customScreenshot}`);
    
    // Attach screenshots to allure report
    allure.attachment('Homepage URL', await page.url(), 'text/plain');
    allure.attachment('Viewport Size', JSON.stringify(page.viewportSize()), 'application/json');
    allure.attachment('Custom Screenshot Path', customScreenshot, 'text/plain');
    
    logger.success('✅ Google homepage visual regression test passed');
  });

  test('should match search results visual baseline @visual @search', async ({
    page,
    googleHomePage,
    googleSearchResultsPage,
    logger,
    screenshotHelper
  }) => {
    allure.story('Search Results Visual Comparison');
    allure.description('This test validates Google search results page matches the visual baseline');
    allure.severity('normal');
    
    logger.step('Starting Google search results visual regression test');
    
    const searchTerm = 'playwright testing';
    
    // Navigate and search
    await googleHomePage.navigate();
    await googleHomePage.performSearch(searchTerm);
    
    // Wait for search results to load
    await googleSearchResultsPage.waitForSearchResults();
    await page.waitForLoadState('networkidle');
    
    // Hide dynamic and personalized content
    await page.addStyleTag({
      content: `
        /* Hide dynamic elements */
        .gb_d, .gb_A, /* User profile and apps */
        [data-ved], /* Dynamic tracking attributes */
        .ULSxyf, /* Related searches that change */
        .g .IsZvec, /* Snippets with dates */
        .MjjYud .TbwUpd, /* Dynamic result metadata */
        .hlcw0c, /* People also ask section */
        .related-question-pair, /* Dynamic questions */
        #bfoot, /* Footer with changing links */
        .commercial-unit-desktop-rhs, /* Ads */
        .cu-container /* Ad containers */
        {
          visibility: hidden !important;
        }
        
        /* Stabilize animations */
        * {
          animation: none !important;
          transition: none !important;
        }
      `
    });
    
    // Additional wait for stability
    await page.waitForTimeout(2000);
    
    // Take search results screenshot
    logger.info('Taking search results screenshot for visual comparison');
    
    await expect(page).toHaveScreenshot('search-results-full.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
      threshold: 0.3, // Higher threshold due to dynamic search results
      maxDiffPixels: 2000
    });
    
    // Take screenshot of search results area only
    const searchResultsContainer = page.locator('#search');
    if (await searchResultsContainer.count() > 0) {
      await expect(searchResultsContainer).toHaveScreenshot('search-results-container.png', {
        threshold: 0.3,
        maxDiffPixels: 1500
      });
    }
    
    // Take screenshot of search bar area
    const searchBar = page.locator('.RNNXgb');
    if (await searchBar.count() > 0) {
      await expect(searchBar).toHaveScreenshot('search-bar.png', {
        threshold: 0.2,
        maxDiffPixels: 200
      });
    }
    
    // Save custom screenshot with search metadata
    const customScreenshot = await screenshotHelper.takeScreenshot(page, {
      name: `search-results-${searchTerm.replace(/\s+/g, '-')}`,
      fullPage: false,
      quality: 85
    });
    
    logger.info(`Search results screenshot saved: ${customScreenshot}`);
    
    // Attach test data to allure report
    allure.attachment('Search Term', searchTerm, 'text/plain');
    allure.attachment('Results URL', await page.url(), 'text/plain');
    allure.attachment('Custom Screenshot Path', customScreenshot, 'text/plain');
    
    logger.success('✅ Google search results visual regression test passed');
  });

  test('should detect visual changes in mobile view @visual @mobile', async ({
    page,
    googleHomePage,
    logger,
    screenshotHelper
  }) => {
    allure.story('Mobile View Visual Comparison');
    allure.description('This test validates Google homepage in mobile view matches the visual baseline');
    allure.severity('normal');
    
    logger.step('Starting mobile view visual regression test');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    // Navigate to Google homepage
    await googleHomePage.navigate();
    await googleHomePage.waitForPageLoad();
    
    // Wait for mobile-specific elements
    await page.waitForSelector('img[alt="Google"]', { state: 'visible' });
    await page.waitForLoadState('networkidle');
    
    // Hide mobile-specific dynamic elements
    await page.addStyleTag({
      content: `
        /* Hide dynamic mobile elements */
        .gb_d, .gb_A, /* User elements */
        [data-ved], /* Dynamic attributes */
        .RNNXgb, /* Sometimes present on mobile */
        .o3j99.LLD4me.yr19Zb.LS8OJ /* Mobile footer elements */
        {
          visibility: hidden !important;
        }
        
        /* Disable animations on mobile */
        * {
          animation: none !important;
          transition: none !important;
        }
      `
    });
    
    // Wait for mobile layout to stabilize
    await page.waitForTimeout(1500);
    
    // Take mobile screenshot
    logger.info('Taking mobile view screenshot for visual comparison');
    
    await expect(page).toHaveScreenshot('google-homepage-mobile.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
      threshold: 0.2,
      maxDiffPixels: 800
    });
    
    // Take mobile viewport screenshot
    await expect(page).toHaveScreenshot('google-homepage-mobile-viewport.png', {
      fullPage: false,
      animations: 'disabled',
      caret: 'hide',
      threshold: 0.2,
      maxDiffPixels: 400
    });
    
    // Test mobile-specific elements
    const mobileSearchBox = page.locator('input[name="q"]');
    await expect(mobileSearchBox).toHaveScreenshot('mobile-search-box.png', {
      threshold: 0.1,
      maxDiffPixels: 50
    });
    
    // Save custom mobile screenshot
    const customScreenshot = await screenshotHelper.takeScreenshot(page, {
      name: 'google-homepage-mobile-custom',
      fullPage: true,
      quality: 90
    });
    
    logger.info(`Mobile screenshot saved: ${customScreenshot}`);
    
    // Attach mobile test data to allure report
    allure.attachment('Mobile Viewport', '375x667 (iPhone SE)', 'text/plain');
    allure.attachment('User Agent', await page.evaluate(() => navigator.userAgent), 'text/plain');
    allure.attachment('Mobile Screenshot Path', customScreenshot, 'text/plain');
    
    logger.success('✅ Mobile view visual regression test passed');
  });

  test('should compare visual differences across browsers @visual @cross-browser', async ({
    page,
    googleHomePage,
    logger,
    screenshotHelper
  }) => {
    allure.story('Cross-Browser Visual Comparison');
    allure.description('This test captures screenshots for cross-browser visual comparison');
    allure.severity('normal');
    
    logger.step('Starting cross-browser visual comparison test');
    
    // Navigate to Google homepage
    await googleHomePage.navigate();
    await googleHomePage.waitForPageLoad();
    
    // Get browser info
    const browserName = page.context().browser()?.browserType().name() || 'unknown';
    const userAgent = await page.evaluate(() => navigator.userAgent);
    
    logger.info(`Testing in browser: ${browserName}`);
    logger.info(`User agent: ${userAgent}`);
    
    // Wait for page stability
    await page.waitForSelector('img[alt="Google"]', { state: 'visible' });
    await page.waitForLoadState('networkidle');
    
    // Hide dynamic elements for consistent comparison
    await page.addStyleTag({
      content: `
        /* Cross-browser stability styles */
        .gb_d, .gb_A, [data-ved], .RNNXgb {
          visibility: hidden !important;
        }
        
        /* Normalize fonts and rendering */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          font-feature-settings: 'kern' 1;
          animation: none !important;
          transition: none !important;
        }
      `
    });
    
    await page.waitForTimeout(1000);
    
    // Take browser-specific screenshot
    const browserScreenshotName = `google-homepage-${browserName}.png`;
    
    logger.info(`Taking screenshot for ${browserName}`);
    
    await expect(page).toHaveScreenshot(browserScreenshotName, {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
      threshold: 0.2,
      maxDiffPixels: 1000
    });
    
    // Take viewport screenshot for this browser
    const browserViewportName = `google-homepage-${browserName}-viewport.png`;
    
    await expect(page).toHaveScreenshot(browserViewportName, {
      fullPage: false,
      animations: 'disabled',
      caret: 'hide',
      threshold: 0.2,
      maxDiffPixels: 500
    });
    
    // Save custom screenshot with browser info
    const customScreenshot = await screenshotHelper.takeScreenshot(page, {
      name: `google-homepage-${browserName}-custom`,
      fullPage: true,
      quality: 95
    });
    
    logger.info(`Browser-specific screenshot saved: ${customScreenshot}`);
    
    // Attach browser information to allure report
    allure.attachment('Browser Name', browserName, 'text/plain');
    allure.attachment('User Agent', userAgent, 'text/plain');
    allure.attachment('Screenshot Name', browserScreenshotName, 'text/plain');
    allure.attachment('Custom Screenshot Path', customScreenshot, 'text/plain');
    
    logger.success(`✅ Cross-browser visual test passed for ${browserName}`);
  });

  test('should capture visual state during user interactions @visual @interactive', async ({
    page,
    googleHomePage,
    logger,
    screenshotHelper
  }) => {
    allure.story('Interactive Elements Visual Testing');
    allure.description('This test captures visual states during user interactions');
    allure.severity('normal');
    
    logger.step('Starting interactive visual regression test');
    
    // Navigate to Google homepage
    await googleHomePage.navigate();
    await googleHomePage.waitForPageLoad();
    
    // Initial state screenshot
    logger.info('Capturing initial state');
    await expect(page).toHaveScreenshot('google-homepage-initial-state.png', {
      animations: 'disabled',
      caret: 'hide',
      threshold: 0.1
    });
    
    // Hover over search box
    const searchBox = page.locator('input[name="q"]');
    await searchBox.hover();
    
    logger.info('Capturing search box hover state');
    await expect(page).toHaveScreenshot('google-homepage-searchbox-hover.png', {
      animations: 'disabled',
      caret: 'hide',
      threshold: 0.1
    });
    
    // Click and focus search box
    await searchBox.click();
    await page.waitForTimeout(500); // Wait for focus state
    
    logger.info('Capturing search box focused state');
    await expect(page).toHaveScreenshot('google-homepage-searchbox-focused.png', {
      animations: 'disabled',
      caret: 'hide',
      threshold: 0.1
    });
    
    // Type in search box
    await searchBox.fill('visual testing');
    await page.waitForTimeout(500); // Wait for text input
    
    logger.info('Capturing search box with text state');
    await expect(page).toHaveScreenshot('google-homepage-searchbox-with-text.png', {
      animations: 'disabled',
      caret: 'hide',
      threshold: 0.1
    });
    
    // Check if suggestions appear and capture them
    const suggestions = page.locator('.aajZCb'); // Google search suggestions
    if (await suggestions.count() > 0) {
      logger.info('Capturing search suggestions state');
      await expect(page).toHaveScreenshot('google-homepage-with-suggestions.png', {
        animations: 'disabled',
        caret: 'hide',
        threshold: 0.2,
        maxDiffPixels: 500
      });
    }
    
    // Clear search box
    await searchBox.clear();
    await page.waitForTimeout(500);
    
    logger.info('Capturing cleared search box state');
    await expect(page).toHaveScreenshot('google-homepage-searchbox-cleared.png', {
      animations: 'disabled',
      caret: 'hide',
      threshold: 0.1
    });
    
    // Save final state with custom screenshot
    const customScreenshot = await screenshotHelper.takeScreenshot(page, {
      name: 'google-homepage-final-interactive-state',
      fullPage: false,
      quality: 90
    });
    
    logger.info(`Interactive test screenshot saved: ${customScreenshot}`);
    
    // Attach interaction data to allure report
    allure.attachment('Interaction Steps', 'Initial → Hover → Focus → Type → Clear', 'text/plain');
    allure.attachment('Test Text', 'visual testing', 'text/plain');
    allure.attachment('Final Screenshot Path', customScreenshot, 'text/plain');
    
    logger.success('✅ Interactive visual regression test passed');
  });

  test('should handle visual testing with dynamic content @visual @dynamic', async ({
    page,
    googleHomePage,
    logger
  }) => {
    allure.story('Dynamic Content Visual Testing');
    allure.description('This test demonstrates handling of dynamic content in visual tests');
    allure.severity('normal');
    
    logger.step('Starting dynamic content visual test');
    
    // Navigate to Google homepage
    await googleHomePage.navigate();
    await googleHomePage.waitForPageLoad();
    
    // Mask dynamic content areas
    await page.addStyleTag({
      content: `
        /* Mask areas with dynamic content */
        .gb_d, .gb_A { 
          background: #f0f0f0 !important; 
          color: transparent !important;
        }
        
        /* Hide potentially changing elements */
        [data-ved] { visibility: hidden !important; }
        
        /* Stabilize any animations */
        * { 
          animation-play-state: paused !important;
          transition: none !important;
        }
      `
    });
    
    await page.waitForTimeout(1000);
    
    // Use mask for dynamic areas
    logger.info('Taking screenshot with masked dynamic content');
    
    await expect(page).toHaveScreenshot('google-homepage-masked-dynamic.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
      mask: [
        page.locator('.gb_d'), // User profile area
        page.locator('.gb_A'), // Apps menu
      ],
      threshold: 0.1,
      maxDiffPixels: 200
    });
    
    // Test with clip for specific area
    const searchArea = await page.locator('form[role="search"]').boundingBox();
    if (searchArea) {
      logger.info('Taking clipped screenshot of search area');
      
      await expect(page).toHaveScreenshot('google-search-area-clipped.png', {
        clip: searchArea,
        animations: 'disabled',
        caret: 'hide',
        threshold: 0.1
      });
    }
    
    logger.success('✅ Dynamic content visual test passed');
  });
});
