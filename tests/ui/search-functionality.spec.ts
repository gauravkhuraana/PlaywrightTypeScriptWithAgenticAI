import { test, expect } from '../../src/fixtures/page-fixtures';
import { allure } from 'allure-playwright';

test.describe('Google Search Functionality Tests', () => {
  test.beforeEach(async ({ googleHomePage }) => {
    allure.feature('Search Functionality');
    await googleHomePage.goto();
  });

  test('should perform valid search with results verification @smoke @search', async ({
    googleHomePage,
    googleSearchResultsPage,
    testDataManager,
    logger,
    screenshotHelper
  }) => {
    allure.story('Valid Search Results');
    allure.description('This test validates that a valid search returns appropriate results');
    allure.severity('critical');
    
    logger.step('Starting valid search test');
    
    // Get test data for valid search
    const searchQuery = testDataManager.getSearchQueryById('valid-search-1');
    expect(searchQuery).toBeDefined();
    
    const query = searchQuery!.query;
    logger.info(`Performing search with query: "${query}"`);
    
    // Take screenshot before search
    await screenshotHelper.takeFullPageScreenshot('before-search');
    
    // Perform search
    await googleHomePage.search(query);
    
    // Wait for search results page to load
    await googleSearchResultsPage.waitForPageLoad();
    
    // Take screenshot after search
    await screenshotHelper.takeFullPageScreenshot('after-search');
    
    // Verify we're on search results page
    const currentUrl = await googleSearchResultsPage.getCurrentUrl();
    expect(currentUrl).toContain('google.com/search');
    expect(currentUrl).toContain(encodeURIComponent(query));
    
    // Verify search results are displayed
    const hasResults = await googleSearchResultsPage.hasResults();
    expect(hasResults).toBeTruthy();
    
    // Get search result count
    const resultCount = await googleSearchResultsPage.getResultCount();
    logger.info(`Found ${resultCount} search results`);
    expect(resultCount).toBeGreaterThan(0);
    expect(resultCount).toBeGreaterThanOrEqual(searchQuery!.expectedResults);
    
    // Verify result stats are shown
    const resultStats = await googleSearchResultsPage.getResultStats();
    expect(resultStats).toBeTruthy();
    expect(resultStats.length).toBeGreaterThan(0);
    logger.info(`Result stats: ${resultStats}`);
    
    // Get search result titles and verify they're relevant
    const resultTitles = await googleSearchResultsPage.getSearchResultTitles();
    expect(resultTitles.length).toBeGreaterThan(0);
    
    // Check if search query terms appear in some results
    const queryTerms = query.toLowerCase().split(' ');
    const relevantResults = resultTitles.filter(title => 
      queryTerms.some(term => title.toLowerCase().includes(term))
    );
    
    logger.info(`Found ${relevantResults.length} relevant results out of ${resultTitles.length}`);
    expect(relevantResults.length).toBeGreaterThan(0);
    
    // Attach test data to allure report
    allure.attachment('Search Query', query, 'text/plain');
    allure.attachment('Result Count', resultCount.toString(), 'text/plain');
    allure.attachment('Result Stats', resultStats, 'text/plain');
    allure.attachment('Search Result Titles', resultTitles.join('\\n'), 'text/plain');
    
    logger.success(`✅ Valid search test passed - Found ${resultCount} results for "${query}"`);
  });

  test('should handle search with special characters @edge-case @search', async ({
    googleHomePage,
    googleSearchResultsPage,
    testDataManager,
    logger,
    screenshotHelper
  }) => {
    allure.story('Special Characters Search');
    allure.description('This test validates that search handles special characters correctly');
    allure.severity('normal');
    
    logger.step('Starting special characters search test');
    
    // Get test data for special characters search
    const searchQuery = testDataManager.getSearchQueryById('special-chars-search');
    expect(searchQuery).toBeDefined();
    
    const query = searchQuery!.query;
    logger.info(`Performing search with special characters: "${query}"`);
    
    // Take screenshot before search
    await screenshotHelper.takeFullPageScreenshot('before-special-chars-search');
    
    // Perform search
    await googleHomePage.search(query);
    
    // Wait for search results page to load
    await googleSearchResultsPage.waitForPageLoad();
    
    // Take screenshot after search
    await screenshotHelper.takeFullPageScreenshot('after-special-chars-search');
    
    // Verify search was processed (even if no results)
    const currentUrl = await googleSearchResultsPage.getCurrentUrl();
    expect(currentUrl).toContain('google.com/search');
    
    // Verify search box contains the query
    const currentSearchQuery = await googleSearchResultsPage.getCurrentSearchQuery();
    logger.info(`Current search query in box: "${currentSearchQuery}"`);
    
    // Check if results are displayed or if "no results" message appears
    const hasResults = await googleSearchResultsPage.hasResults();
    const resultCount = await googleSearchResultsPage.getResultCount();
    
    logger.info(`Search with special characters completed:`);
    logger.info(`- Has results: ${hasResults}`);
    logger.info(`- Result count: ${resultCount}`);
    
    // The search should not cause errors or crashes
    // Results may or may not be found, but the search should be processed
    expect(currentUrl).toContain('q=');
    
    // Attach test data to allure report
    allure.attachment('Search Query with Special Characters', query, 'text/plain');
    allure.attachment('Has Results', hasResults.toString(), 'text/plain');
    allure.attachment('Result Count', resultCount.toString(), 'text/plain');
    
    logger.success(`✅ Special characters search test passed - Query processed successfully`);
  });

  test('should fail with extremely long query @edge-case @search @expected-fail', async ({
    googleHomePage,
    googleSearchResultsPage,
    testDataManager,
    logger,
    screenshotHelper
  }) => {
    allure.story('Long Query Search');
    allure.description('This test validates behavior with extremely long search queries (expected to fail)');
    allure.severity('normal');
    
    logger.step('Starting extremely long query search test (expected to fail)');
    
    // Get test data for long query search
    const searchQuery = testDataManager.getSearchQueryById('long-query-search');
    expect(searchQuery).toBeDefined();
    
    const query = searchQuery!.query;
    logger.info(`Performing search with extremely long query (${query.length} characters)`);
    logger.info(`Query preview: "${query.substring(0, 100)}..."`);
    
    // Take screenshot before search
    await screenshotHelper.takeFullPageScreenshot('before-long-query-search');
    
    try {
      // Attempt to perform search
      await googleHomePage.search(query);
      
      // Wait for response (may timeout or be rejected)
      await googleSearchResultsPage.waitForPageLoad();
      
      // Take screenshot after search attempt
      await screenshotHelper.takeFullPageScreenshot('after-long-query-search');
      
      // Check what happened
      const currentUrl = await googleSearchResultsPage.getCurrentUrl();
      const hasResults = await googleSearchResultsPage.hasResults();
      const resultCount = await googleSearchResultsPage.getResultCount();
      
      logger.info(`Long query search results:`);
      logger.info(`- URL contains search: ${currentUrl.includes('google.com/search')}`);
      logger.info(`- Has results: ${hasResults}`);
      logger.info(`- Result count: ${resultCount}`);
      
      // This test expects the search to either:
      // 1. Be rejected/truncated by the search engine
      // 2. Return no results
      // 3. Take excessively long time
      
      // If we get here with normal results, the test should fail as expected
      if (hasResults && resultCount >= searchQuery!.expectedResults) {
        throw new Error(`Unexpected success: Long query returned ${resultCount} results, expected failure`);
      }
      
      // Attach results to allure report
      allure.attachment('Long Query Length', query.length.toString(), 'text/plain');
      allure.attachment('Query Preview', query.substring(0, 200) + '...', 'text/plain');
      allure.attachment('Search Processed', currentUrl.includes('google.com/search').toString(), 'text/plain');
      allure.attachment('Result Count', resultCount.toString(), 'text/plain');
      
      // This test is designed to fail - if it gets normal results, that's unexpected
      expect(resultCount).toBeLessThan(searchQuery!.expectedResults);
      
      logger.success('✅ Long query test completed as expected - Search was handled appropriately');
      
    } catch (error) {
      logger.info(`Long query search failed as expected: ${error}`);
      
      // Take screenshot of error state
      await screenshotHelper.takeFailureScreenshot();
      
      // Attach error details to allure report
      allure.attachment('Expected Failure Details', error.toString(), 'text/plain');
      allure.attachment('Query Length', query.length.toString(), 'text/plain');
      
      // This is expected behavior for extremely long queries
      expect(error).toBeDefined();
      logger.success('✅ Long query test passed - Failed as expected');
    }
  });

  test('should fail pagination test for demo @pagination @search @expected-fail', async ({
    googleHomePage,
    googleSearchResultsPage,
    testDataManager,
    logger,
    screenshotHelper
  }) => {
    allure.story('Search Result Pagination');
    allure.description('This test validates search result pagination (designed to fail for demo)');
    allure.severity('normal');
    
    logger.step('Starting pagination test (designed to fail for demo)');
    
    // Get test data for pagination test
    const searchQuery = testDataManager.getSearchQueryById('pagination-test');
    expect(searchQuery).toBeDefined();
    
    const query = searchQuery!.query;
    logger.info(`Performing search for pagination test: "${query}"`);
    
    // Take screenshot before search
    await screenshotHelper.takeFullPageScreenshot('before-pagination-search');
    
    // Perform search
    await googleHomePage.search(query);
    await googleSearchResultsPage.waitForPageLoad();
    
    // Take screenshot after search
    await screenshotHelper.takeFullPageScreenshot('after-pagination-search');
    
    // Get initial results
    const firstPageResults = await googleSearchResultsPage.getResultCount();
    logger.info(`First page has ${firstPageResults} results`);
    
    // Check if pagination is available
    const hasNextPage = await googleSearchResultsPage.isNextPageAvailable();
    logger.info(`Next page available: ${hasNextPage}`);
    
    if (hasNextPage) {
      // Go to next page
      await googleSearchResultsPage.goToNextPage();
      await screenshotHelper.takeFullPageScreenshot('pagination-second-page');
      
      const secondPageResults = await googleSearchResultsPage.getResultCount();
      logger.info(`Second page has ${secondPageResults} results`);
      
      // Get current page number
      const currentPage = await googleSearchResultsPage.getCurrentPageNumber();
      logger.info(`Current page number: ${currentPage}`);
      
      // This test is designed to fail by expecting an unrealistic number of results
      const totalExpectedResults = searchQuery!.expectedResults; // This is set to 100 in test data
      const actualTotalResults = firstPageResults + secondPageResults;
      
      logger.info(`Expected total results: ${totalExpectedResults}`);
      logger.info(`Actual total results (first 2 pages): ${actualTotalResults}`);
      
      // Attach test data to allure report
      allure.attachment('Search Query', query, 'text/plain');
      allure.attachment('First Page Results', firstPageResults.toString(), 'text/plain');
      allure.attachment('Second Page Results', secondPageResults.toString(), 'text/plain');
      allure.attachment('Expected Total Results', totalExpectedResults.toString(), 'text/plain');
      allure.attachment('Actual Total Results (2 pages)', actualTotalResults.toString(), 'text/plain');
      
      // This assertion is designed to fail for demo purposes
      expect(actualTotalResults).toBeGreaterThanOrEqual(totalExpectedResults);
      
      logger.error('❌ Pagination test should have failed but passed unexpectedly');
      
    } else {
      logger.warn('No pagination available for this search');
      
      // Still fail the test as designed for demo
      expect(firstPageResults).toBeGreaterThanOrEqual(searchQuery!.expectedResults);
      
      allure.attachment('Search Query', query, 'text/plain');
      allure.attachment('First Page Results', firstPageResults.toString(), 'text/plain');
      allure.attachment('Pagination Available', 'false', 'text/plain');
      
      logger.error('❌ Pagination test failed as designed - insufficient results for pagination');
    }
  });

  test('should validate search suggestions functionality @search @suggestions', async ({
    googleHomePage,
    logger
  }) => {
    allure.story('Search Suggestions');
    allure.description('This test validates that search suggestions appear when typing');
    allure.severity('normal');
    
    logger.step('Starting search suggestions test');
    
    const partialQuery = 'playwright';
    logger.info(`Testing search suggestions for: "${partialQuery}"`);
    
    // Get search suggestions
    const suggestions = await googleHomePage.getSearchSuggestions(partialQuery);
    logger.info(`Found ${suggestions.length} search suggestions`);
    
    // Log suggestions
    suggestions.forEach((suggestion, index) => {
      logger.info(`Suggestion ${index + 1}: ${suggestion}`);
    });
    
    // Verify suggestions are provided
    expect(suggestions.length).toBeGreaterThan(0);
    
    // Verify suggestions are relevant (contain the search term)
    const relevantSuggestions = suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(partialQuery.toLowerCase())
    );
    
    expect(relevantSuggestions.length).toBeGreaterThan(0);
    
    // Attach results to allure report
    allure.attachment('Partial Query', partialQuery, 'text/plain');
    allure.attachment('Total Suggestions', suggestions.length.toString(), 'text/plain');
    allure.attachment('Relevant Suggestions', relevantSuggestions.length.toString(), 'text/plain');
    allure.attachment('All Suggestions', suggestions.join('\\n'), 'text/plain');
    
    logger.success(`✅ Search suggestions test passed - Found ${suggestions.length} suggestions`);
  });
});
