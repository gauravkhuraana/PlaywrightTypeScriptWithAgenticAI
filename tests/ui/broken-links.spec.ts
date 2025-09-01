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
      const found = languageLinks.some(link => 
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
});
