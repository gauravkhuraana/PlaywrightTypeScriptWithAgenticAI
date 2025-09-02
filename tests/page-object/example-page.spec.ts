import { test, expect } from '../../src/fixtures/page-fixtures';

test.describe('Example Page Tests with Page Object', () => {
  test('should use ExamplePage page object to navigate and validate @smoke', async ({ 
    examplePage 
  }) => {
    // Navigate to Example.com using page object
    await examplePage.goto();
    await examplePage.waitForPageLoad();
    
    // Validate page content using page object methods
    const heading = await examplePage.getHeading();
    expect(heading).toContain('Example Domain');
    
    const description = await examplePage.getDescription();
    expect(description).toBeTruthy();
    
    // Check if page has expected content
    const hasExpectedContent = await examplePage.hasExpectedContent();
    expect(hasExpectedContent).toBe(true);
    
    console.log('✅ Page object test completed successfully!');
  });

  test('should interact with more info link using page object @smoke', async ({ 
    examplePage 
  }) => {
    // Navigate to page
    await examplePage.goto();
    await examplePage.waitForPageLoad();
    
    // Check if more info link is visible
    const isLinkVisible = await examplePage.isMoreInfoLinkVisible();
    expect(isLinkVisible).toBe(true);
    
    // Get all links on the page
    const allLinks = await examplePage.getAllLinks();
    expect(allLinks.length).toBeGreaterThan(0);
    expect(allLinks[0]).toContain('iana.org');
    
    console.log(`Found ${allLinks.length} links on the page`);
    console.log(`First link: ${allLinks[0]}`);
    console.log('✅ Link interaction test completed successfully!');
  });

  test('should validate page structure using page object @smoke', async ({ 
    examplePage 
  }) => {
    // Navigate and validate using page object
    await examplePage.goto();
    await examplePage.waitForPageLoad();
    
    // Validate page structure using page object method
    const pageStructure = await examplePage.validatePageStructure();
    
    expect(pageStructure.hasHeading).toBe(true);
    expect(pageStructure.hasDescription).toBe(true);
    expect(pageStructure.hasLinks).toBe(true);
    expect(pageStructure.linkCount).toBeGreaterThan(0);
    
    console.log('Page structure validation results:', pageStructure);
    console.log('✅ Page structure validation test completed successfully!');
  });

  test('should demonstrate page object logging capabilities @smoke', async ({ 
    examplePage 
  }) => {
    // All page object methods include logging
    await examplePage.goto();
    await examplePage.waitForPageLoad();
    
    // These methods will log their actions automatically
    const heading = await examplePage.getHeading();
    const description = await examplePage.getDescription();
    const allLinks = await examplePage.getAllLinks();
    
    expect(heading).toBeTruthy();
    expect(description).toBeTruthy();
    expect(allLinks.length).toBeGreaterThan(0);
    
    console.log('✅ Page object logging test completed successfully!');
  });
});
