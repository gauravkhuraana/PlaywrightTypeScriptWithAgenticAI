import { test, expect } from '@playwright/test';

test.describe('Example.com Demo Tests', () => {
  test('should validate Example.com page content @smoke', async ({ page }) => {
    // Navigate to Example.com (automation-friendly test site)
    await page.goto('https://example.com');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Validate key elements
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Example Domain');
    
    // Be more specific with the paragraph selector to avoid strict mode violation
    const description = page.locator('p').first();
    await expect(description).toBeVisible();
    await expect(description).toContainText('This domain is for use in illustrative examples');
    
    // Validate there's at least one link
    const links = page.locator('a');
    await expect(links.first()).toBeVisible();
    
    console.log('✅ Example.com validation completed successfully!');
  });

  test('should test link functionality @smoke', async ({ page }) => {
    // Navigate to Example.com
    await page.goto('https://example.com');
    await page.waitForLoadState('networkidle');
    
    // Find the "More information..." link
    const moreInfoLink = page.locator('a').first();
    await expect(moreInfoLink).toBeVisible();
    
    // Get the link text and href
    const linkText = await moreInfoLink.textContent();
    const linkHref = await moreInfoLink.getAttribute('href');
    
    console.log(`Found link: "${linkText}" pointing to: ${linkHref}`);
    
    // Validate link properties
    expect(linkText).toBeTruthy();
    expect(linkHref).toBeTruthy();
    expect(linkHref).toContain('iana.org');
    
    console.log('✅ Link validation completed successfully!');
  });

  test('should test httpbin API endpoint @api @smoke', async ({ request }) => {
    // Test a simple GET request to httpbin
    const response = await request.get('https://httpbin.org/get?test=automation');
    
    // Validate response
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.args.test).toBe('automation');
    expect(data.url).toContain('httpbin.org');
    
    console.log('✅ API test completed successfully!');
    console.log(`Response URL: ${data.url}`);
    console.log(`Query params: ${JSON.stringify(data.args)}`);
  });

  test('should demonstrate browser capabilities @smoke', async ({ page }) => {
    // Navigate to Example.com
    await page.goto('https://example.com');
    await page.waitForLoadState('networkidle');
    
    // Get page title
    const title = await page.title();
    expect(title).toBe('Example Domain');
    
    // Get page URL
    const url = page.url();
    expect(url).toBe('https://example.com/');
    
    // Take a screenshot (for demo purposes)
    await page.screenshot({ path: 'test-results/example-page.png', fullPage: true });
    
    // Get page content
    const content = await page.textContent('body');
    expect(content).toContain('Example Domain');
    expect(content).toContain('domain');
    
    console.log('✅ Browser capabilities demo completed successfully!');
    console.log(`Page title: ${title}`);
    console.log(`Page URL: ${url}`);
  });
});
