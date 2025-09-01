import { test, expect } from '@playwright/test';

test.describe('Google Search Demo', () => {
  test('should perform basic search @smoke', async ({ page }) => {
    // Navigate to Google
    await page.goto('https://www.google.com');
    
    // Accept cookies if present
    try {
      const acceptButton = page.locator('button:has-text("Accept all"), button:has-text("I agree")');
      if (await acceptButton.isVisible({ timeout: 3000 })) {
        await acceptButton.click();
      }
    } catch (error) {
      // Ignore if no cookie banner
    }
    
    // Search for Playwright
    const searchBox = page.locator('input[name="q"], textarea[name="q"]');
    await searchBox.fill('Playwright testing framework');
    await searchBox.press('Enter');
    
    // Wait for results
    await page.waitForSelector('h3');
    
    // Verify results
    const firstResult = page.locator('h3').first();
    await expect(firstResult).toBeVisible();
    
    console.log('✅ Search test completed successfully!');
  });

  test('should validate Google homepage elements @smoke', async ({ page }) => {
    // Navigate to Google
    await page.goto('https://www.google.com');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Validate key elements
    const googleLogo = page.locator('img[alt*="Google"]');
    await expect(googleLogo).toBeVisible();
    
    const searchBox = page.locator('input[name="q"], textarea[name="q"]');
    await expect(searchBox).toBeVisible();
    
    console.log('✅ Homepage validation completed successfully!');
  });
});
