import { test, expect } from '../../src/fixtures/page-fixtures';
import { allure } from 'allure-playwright';

test.describe('Google Home Page - Image Validation Tests', () => {
  test.beforeEach(async ({ googleHomePage }) => {
    allure.feature('Image Validation');
    allure.story('Image Count and Quality');
    await googleHomePage.goto();
  });

  test('should verify the number of images on screen exceeds threshold @smoke @images', async ({
    googleHomePage,
    page,
    logger,
    screenshotHelper
  }) => {
    allure.description('This test validates that the page contains a minimum number of images');
    allure.severity('normal');
    
    logger.step('Starting image count validation test');
    
    const expectedMinimumImages = 3; // Threshold for minimum images
    
    // Take initial screenshot
    await screenshotHelper.takeFullPageScreenshot('google-home-images-initial');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Get all images on the page
    const images = await googleHomePage.getAllImages();
    logger.info(`Found ${images.length} images on the page`);
    
    // Log image details
    for (let i = 0; i < Math.min(images.length, 10); i++) {
      const image = images[i];
      logger.info(`Image ${i + 1}: src="${image.src}", alt="${image.alt}"`);
    }
    
    // Attach image details to allure report
    const imageDetails = images.map((img, index) => 
      `${index + 1}. Source: ${img.src}\\n   Alt Text: "${img.alt}"`
    ).join('\\n');
    
    allure.attachment('Image Details', imageDetails, 'text/plain');
    allure.attachment('Image Count', `Found ${images.length} images`, 'text/plain');
    
    // Check for Google logo specifically
    const googleLogo = await googleHomePage.isGoogleLogoVisible();
    expect(googleLogo).toBeTruthy();
    logger.success('✓ Google logo is visible');
    
    // Additional image quality checks
    const validImages: string[] = [];
    const invalidImages: string[] = [];
    
    for (const image of images.slice(0, 10)) { // Check first 10 images
      // Check if image has valid src
      if (image.src && image.src !== '' && !image.src.includes('data:image/gif;base64,R0lGOD')) {
        validImages.push(image.src);
        
        // Check if image loads successfully
        try {
          const response = await page.goto(image.src, { timeout: 5000 });
          if (response && response.status() >= 400) {
            invalidImages.push(`${image.src} (Status: ${response.status()})`);
          }
        } catch (error) {
          // Some images might be relative URLs or have CORS issues, so we'll be lenient
          logger.warn(`Could not verify image: ${image.src} - ${error}`);
        }
      } else {
        invalidImages.push(`${image.src || 'No src'} (Invalid source)`);
      }
    }
    
    // Return to the main page
    await googleHomePage.goto();
    await page.waitForLoadState('networkidle');
    
    // Log validation results
    logger.info(`Image validation results:`);
    logger.info(`- Valid images: ${validImages.length}`);
    logger.info(`- Invalid images: ${invalidImages.length}`);
    
    if (validImages.length > 0) {
      allure.attachment('Valid Images', validImages.join('\\n'), 'text/plain');
    }
    if (invalidImages.length > 0) {
      allure.attachment('Invalid Images', invalidImages.join('\\n'), 'text/plain');
    }
    
    // Take final screenshot
    await screenshotHelper.takeFullPageScreenshot('google-home-images-final');
    
    // Main assertion: verify minimum number of images
    expect(images.length).toBeGreaterThanOrEqual(expectedMinimumImages);
    
    // Additional assertion: majority of images should be valid
    const validImageRatio = validImages.length / Math.min(images.length, 10);
    expect(validImageRatio).toBeGreaterThan(0.5); // At least 50% should be valid
    
    logger.success(`✅ Image validation passed - Found ${images.length} images (minimum required: ${expectedMinimumImages})`);
  });

  test('should validate image accessibility attributes @accessibility @images', async ({
    googleHomePage,
    page,
    logger
  }) => {
    allure.description('This test validates that images have proper accessibility attributes');
    allure.severity('normal');
    
    logger.step('Validating image accessibility attributes');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Get all images with their attributes
    const imageAccessibilityData = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.map((img, index) => ({
        index: index + 1,
        src: img.src || '',
        alt: img.alt || '',
        title: img.title || '',
        hasAlt: img.hasAttribute('alt'),
        hasAriaLabel: img.hasAttribute('aria-label'),
        hasAriaDescribedBy: img.hasAttribute('aria-describedby'),
        isDecorative: img.alt === '' && img.hasAttribute('alt'), // Empty alt means decorative
        isVisible: img.offsetWidth > 0 && img.offsetHeight > 0
      }));
    });
    
    logger.info(`Analyzing accessibility for ${imageAccessibilityData.length} images`);
    
    const accessibilityIssues: string[] = [];
    const accessibilityPasses: string[] = [];
    
    imageAccessibilityData.forEach((imgData) => {
      const imageId = `Image ${imgData.index} (${imgData.src.substring(0, 50)}...)`;
      
      if (imgData.isVisible) {
        // Check if image has alt text or aria-label
        if (!imgData.hasAlt && !imgData.hasAriaLabel) {
          accessibilityIssues.push(`${imageId}: Missing alt attribute and aria-label`);
        } else if (imgData.hasAlt && imgData.alt.trim() === '' && !imgData.isDecorative) {
          accessibilityIssues.push(`${imageId}: Empty alt text for non-decorative image`);
        } else if (imgData.alt.length > 125) {
          accessibilityIssues.push(`${imageId}: Alt text too long (${imgData.alt.length} characters)`);
        } else {
          accessibilityPasses.push(`${imageId}: Proper accessibility attributes`);
        }
        
        // Check for extremely long alt text
        if (imgData.alt.length > 200) {
          accessibilityIssues.push(`${imageId}: Alt text excessively long (${imgData.alt.length} characters)`);
        }
      }
    });
    
    // Log results
    logger.info(`Image accessibility analysis:`);
    logger.info(`- Images with proper accessibility: ${accessibilityPasses.length}`);
    logger.info(`- Images with accessibility issues: ${accessibilityIssues.length}`);
    
    // Attach results to allure report
    if (accessibilityPasses.length > 0) {
      allure.attachment('Images with Proper Accessibility', accessibilityPasses.join('\\n'), 'text/plain');
    }
    if (accessibilityIssues.length > 0) {
      allure.attachment('Images with Accessibility Issues', accessibilityIssues.join('\\n'), 'text/plain');
    }
    
    // Detailed accessibility report
    const accessibilityReport = imageAccessibilityData.map(img => 
      `Image ${img.index}:\\n` +
      `  Source: ${img.src}\\n` +
      `  Alt Text: "${img.alt}"\\n` +
      `  Has Alt: ${img.hasAlt}\\n` +
      `  Is Decorative: ${img.isDecorative}\\n` +
      `  Is Visible: ${img.isVisible}\\n`
    ).join('\\n');
    
    allure.attachment('Detailed Accessibility Report', accessibilityReport, 'text/plain');
    
    // Calculate accessibility score
    const totalVisibleImages = imageAccessibilityData.filter(img => img.isVisible).length;
    const accessibilityScore = totalVisibleImages > 0 
      ? (accessibilityPasses.length / totalVisibleImages) * 100 
      : 100;
    
    logger.info(`Image accessibility score: ${accessibilityScore.toFixed(1)}%`);
    allure.attachment('Accessibility Score', `${accessibilityScore.toFixed(1)}%`, 'text/plain');
    
    // Assert that at least 80% of images have proper accessibility
    expect(accessibilityScore).toBeGreaterThanOrEqual(80);
    
    logger.success('✅ Image accessibility validation passed');
  });

  test('should validate image loading performance @performance @images', async ({
    googleHomePage,
    page,
    logger,
    performanceHelper
  }) => {
    allure.description('This test validates that images load within acceptable time limits');
    allure.severity('normal');
    
    logger.step('Validating image loading performance');
    
    // Start performance monitoring
    performanceHelper?.startMeasurement();
    
    // Navigate to page and wait for images to load
    await googleHomePage.goto();
    
    // Wait for all images to load
    await page.waitForFunction(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.every(img => img.complete && img.naturalHeight !== 0);
    }, { timeout: 15000 });
    
    // Stop performance monitoring
    const loadTime = performanceHelper?.stopMeasurement() || 0;
    
    // Get image loading metrics
    const imageMetrics = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      const metrics = {
        totalImages: images.length,
        loadedImages: 0,
        failedImages: 0,
        avgLoadTime: 0,
        imageDetails: [] as Array<{
          src: string;
          loaded: boolean;
          naturalWidth: number;
          naturalHeight: number;
          fileSize: number;
        }>
      };
      
      images.forEach(img => {
        const loaded = img.complete && img.naturalHeight !== 0;
        if (loaded) {
          metrics.loadedImages++;
        } else {
          metrics.failedImages++;
        }
        
        metrics.imageDetails.push({
          src: img.src,
          loaded,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          fileSize: 0 // Would need additional logic to get actual file size
        });
      });
      
      return metrics;
    });
    
    // Get resource timing for images
    const imageResourceTiming = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource');
      return entries
        .filter(entry => entry.initiatorType === 'img')
        .map(entry => ({
          name: entry.name,
          duration: entry.duration,
          size: (entry as any).transferSize || 0
        }));
    });
    
    // Calculate metrics
    const successRate = imageMetrics.totalImages > 0 
      ? (imageMetrics.loadedImages / imageMetrics.totalImages) * 100 
      : 100;
    
    const avgImageLoadTime = imageResourceTiming.length > 0
      ? imageResourceTiming.reduce((sum, img) => sum + img.duration, 0) / imageResourceTiming.length
      : 0;
    
    // Log results
    logger.info(`Image loading performance metrics:`);
    logger.info(`- Total images: ${imageMetrics.totalImages}`);
    logger.info(`- Successfully loaded: ${imageMetrics.loadedImages}`);
    logger.info(`- Failed to load: ${imageMetrics.failedImages}`);
    logger.info(`- Success rate: ${successRate.toFixed(1)}%`);
    logger.info(`- Total page load time: ${loadTime}ms`);
    logger.info(`- Average image load time: ${avgImageLoadTime.toFixed(1)}ms`);
    
    // Attach performance data to allure report
    allure.attachment('Image Performance Metrics', JSON.stringify({
      totalImages: imageMetrics.totalImages,
      loadedImages: imageMetrics.loadedImages,
      failedImages: imageMetrics.failedImages,
      successRate: `${successRate.toFixed(1)}%`,
      totalLoadTime: `${loadTime}ms`,
      avgImageLoadTime: `${avgImageLoadTime.toFixed(1)}ms`
    }, null, 2), 'application/json');
    
    if (imageResourceTiming.length > 0) {
      allure.attachment('Image Resource Timing', JSON.stringify(imageResourceTiming, null, 2), 'application/json');
    }
    
    // Performance assertions
    expect(successRate).toBeGreaterThanOrEqual(90); // 90% of images should load successfully
    expect(loadTime).toBeLessThan(10000); // Total load time should be under 10 seconds
    if (avgImageLoadTime > 0) {
      expect(avgImageLoadTime).toBeLessThan(3000); // Average image load time should be under 3 seconds
    }
    
    logger.success('✅ Image loading performance validation passed');
  });
});
