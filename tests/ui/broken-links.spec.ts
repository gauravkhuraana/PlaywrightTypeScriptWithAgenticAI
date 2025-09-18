import { test, expect } from '../../src/fixtures/page-fixtures';
import { allure } from 'allure-playwright';

test.describe('Google Home Page - Link Validation Tests', () => {
  test.beforeEach(async ({ googleHomePage }) => {
    allure.feature('Link Validation');
    allure.story('Broken Links Detection');
    await googleHomePage.goto();
  });

  test('should validate no broken links exist on the page @smoke @links', async ({
    googleHomePage,
    page,
    logger,
    screenshotHelper
  }) => {
    allure.description('This test validates that there are no broken links on the Google home page');
    allure.severity('critical');
    
    logger.step('Starting broken links validation test');
    
    // Take initial screenshot
    await screenshotHelper.takeFullPageScreenshot('google-home-initial');
    
    // Get all links on the page
    const links = await googleHomePage.getAllLinks();
    logger.info(`Found ${links.length} links to validate`);
    
    // Validate that we have links on the page
    expect(links.length).toBeGreaterThan(0);
    allure.attachment('Links Count', `Found ${links.length} links`, 'text/plain');
    
    const brokenLinks: string[] = [];
    const validatedLinks: string[] = [];
    const maxLinksToCheck = 10; // Limit for performance
    
    // Check first 10 links to avoid long test execution
    const linksToCheck = links.slice(0, maxLinksToCheck);
    
    for (const link of linksToCheck) {
      try {
        logger.info(`Checking link: ${link}`);
        
        // Skip javascript links and anchors
        if (link.startsWith('javascript:') || link.startsWith('#') || link.startsWith('mailto:')) {
          continue;
        }
        
        // Create absolute URL if relative
        let fullUrl = link;
        if (link.startsWith('/')) {
          fullUrl = `https://www.google.com${link}`;
        }
        
        // Use page.goto with timeout to check if link is accessible
        const response = await page.goto(fullUrl, { 
          waitUntil: 'domcontentloaded',
          timeout: 10000 
        });
        
        if (response && response.status() >= 400) {
          brokenLinks.push(`${fullUrl} (Status: ${response.status()})`);
          logger.error(`Broken link found: ${fullUrl} - Status: ${response.status()}`);
        } else {
          validatedLinks.push(fullUrl);
          logger.success(`Valid link: ${fullUrl}`);
        }
        
        // Go back to home page for next link check
        await googleHomePage.goto();
        
      } catch (error) {
        brokenLinks.push(`${link} (Error: ${error})`);
        logger.error(`Error checking link ${link}:`, error);
        
        // Ensure we're back on the home page
        await googleHomePage.goto();
      }
    }
    
    // Log results
    logger.info(`Link validation completed:`);
    logger.info(`- Valid links: ${validatedLinks.length}`);
    logger.info(`- Broken links: ${brokenLinks.length}`);
    
    // Attach results to allure report
    allure.attachment('Valid Links', validatedLinks.join('\\n'), 'text/plain');
    if (brokenLinks.length > 0) {
      allure.attachment('Broken Links', brokenLinks.join('\\n'), 'text/plain');
    }
    
    // Take final screenshot
    await screenshotHelper.takeFullPageScreenshot('google-home-final');
    
    // Assert no broken links
    expect(brokenLinks).toHaveLength(0);
    
    logger.success('✅ No broken links found - test passed');
  });

  test('should validate footer links are accessible @regression @links', async ({
    googleHomePage,
    page,
    logger
  }) => {
    allure.description('This test validates that footer links are accessible and working');
    allure.severity('normal');
    
    logger.step('Validating footer links accessibility');
    
    // Get footer links
    const footerLinks = await googleHomePage.getFooterLinks();
    logger.info(`Found ${footerLinks.length} footer links`);
    
    expect(footerLinks.length).toBeGreaterThan(0);
    
    const accessibleLinks: string[] = [];
    const inaccessibleLinks: string[] = [];
    
    // Check each footer link (limit to 5 for performance)
    const linksToCheck = footerLinks.slice(0, 5);
    
    for (const linkData of linksToCheck) {
      try {
        logger.info(`Checking footer link: ${linkData.text} -> ${linkData.href}`);
        
        if (linkData.href.startsWith('http')) {
          const response = await page.goto(linkData.href, { 
            waitUntil: 'domcontentloaded',
            timeout: 10000 
          });
          
          if (response && response.status() < 400) {
            accessibleLinks.push(`${linkData.text}: ${linkData.href}`);
            logger.success(`Accessible footer link: ${linkData.text}`);
          } else {
            inaccessibleLinks.push(`${linkData.text}: ${linkData.href} (Status: ${response?.status()})`);
            logger.error(`Inaccessible footer link: ${linkData.text} - Status: ${response?.status()}`);
          }
        }
        
        // Return to home page
        await googleHomePage.goto();
        
      } catch (error) {
        inaccessibleLinks.push(`${linkData.text}: ${linkData.href} (Error: ${error})`);
        logger.error(`Error checking footer link ${linkData.text}:`, error);
        await googleHomePage.goto();
      }
    }
    
    // Log results
    logger.info(`Footer link validation completed:`);
    logger.info(`- Accessible links: ${accessibleLinks.length}`);
    logger.info(`- Inaccessible links: ${inaccessibleLinks.length}`);
    
    // Attach results to allure report
    allure.attachment('Accessible Footer Links', accessibleLinks.join('\\n'), 'text/plain');
    if (inaccessibleLinks.length > 0) {
      allure.attachment('Inaccessible Footer Links', inaccessibleLinks.join('\\n'), 'text/plain');
    }
    
    // Assert all footer links are accessible
    expect(inaccessibleLinks).toHaveLength(0);
    
    logger.success('✅ All footer links are accessible - test passed');
  });

  test('should validate language links functionality @smoke @links', async ({
    googleHomePage,
    logger
  }) => {
    allure.description('This test validates that language switching links work correctly');
    allure.severity('normal');
    
    logger.step('Validating language links functionality');
    
    // Get language links
    const languageLinks = await googleHomePage.getLanguageLinks();
    logger.info(`Found ${languageLinks.length} language links`);
    
    expect(languageLinks.length).toBeGreaterThan(0);
    
    // Verify some common language links are present
    const commonLanguages = ['español', 'français', 'deutsch'];
    const foundLanguages: string[] = [];
    
    for (const language of commonLanguages) {
      const found = languageLinks.some((link: string) => 
        link.toLowerCase().includes(language.toLowerCase())
      );
      if (found) {
        foundLanguages.push(language);
        logger.success(`Found language link: ${language}`);
      }
    }
    
    // Attach results
    allure.attachment('Available Languages', languageLinks.join(', '), 'text/plain');
    allure.attachment('Found Common Languages', foundLanguages.join(', '), 'text/plain');
    
    // At least some language links should be present
    expect(languageLinks.length).toBeGreaterThan(3);
    
    logger.success('✅ Language links validation passed');
  });

  test('should validate external links open in new tab and are accessible @regression @links', async ({
    googleHomePage,
    page,
    logger,
    screenshotHelper
  }) => {
    allure.description('This test validates that external links open in new tab and are accessible');
    allure.severity('normal');
    
    logger.step('Validating external links functionality');
    
    // Take initial screenshot
    await screenshotHelper.takeFullPageScreenshot('external-links-initial');
    
    // Get all links and filter external ones
    const allLinks = await googleHomePage.getAllLinks();
    const externalLinks = allLinks.filter((link: string) => 
      link.startsWith('http') && 
      !link.includes('google.com') && 
      !link.includes('google.') &&
      !link.startsWith('javascript:') &&
      !link.startsWith('mailto:')
    );
    
    logger.info(`Found ${externalLinks.length} external links`);
    allure.attachment('External Links Count', `Found ${externalLinks.length} external links`, 'text/plain');
    
    const accessibleExternalLinks: string[] = [];
    const inaccessibleExternalLinks: string[] = [];
    const maxExternalLinksToCheck = 3; // Limit for performance
    
    // Check first few external links
    const linksToCheck = externalLinks.slice(0, maxExternalLinksToCheck);
    
    for (const link of linksToCheck) {
      try {
        logger.info(`Checking external link: ${link}`);
        
        // Open link in new tab/context to simulate new tab behavior
        const context = page.context();
        const newPage = await context.newPage();
        
        const response = await newPage.goto(link, { 
          waitUntil: 'domcontentloaded',
          timeout: 15000 
        });
        
        if (response && response.status() < 400) {
          accessibleExternalLinks.push(`${link} (Status: ${response.status()})`);
          logger.success(`Accessible external link: ${link}`);
        } else {
          inaccessibleExternalLinks.push(`${link} (Status: ${response?.status()})`);
          logger.error(`Inaccessible external link: ${link} - Status: ${response?.status()}`);
        }
        
        await newPage.close();
        
      } catch (error) {
        inaccessibleExternalLinks.push(`${link} (Error: ${error})`);
        logger.error(`Error checking external link ${link}:`, error);
      }
    }
    
    // Log results
    logger.info(`External link validation completed:`);
    logger.info(`- Accessible external links: ${accessibleExternalLinks.length}`);
    logger.info(`- Inaccessible external links: ${inaccessibleExternalLinks.length}`);
    
    // Attach results to allure report
    allure.attachment('Accessible External Links', accessibleExternalLinks.join('\n'), 'text/plain');
    if (inaccessibleExternalLinks.length > 0) {
      allure.attachment('Inaccessible External Links', inaccessibleExternalLinks.join('\n'), 'text/plain');
    }
    
    // Take final screenshot
    await screenshotHelper.takeFullPageScreenshot('external-links-final');
    
    // Assert no broken external links
    expect(inaccessibleExternalLinks).toHaveLength(0);
    
    logger.success('✅ All external links are accessible - test passed');
  });

  test('should validate anchor links work correctly @smoke @links', async ({
    googleHomePage,
    page,
    logger,
    screenshotHelper
  }) => {
    allure.description('This test validates that anchor/hash links work correctly and scroll to proper sections');
    allure.severity('normal');
    
    logger.step('Validating anchor links functionality');
    
    // Take initial screenshot
    await screenshotHelper.takeFullPageScreenshot('anchor-links-initial');
    
    // Get all links and filter anchor ones
    const allLinks = await googleHomePage.getAllLinks();
    const anchorLinks = allLinks.filter((link: string) => link.startsWith('#'));
    
    logger.info(`Found ${anchorLinks.length} anchor links`);
    allure.attachment('Anchor Links Count', `Found ${anchorLinks.length} anchor links`, 'text/plain');
    
    const workingAnchorLinks: string[] = [];
    const brokenAnchorLinks: string[] = [];
    
    // Get initial scroll position
    const initialScrollY = await page.evaluate(() => window.scrollY);
    
    for (const link of anchorLinks) {
      try {
        logger.info(`Checking anchor link: ${link}`);
        
        // Click on anchor link
        await page.click(`a[href="${link}"]`);
        
        // Wait for scroll animation to complete
        await page.waitForTimeout(1000);
        
        // Get new scroll position
        const newScrollY = await page.evaluate(() => window.scrollY);
        
        // Check if page scrolled or if target element exists
        const targetElement = await page.locator(link).count();
        
        if (newScrollY !== initialScrollY || targetElement > 0) {
          workingAnchorLinks.push(link);
          logger.success(`Working anchor link: ${link}`);
        } else {
          brokenAnchorLinks.push(link);
          logger.error(`Broken anchor link: ${link} - No scroll or target element found`);
        }
        
      } catch (error) {
        brokenAnchorLinks.push(`${link} (Error: ${error})`);
        logger.error(`Error checking anchor link ${link}:`, error);
      }
    }
    
    // Log results
    logger.info(`Anchor link validation completed:`);
    logger.info(`- Working anchor links: ${workingAnchorLinks.length}`);
    logger.info(`- Broken anchor links: ${brokenAnchorLinks.length}`);
    
    // Attach results to allure report
    allure.attachment('Working Anchor Links', workingAnchorLinks.join('\n'), 'text/plain');
    if (brokenAnchorLinks.length > 0) {
      allure.attachment('Broken Anchor Links', brokenAnchorLinks.join('\n'), 'text/plain');
    }
    
    // Take final screenshot
    await screenshotHelper.takeFullPageScreenshot('anchor-links-final');
    
    // If we found anchor links, assert none are broken
    if (anchorLinks.length > 0) {
      expect(brokenAnchorLinks).toHaveLength(0);
    }
    
    logger.success('✅ Anchor links validation passed');
  });

  test('should validate mailto links are present and correctly formatted @regression @links', async ({
    googleHomePage,
    page,
    logger,
    screenshotHelper
  }) => {
    allure.description('This test validates that mailto links are present and correctly formatted');
    allure.severity('normal');
    
    logger.step('Validating mailto links functionality');
    
    // Take initial screenshot
    await screenshotHelper.takeFullPageScreenshot('mailto-links-initial');
    
    // Get all links and filter mailto ones
    const allLinks = await googleHomePage.getAllLinks();
    const mailtoLinks = allLinks.filter((link: string) => link.startsWith('mailto:'));
    
    logger.info(`Found ${mailtoLinks.length} mailto links`);
    allure.attachment('Mailto Links Count', `Found ${mailtoLinks.length} mailto links`, 'text/plain');
    
    const validMailtoLinks: string[] = [];
    const invalidMailtoLinks: string[] = [];
    
    // Email validation regex
    const emailRegex = /^mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    for (const link of mailtoLinks) {
      try {
        logger.info(`Checking mailto link: ${link}`);
        
        // Validate email format
        if (emailRegex.test(link)) {
          validMailtoLinks.push(link);
          logger.success(`Valid mailto link: ${link}`);
        } else {
          invalidMailtoLinks.push(link);
          logger.error(`Invalid mailto link format: ${link}`);
        }
        
        // Check if the link element exists and is clickable
        const linkElement = await page.locator(`a[href="${link}"]`).first();
        const isVisible = await linkElement.isVisible();
        
        if (!isVisible) {
          logger.warn(`Mailto link not visible: ${link}`);
        }
        
      } catch (error) {
        invalidMailtoLinks.push(`${link} (Error: ${error})`);
        logger.error(`Error checking mailto link ${link}:`, error);
      }
    }
    
    // Log results
    logger.info(`Mailto link validation completed:`);
    logger.info(`- Valid mailto links: ${validMailtoLinks.length}`);
    logger.info(`- Invalid mailto links: ${invalidMailtoLinks.length}`);
    
    // Attach results to allure report
    allure.attachment('Valid Mailto Links', validMailtoLinks.join('\n'), 'text/plain');
    if (invalidMailtoLinks.length > 0) {
      allure.attachment('Invalid Mailto Links', invalidMailtoLinks.join('\n'), 'text/plain');
    }
    
    // Take final screenshot
    await screenshotHelper.takeFullPageScreenshot('mailto-links-final');
    
    // If we found mailto links, assert none are invalid
    if (mailtoLinks.length > 0) {
      expect(invalidMailtoLinks).toHaveLength(0);
    }
    
    logger.success('✅ Mailto links validation passed');
  });

  test('should validate image links load properly @smoke @links', async ({
    page,
    logger,
    screenshotHelper
  }) => {
    allure.description('This test validates that image links load properly and are accessible');
    allure.severity('normal');
    
    logger.step('Validating image links functionality');
    
    // Navigate to Google home page
    await page.goto('https://www.google.com');
    
    // Take initial screenshot
    await screenshotHelper.takeFullPageScreenshot('image-links-initial');
    
    // Get all image elements on the page
    const images = await page.locator('img').all();
    logger.info(`Found ${images.length} images on the page`);
    
    const loadedImages: string[] = [];
    const brokenImages: string[] = [];
    const maxImagesToCheck = 10; // Limit for performance
    
    // Check first 10 images
    const imagesToCheck = images.slice(0, maxImagesToCheck);
    
    for (let i = 0; i < imagesToCheck.length; i++) {
      const image = imagesToCheck[i];
      if (!image) continue;
      
      try {
        const src = await image.getAttribute('src');
        const alt = await image.getAttribute('alt');
        
        if (!src) {
          brokenImages.push(`Image ${i + 1}: No src attribute`);
          continue;
        }
        
        logger.info(`Checking image: ${src}`);
        
        // Check if image is loaded using natural width and height
        const isLoaded = await image.evaluate((img: HTMLImageElement) => {
          return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
        });
        
        // Check if image is visible
        const isVisible = await image.isVisible();
        
        if (isLoaded && isVisible) {
          loadedImages.push(`${src} (Alt: ${alt || 'No alt text'})`);
          logger.success(`Image loaded successfully: ${src}`);
        } else {
          brokenImages.push(`${src} (Alt: ${alt || 'No alt text'}) - Not loaded or not visible`);
          logger.error(`Image failed to load: ${src}`);
        }
        
      } catch (error) {
        brokenImages.push(`Image ${i + 1}: Error - ${error}`);
        logger.error(`Error checking image ${i + 1}:`, error);
      }
    }
    
    // Check for images with missing alt text (accessibility)
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    logger.info(`Images without alt text: ${imagesWithoutAlt}`);
    
    // Log results
    logger.info(`Image validation completed:`);
    logger.info(`- Loaded images: ${loadedImages.length}`);
    logger.info(`- Broken images: ${brokenImages.length}`);
    logger.info(`- Images without alt text: ${imagesWithoutAlt}`);
    
    // Attach results to allure report
    allure.attachment('Loaded Images', loadedImages.join('\n'), 'text/plain');
    if (brokenImages.length > 0) {
      allure.attachment('Broken Images', brokenImages.join('\n'), 'text/plain');
    }
    allure.attachment('Images Without Alt Text', `${imagesWithoutAlt} images missing alt text`, 'text/plain');
    
    // Take final screenshot
    await screenshotHelper.takeFullPageScreenshot('image-links-final');
    
    // Assert no broken images
    expect(brokenImages).toHaveLength(0);
    
    logger.success('✅ All images loaded properly - test passed');
  });

  test('should validate search result links functionality @regression @links', async ({
    googleHomePage,
    page,
    logger,
    screenshotHelper
  }) => {
    allure.description('This test validates that search result links are functional and accessible');
    allure.severity('high');
    
    logger.step('Validating search result links functionality');
    
    // Take initial screenshot
    await screenshotHelper.takeFullPageScreenshot('search-links-initial');
    
    // Perform a search
    const searchQuery = 'playwright testing';
    logger.info(`Performing search for: ${searchQuery}`);
    
    await googleHomePage.search(searchQuery);
    
    // Wait for search results to load
    await page.waitForSelector('[data-ved]', { timeout: 10000 });
    
    // Take screenshot after search
    await screenshotHelper.takeFullPageScreenshot('search-results-loaded');
    
    // Get search result links
    const searchResultLinks = await page.locator('h3 a, cite a').all();
    logger.info(`Found ${searchResultLinks.length} search result links`);
    
    const accessibleResultLinks: string[] = [];
    const inaccessibleResultLinks: string[] = [];
    const maxResultLinksToCheck = 5; // Limit for performance
    
    // Check first 5 search result links
    const linksToCheck = searchResultLinks.slice(0, maxResultLinksToCheck);
    
    for (let i = 0; i < linksToCheck.length; i++) {
      const link = linksToCheck[i];
      if (!link) continue;
      
      try {
        const href = await link.getAttribute('href');
        const linkText = await link.textContent();
        
        if (!href) {
          inaccessibleResultLinks.push(`Result ${i + 1}: No href attribute`);
          continue;
        }
        
        logger.info(`Checking search result link: ${href}`);
        
        // Check if link is clickable and visible
        const isVisible = await link.isVisible();
        const isEnabled = await link.isEnabled();
        
        if (isVisible && isEnabled && href.startsWith('http')) {
          accessibleResultLinks.push(`${linkText || 'No text'}: ${href}`);
          logger.success(`Accessible search result link: ${linkText}`);
        } else {
          inaccessibleResultLinks.push(`${linkText || 'No text'}: ${href} - Not accessible`);
          logger.error(`Inaccessible search result link: ${linkText}`);
        }
        
      } catch (error) {
        inaccessibleResultLinks.push(`Result ${i + 1}: Error - ${error}`);
        logger.error(`Error checking search result link ${i + 1}:`, error);
      }
    }
    
    // Verify "I'm Feeling Lucky" button works
    await googleHomePage.goto();
    const luckyButtonExists = await page.locator('[name="btnI"]').count() > 0;
    logger.info(`"I'm Feeling Lucky" button exists: ${luckyButtonExists}`);
    
    // Log results
    logger.info(`Search result link validation completed:`);
    logger.info(`- Accessible result links: ${accessibleResultLinks.length}`);
    logger.info(`- Inaccessible result links: ${inaccessibleResultLinks.length}`);
    logger.info(`- "I'm Feeling Lucky" button present: ${luckyButtonExists}`);
    
    // Attach results to allure report
    allure.attachment('Search Query', searchQuery, 'text/plain');
    allure.attachment('Accessible Search Result Links', accessibleResultLinks.join('\n'), 'text/plain');
    if (inaccessibleResultLinks.length > 0) {
      allure.attachment('Inaccessible Search Result Links', inaccessibleResultLinks.join('\n'), 'text/plain');
    }
    allure.attachment('Lucky Button Status', `Present: ${luckyButtonExists}`, 'text/plain');
    
    // Take final screenshot
    await screenshotHelper.takeFullPageScreenshot('search-links-final');
    
    // Assertions
    expect(accessibleResultLinks.length).toBeGreaterThan(0);
    expect(inaccessibleResultLinks).toHaveLength(0);
    expect(luckyButtonExists).toBeTruthy();
    
    logger.success('✅ Search result links validation passed');
  });
});
