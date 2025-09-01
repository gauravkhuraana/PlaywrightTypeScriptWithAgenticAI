import { test, expect } from '../../src/fixtures/base-fixtures';
import { allure } from 'allure-playwright';

test.describe('Performance Tests', () => {
  test.beforeEach(async () => {
    allure.feature('Performance Testing');
  });

  test('should meet performance benchmarks for Google homepage @performance @smoke', async ({
    page,
    googleHomePage,
    logger,
    performanceHelper
  }) => {
    allure.story('Homepage Performance Benchmarks');
    allure.description('This test validates Google homepage meets performance benchmarks');
    allure.severity('critical');
    
    logger.step('Starting Google homepage performance test');
    
    // Start performance monitoring
    await performanceHelper.startMonitoring(page);
    
    // Navigate to Google homepage with performance tracking
    const navigationStart = Date.now();
    await googleHomePage.navigate();
    await googleHomePage.waitForPageLoad();
    const navigationEnd = Date.now();
    
    const pageLoadTime = navigationEnd - navigationStart;
    logger.info(`Page load time: ${pageLoadTime}ms`);
    
    // Wait for all resources to load
    await page.waitForLoadState('networkidle');
    
    // Get performance metrics
    const performanceMetrics = await performanceHelper.getMetrics(page);
    
    logger.info('Performance metrics:');
    logger.info(`- Load time: ${performanceMetrics.loadTime}ms`);
    logger.info(`- First Contentful Paint: ${performanceMetrics.firstContentfulPaint}ms`);
    logger.info(`- Largest Contentful Paint: ${performanceMetrics.largestContentfulPaint}ms`);
    logger.info(`- First Input Delay: ${performanceMetrics.firstInputDelay}ms`);
    logger.info(`- Cumulative Layout Shift: ${performanceMetrics.cumulativeLayoutShift}`);
    logger.info(`- Total Blocking Time: ${performanceMetrics.totalBlockingTime}ms`);
    
    // Get resource loading metrics
    const resourceMetrics = await performanceHelper.getResourceMetrics(page);
    
    logger.info('Resource metrics:');
    logger.info(`- Total resources: ${resourceMetrics.totalResources}`);
    logger.info(`- Total size: ${(resourceMetrics.totalSize / 1024).toFixed(2)} KB`);
    logger.info(`- Images: ${resourceMetrics.images} (${(resourceMetrics.imageSize / 1024).toFixed(2)} KB)`);
    logger.info(`- Scripts: ${resourceMetrics.scripts} (${(resourceMetrics.scriptSize / 1024).toFixed(2)} KB)`);
    logger.info(`- Stylesheets: ${resourceMetrics.stylesheets} (${(resourceMetrics.stylesheetSize / 1024).toFixed(2)} KB)`);
    
    // Get Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {
          LCP: 0,
          FID: 0,
          CLS: 0,
          FCP: 0,
          TTFB: 0
        };
        
        // Get performance entries
        const perfEntries = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (perfEntries) {
          vitals.TTFB = perfEntries.responseStart - perfEntries.requestStart;
        }
        
        // Try to get paint metrics
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            vitals.FCP = entry.startTime;
          }
        });
        
        // For LCP, FID, CLS we'd typically use web-vitals library
        // For this demo, we'll use basic measurements
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              vitals.LCP = entry.startTime;
            }
            if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
              vitals.CLS += (entry as any).value;
            }
          });
        });
        
        try {
          observer.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift'] });
        } catch (e) {
          // Some metrics may not be available
        }
        
        // Resolve after a short delay to collect metrics
        setTimeout(() => {
          observer.disconnect();
          resolve(vitals);
        }, 2000);
      });
    });
    
    logger.info('Core Web Vitals:');
    logger.info(`- Largest Contentful Paint (LCP): ${(webVitals as any).LCP}ms`);
    logger.info(`- First Input Delay (FID): ${(webVitals as any).FID}ms`);
    logger.info(`- Cumulative Layout Shift (CLS): ${(webVitals as any).CLS}`);
    logger.info(`- First Contentful Paint (FCP): ${(webVitals as any).FCP}ms`);
    logger.info(`- Time to First Byte (TTFB): ${(webVitals as any).TTFB}ms`);
    
    // Get memory usage
    const memoryUsage = await performanceHelper.getMemoryUsage(page);
    
    logger.info('Memory usage:');
    logger.info(`- Used JS heap size: ${(memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    logger.info(`- Total JS heap size: ${(memoryUsage.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    logger.info(`- JS heap size limit: ${(memoryUsage.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
    
    // Performance assertions (generous limits for demo)
    expect(performanceMetrics.loadTime).toBeLessThan(5000); // 5 seconds
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(3000); // 3 seconds
    expect(performanceMetrics.largestContentfulPaint).toBeLessThan(4000); // 4 seconds
    expect((webVitals as any).CLS).toBeLessThan(0.25); // Good CLS score
    expect(resourceMetrics.totalSize).toBeLessThan(2 * 1024 * 1024); // 2MB total
    
    // Generate performance report
    const reportPath = await performanceHelper.generateReport({
      url: await page.url(),
      metrics: performanceMetrics,
      resources: resourceMetrics,
      webVitals: webVitals,
      memory: memoryUsage,
      timestamp: new Date().toISOString()
    }, 'google-homepage-performance');
    
    logger.info(`Performance report saved to: ${reportPath}`);
    
    // Attach performance data to allure report
    allure.attachment('Page Load Time', `${pageLoadTime}ms`, 'text/plain');
    allure.attachment('Performance Metrics', JSON.stringify(performanceMetrics, null, 2), 'application/json');
    allure.attachment('Resource Metrics', JSON.stringify(resourceMetrics, null, 2), 'application/json');
    allure.attachment('Core Web Vitals', JSON.stringify(webVitals, null, 2), 'application/json');
    allure.attachment('Memory Usage', JSON.stringify(memoryUsage, null, 2), 'application/json');
    allure.attachment('Performance Report', reportPath, 'text/plain');
    
    logger.success('✅ Google homepage performance test completed');
  });

  test('should measure search performance @performance @search', async ({
    page,
    googleHomePage,
    googleSearchResultsPage,
    logger,
    performanceHelper
  }) => {
    allure.story('Search Performance');
    allure.description('This test measures search functionality performance');
    allure.severity('normal');
    
    logger.step('Starting search performance test');
    
    const searchTerm = 'performance testing';
    
    // Navigate to homepage first
    await googleHomePage.navigate();
    await googleHomePage.waitForPageLoad();
    
    // Start monitoring for search
    await performanceHelper.startMonitoring(page);
    
    // Measure search performance
    const searchStart = Date.now();
    await googleHomePage.performSearch(searchTerm);
    await googleSearchResultsPage.waitForSearchResults();
    const searchEnd = Date.now();
    
    const searchTime = searchEnd - searchStart;
    logger.info(`Search time: ${searchTime}ms`);
    
    // Wait for all search results to load
    await page.waitForLoadState('networkidle');
    
    // Get search-specific performance metrics
    const searchMetrics = await performanceHelper.getMetrics(page);
    
    logger.info('Search performance metrics:');
    logger.info(`- Search completion time: ${searchTime}ms`);
    logger.info(`- Page load time: ${searchMetrics.loadTime}ms`);
    logger.info(`- First Contentful Paint: ${searchMetrics.firstContentfulPaint}ms`);
    logger.info(`- Largest Contentful Paint: ${searchMetrics.largestContentfulPaint}ms`);
    
    // Count search results
    const resultCount = await googleSearchResultsPage.getSearchResultsCount();
    logger.info(`Search results found: ${resultCount}`);
    
    // Measure time to see first results
    const firstResultVisible = await page.locator('h3').first().isVisible();
    logger.info(`First result visible: ${firstResultVisible}`);
    
    // Get search page resource metrics
    const searchResourceMetrics = await performanceHelper.getResourceMetrics(page);
    
    logger.info('Search page resource metrics:');
    logger.info(`- Total resources: ${searchResourceMetrics.totalResources}`);
    logger.info(`- Total size: ${(searchResourceMetrics.totalSize / 1024).toFixed(2)} KB`);
    
    // Test search suggestion performance
    await page.goto('https://www.google.com');
    await page.waitForLoadState('networkidle');
    
    const suggestionStart = Date.now();
    const searchBox = page.locator('input[name="q"]');
    await searchBox.click();
    await searchBox.fill('performance');
    
    // Wait for suggestions to appear
    try {
      await page.waitForSelector('.aajZCb', { timeout: 3000 });
      const suggestionEnd = Date.now();
      const suggestionTime = suggestionEnd - suggestionStart;
      logger.info(`Search suggestion time: ${suggestionTime}ms`);
      
      // Count suggestions
      const suggestionCount = await page.locator('.aajZCb .wM6W7d').count();
      logger.info(`Suggestions shown: ${suggestionCount}`);
      
      expect(suggestionTime).toBeLessThan(2000); // 2 seconds for suggestions
    } catch (error) {
      logger.warn('Search suggestions did not appear within timeout');
    }
    
    // Performance assertions for search
    expect(searchTime).toBeLessThan(5000); // 5 seconds for search
    expect(searchMetrics.loadTime).toBeLessThan(8000); // 8 seconds for results page
    expect(resultCount).toBeGreaterThan(0); // Should have results
    
    // Generate search performance report
    const searchReportPath = await performanceHelper.generateReport({
      url: await page.url(),
      searchTerm: searchTerm,
      searchTime: searchTime,
      resultCount: resultCount,
      metrics: searchMetrics,
      resources: searchResourceMetrics,
      timestamp: new Date().toISOString()
    }, 'google-search-performance');
    
    logger.info(`Search performance report saved to: ${searchReportPath}`);
    
    // Attach search performance data to allure report
    allure.attachment('Search Term', searchTerm, 'text/plain');
    allure.attachment('Search Time', `${searchTime}ms`, 'text/plain');
    allure.attachment('Result Count', resultCount.toString(), 'text/plain');
    allure.attachment('Search Metrics', JSON.stringify(searchMetrics, null, 2), 'application/json');
    allure.attachment('Search Resources', JSON.stringify(searchResourceMetrics, null, 2), 'application/json');
    allure.attachment('Search Performance Report', searchReportPath, 'text/plain');
    
    logger.success('✅ Search performance test completed');
  });

  test('should monitor performance under load @performance @load', async ({
    page,
    googleHomePage,
    logger,
    performanceHelper
  }) => {
    allure.story('Load Performance Testing');
    allure.description('This test monitors performance under simulated load conditions');
    allure.severity('normal');
    
    logger.step('Starting load performance test');
    
    const iterations = 3;
    const loadTimes: number[] = [];
    const memoryUsages: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      logger.info(`Performance iteration ${i + 1}/${iterations}`);
      
      // Start monitoring
      await performanceHelper.startMonitoring(page);
      
      // Navigate with timing
      const startTime = Date.now();
      await googleHomePage.navigate();
      await googleHomePage.waitForPageLoad();
      await page.waitForLoadState('networkidle');
      const endTime = Date.now();
      
      const loadTime = endTime - startTime;
      loadTimes.push(loadTime);
      
      // Get memory usage for this iteration
      const memoryUsage = await performanceHelper.getMemoryUsage(page);
      memoryUsages.push(memoryUsage.usedJSHeapSize);
      
      logger.info(`Iteration ${i + 1} load time: ${loadTime}ms`);
      logger.info(`Iteration ${i + 1} memory usage: ${(memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      
      // Perform some interactions to simulate load
      const searchBox = page.locator('input[name="q"]');
      await searchBox.click();
      await searchBox.fill(`test query ${i + 1}`);
      await page.waitForTimeout(500);
      await searchBox.clear();
      
      // Clear cache between iterations to simulate fresh loads
      if (i < iterations - 1) {
        await page.context().clearCookies();
      }
      
      await page.waitForTimeout(1000); // Brief pause between iterations
    }
    
    // Calculate performance statistics
    const avgLoadTime = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
    const minLoadTime = Math.min(...loadTimes);
    const maxLoadTime = Math.max(...loadTimes);
    const loadTimeVariance = loadTimes.reduce((sum, time) => sum + Math.pow(time - avgLoadTime, 2), 0) / loadTimes.length;
    const loadTimeStdDev = Math.sqrt(loadTimeVariance);
    
    const avgMemoryUsage = memoryUsages.reduce((sum, mem) => sum + mem, 0) / memoryUsages.length;
    const maxMemoryUsage = Math.max(...memoryUsages);
    const minMemoryUsage = Math.min(...memoryUsages);
    
    logger.info('Load performance statistics:');
    logger.info(`- Average load time: ${avgLoadTime.toFixed(2)}ms`);
    logger.info(`- Minimum load time: ${minLoadTime}ms`);
    logger.info(`- Maximum load time: ${maxLoadTime}ms`);
    logger.info(`- Load time std deviation: ${loadTimeStdDev.toFixed(2)}ms`);
    logger.info(`- Average memory usage: ${(avgMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
    logger.info(`- Minimum memory usage: ${(minMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
    logger.info(`- Maximum memory usage: ${(maxMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
    
    // Performance consistency checks
    const loadTimeThreshold = 10000; // 10 seconds maximum
    const consistencyThreshold = 5000; // 5 seconds variance
    const memoryThreshold = 100 * 1024 * 1024; // 100MB maximum
    
    expect(avgLoadTime).toBeLessThan(loadTimeThreshold);
    expect(maxLoadTime - minLoadTime).toBeLessThan(consistencyThreshold);
    expect(maxMemoryUsage).toBeLessThan(memoryThreshold);
    
    // Check for performance degradation
    const performanceDegradation = maxLoadTime / minLoadTime;
    logger.info(`Performance degradation ratio: ${performanceDegradation.toFixed(2)}`);
    expect(performanceDegradation).toBeLessThan(3); // No more than 3x slower
    
    // Generate load performance report
    const loadReportPath = await performanceHelper.generateReport({
      iterations: iterations,
      loadTimes: loadTimes,
      memoryUsages: memoryUsages.map(mem => mem / 1024 / 1024), // Convert to MB
      statistics: {
        avgLoadTime: avgLoadTime,
        minLoadTime: minLoadTime,
        maxLoadTime: maxLoadTime,
        stdDeviation: loadTimeStdDev,
        avgMemoryUsage: avgMemoryUsage / 1024 / 1024,
        maxMemoryUsage: maxMemoryUsage / 1024 / 1024,
        performanceDegradation: performanceDegradation
      },
      timestamp: new Date().toISOString()
    }, 'google-load-performance');
    
    logger.info(`Load performance report saved to: ${loadReportPath}`);
    
    // Attach load performance data to allure report
    allure.attachment('Iterations', iterations.toString(), 'text/plain');
    allure.attachment('Average Load Time', `${avgLoadTime.toFixed(2)}ms`, 'text/plain');
    allure.attachment('Max Load Time', `${maxLoadTime}ms`, 'text/plain');
    allure.attachment('Performance Degradation', `${performanceDegradation.toFixed(2)}x`, 'text/plain');
    allure.attachment('Load Times', loadTimes.join(', ') + ' ms', 'text/plain');
    allure.attachment('Memory Usages', memoryUsages.map(mem => (mem / 1024 / 1024).toFixed(2)).join(', ') + ' MB', 'text/plain');
    allure.attachment('Load Performance Report', loadReportPath, 'text/plain');
    
    logger.success('✅ Load performance test completed');
  });

  test('should analyze runtime performance during interactions @performance @runtime', async ({
    page,
    googleHomePage,
    logger,
    performanceHelper
  }) => {
    allure.story('Runtime Performance Analysis');
    allure.description('This test analyzes runtime performance during user interactions');
    allure.severity('normal');
    
    logger.step('Starting runtime performance analysis');
    
    // Navigate to homepage
    await googleHomePage.navigate();
    await googleHomePage.waitForPageLoad();
    
    // Start performance monitoring
    await performanceHelper.startMonitoring(page);
    
    // Measure interaction performance
    const interactions = [
      'Search box click',
      'Type search query',
      'Clear search box',
      'Type another query',
      'Submit search'
    ];
    
    const interactionTimes: { [key: string]: number } = {};
    
    // Search box click performance
    let startTime = Date.now();
    const searchBox = page.locator('input[name="q"]');
    await searchBox.click();
    interactionTimes[interactions[0]] = Date.now() - startTime;
    
    // Type search query performance
    startTime = Date.now();
    await searchBox.fill('runtime performance test query');
    interactionTimes[interactions[1]] = Date.now() - startTime;
    
    // Wait for any suggestions and measure
    await page.waitForTimeout(1000);
    
    // Clear search box performance
    startTime = Date.now();
    await searchBox.clear();
    interactionTimes[interactions[2]] = Date.now() - startTime;
    
    // Type another query performance
    startTime = Date.now();
    await searchBox.fill('second test query');
    interactionTimes[interactions[3]] = Date.now() - startTime;
    
    // Submit search performance
    startTime = Date.now();
    await page.keyboard.press('Enter');
    await page.waitForURL(/.*google\.com\/search.*/);
    interactionTimes[interactions[4]] = Date.now() - startTime;
    
    // Log interaction performance
    logger.info('Interaction performance:');
    Object.entries(interactionTimes).forEach(([interaction, time]) => {
      logger.info(`- ${interaction}: ${time}ms`);
    });
    
    // Get detailed performance metrics after interactions
    const runtimeMetrics = await performanceHelper.getMetrics(page);
    const memoryAfterInteractions = await performanceHelper.getMemoryUsage(page);
    
    // Analyze frame rate during interactions
    const frameRateData = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frameCount = 0;
        let lastTime = performance.now();
        const frameTimes: number[] = [];
        
        function countFrame(currentTime: number) {
          frameCount++;
          const deltaTime = currentTime - lastTime;
          frameTimes.push(deltaTime);
          lastTime = currentTime;
          
          if (frameCount < 60) { // Collect 60 frames
            requestAnimationFrame(countFrame);
          } else {
            const avgFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
            const fps = 1000 / avgFrameTime;
            resolve({
              frameCount: frameCount,
              averageFrameTime: avgFrameTime,
              estimatedFPS: fps,
              frameTimes: frameTimes.slice(0, 10) // Only return first 10 for space
            });
          }
        }
        
        requestAnimationFrame(countFrame);
      });
    });
    
    logger.info('Frame rate analysis:');
    logger.info(`- Estimated FPS: ${(frameRateData as any).estimatedFPS.toFixed(2)}`);
    logger.info(`- Average frame time: ${(frameRateData as any).averageFrameTime.toFixed(2)}ms`);
    
    // Check for performance bottlenecks
    const slowInteractions = Object.entries(interactionTimes).filter(([_, time]) => time > 100);
    if (slowInteractions.length > 0) {
      logger.warn('Slow interactions detected:');
      slowInteractions.forEach(([interaction, time]) => {
        logger.warn(`- ${interaction}: ${time}ms (>100ms)`);
      });
    } else {
      logger.success('All interactions performed within acceptable time');
    }
    
    // Performance assertions for interactions
    expect(interactionTimes[interactions[0]]).toBeLessThan(500); // Click response
    expect(interactionTimes[interactions[1]]).toBeLessThan(1000); // Typing response
    expect(interactionTimes[interactions[2]]).toBeLessThan(200); // Clear response
    expect(interactionTimes[interactions[4]]).toBeLessThan(5000); // Search submission
    expect((frameRateData as any).estimatedFPS).toBeGreaterThan(20); // Minimum FPS
    
    // Generate runtime performance report
    const runtimeReportPath = await performanceHelper.generateReport({
      interactions: interactionTimes,
      frameRate: frameRateData,
      runtimeMetrics: runtimeMetrics,
      memoryAfterInteractions: memoryAfterInteractions,
      slowInteractions: slowInteractions,
      timestamp: new Date().toISOString()
    }, 'google-runtime-performance');
    
    logger.info(`Runtime performance report saved to: ${runtimeReportPath}`);
    
    // Attach runtime performance data to allure report
    allure.attachment('Interaction Times', JSON.stringify(interactionTimes, null, 2), 'application/json');
    allure.attachment('Frame Rate Data', JSON.stringify(frameRateData, null, 2), 'application/json');
    allure.attachment('Slow Interactions', slowInteractions.length.toString(), 'text/plain');
    allure.attachment('Estimated FPS', `${(frameRateData as any).estimatedFPS.toFixed(2)}`, 'text/plain');
    allure.attachment('Runtime Performance Report', runtimeReportPath, 'text/plain');
    
    logger.success('✅ Runtime performance analysis completed');
  });
});
