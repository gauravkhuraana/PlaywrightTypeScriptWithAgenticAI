import { test, expect } from '../src/fixtures/base-fixtures';

test.describe('Fixture Test', () => {
  test('should have access to all fixtures', async ({ 
    page, 
    testDataManager, 
    apiClient, 
    logger, 
    screenshotHelper, 
    videoHelper,
    browserConfig 
  }) => {
    // Test that all fixtures are properly initialized
    expect(page).toBeDefined();
    expect(testDataManager).toBeDefined();
    expect(apiClient).toBeDefined();
    expect(logger).toBeDefined();
    expect(screenshotHelper).toBeDefined();
    expect(videoHelper).toBeDefined();
    
    // Test browserConfig parameter
    console.log('Browser config:', browserConfig);
    
    // Navigate to a simple page
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example/);
    
    logger.info('Test completed successfully');
  });
});
