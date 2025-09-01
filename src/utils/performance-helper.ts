import { Page } from '@playwright/test';
import { Logger } from './logger';
import { PerformanceMetrics } from '../types/test-data';

/**
 * Performance Helper for measuring and analyzing web performance
 */
export class PerformanceHelper {
  private readonly page: Page;
  private readonly logger: Logger;
  private startTime: number = 0;

  constructor(page: Page) {
    this.page = page;
    this.logger = new Logger('PerformanceHelper');
  }

  /**
   * Start performance measurement
   */
  startMeasurement(): void {
    this.startTime = Date.now();
    this.logger.info('Performance measurement started');
  }

  /**
   * Stop performance measurement
   */
  stopMeasurement(): number {
    const duration = Date.now() - this.startTime;
    this.logger.info(`Performance measurement stopped: ${duration}ms`);
    return duration;
  }

  /**
   * Get Core Web Vitals metrics
   */
  async getCoreWebVitals(): Promise<PerformanceMetrics> {
    this.logger.info('Collecting Core Web Vitals');
    
    const metrics = await this.page.evaluate(() => {
      return new Promise<PerformanceMetrics>((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics: Partial<PerformanceMetrics> = {};
          
          entries.forEach((entry) => {
            switch (entry.name) {
              case 'first-contentful-paint':
                metrics.firstContentfulPaint = entry.startTime;
                break;
              case 'largest-contentful-paint':
                metrics.largestContentfulPaint = entry.startTime;
                break;
              case 'first-input-delay':
                metrics.firstInputDelay = entry.processingStart - entry.startTime;
                break;
              case 'cumulative-layout-shift':
                metrics.cumulativeLayoutShift = entry.value;
                break;
            }
          });
          
          // Get navigation timing
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
            metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
          }
          
          resolve(metrics as PerformanceMetrics);
        });
        
        observer.observe({ type: 'paint', buffered: true });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        observer.observe({ type: 'first-input', buffered: true });
        observer.observe({ type: 'layout-shift', buffered: true });
        
        // Fallback timeout
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          resolve({
            loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
            domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            cumulativeLayoutShift: 0,
            firstInputDelay: 0
          });
        }, 5000);
      });
    });

    this.logger.info('Core Web Vitals collected:', metrics);
    return metrics;
  }

  /**
   * Get page load performance
   */
  async getPageLoadMetrics(): Promise<{
    loadTime: number;
    domContentLoaded: number;
    firstPaint: number;
    firstContentfulPaint: number;
  }> {
    this.logger.info('Collecting page load metrics');
    
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      let firstPaint = 0;
      let firstContentfulPaint = 0;
      
      paint.forEach((entry) => {
        if (entry.name === 'first-paint') {
          firstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          firstContentfulPaint = entry.startTime;
        }
      });
      
      return {
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstPaint,
        firstContentfulPaint
      };
    });

    this.logger.info('Page load metrics collected:', metrics);
    return metrics;
  }

  /**
   * Get resource timing information
   */
  async getResourceTiming(): Promise<Array<{
    name: string;
    duration: number;
    size: number;
    type: string;
  }>> {
    this.logger.info('Collecting resource timing');
    
    const resources = await this.page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      return entries.map((entry) => ({
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize || 0,
        type: entry.initiatorType
      }));
    });

    this.logger.info(`Resource timing collected: ${resources.length} resources`);
    return resources;
  }

  /**
   * Measure network performance
   */
  async measureNetworkPerformance(): Promise<{
    totalRequests: number;
    totalSize: number;
    averageResponseTime: number;
    slowestRequest: { url: string; duration: number };
  }> {
    this.logger.info('Measuring network performance');
    
    const resources = await this.getResourceTiming();
    
    const totalRequests = resources.length;
    const totalSize = resources.reduce((sum, resource) => sum + resource.size, 0);
    const averageResponseTime = resources.length > 0 
      ? resources.reduce((sum, resource) => sum + resource.duration, 0) / resources.length 
      : 0;
    
    const slowestRequest = resources.reduce(
      (slowest, resource) => 
        resource.duration > slowest.duration 
          ? { url: resource.name, duration: resource.duration }
          : slowest,
      { url: '', duration: 0 }
    );

    const networkMetrics = {
      totalRequests,
      totalSize,
      averageResponseTime,
      slowestRequest
    };

    this.logger.info('Network performance measured:', networkMetrics);
    return networkMetrics;
  }

  /**
   * Measure JavaScript execution time
   */
  async measureJavaScriptExecution(): Promise<{
    totalScriptTime: number;
    scriptCount: number;
    averageScriptTime: number;
  }> {
    this.logger.info('Measuring JavaScript execution time');
    
    const jsMetrics = await this.page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const scripts = entries.filter(entry => entry.initiatorType === 'script');
      
      const totalScriptTime = scripts.reduce((sum, script) => sum + script.duration, 0);
      const scriptCount = scripts.length;
      const averageScriptTime = scriptCount > 0 ? totalScriptTime / scriptCount : 0;
      
      return {
        totalScriptTime,
        scriptCount,
        averageScriptTime
      };
    });

    this.logger.info('JavaScript execution measured:', jsMetrics);
    return jsMetrics;
  }

  /**
   * Measure CSS performance
   */
  async measureCSSPerformance(): Promise<{
    totalCSSTime: number;
    cssCount: number;
    averageCSSTime: number;
  }> {
    this.logger.info('Measuring CSS performance');
    
    const cssMetrics = await this.page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const stylesheets = entries.filter(entry => 
        entry.initiatorType === 'link' || entry.name.includes('.css')
      );
      
      const totalCSSTime = stylesheets.reduce((sum, css) => sum + css.duration, 0);
      const cssCount = stylesheets.length;
      const averageCSSTime = cssCount > 0 ? totalCSSTime / cssCount : 0;
      
      return {
        totalCSSTime,
        cssCount,
        averageCSSTime
      };
    });

    this.logger.info('CSS performance measured:', cssMetrics);
    return cssMetrics;
  }

  /**
   * Get memory usage
   */
  async getMemoryUsage(): Promise<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  }> {
    this.logger.info('Collecting memory usage');
    
    const memoryInfo = await this.page.evaluate(() => {
      const memory = (performance as any).memory;
      if (memory) {
        return {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        };
      }
      return {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0
      };
    });

    this.logger.info('Memory usage collected:', memoryInfo);
    return memoryInfo;
  }

  /**
   * Validate performance thresholds
   */
  validatePerformanceThresholds(
    metrics: PerformanceMetrics,
    thresholds: {
      loadTime?: number;
      firstContentfulPaint?: number;
      largestContentfulPaint?: number;
      cumulativeLayoutShift?: number;
      firstInputDelay?: number;
    }
  ): { passed: boolean; failures: string[] } {
    this.logger.info('Validating performance thresholds');
    
    const failures: string[] = [];
    
    if (thresholds.loadTime && metrics.loadTime > thresholds.loadTime) {
      failures.push(`Load time ${metrics.loadTime}ms exceeds threshold ${thresholds.loadTime}ms`);
    }
    
    if (thresholds.firstContentfulPaint && metrics.firstContentfulPaint > thresholds.firstContentfulPaint) {
      failures.push(`FCP ${metrics.firstContentfulPaint}ms exceeds threshold ${thresholds.firstContentfulPaint}ms`);
    }
    
    if (thresholds.largestContentfulPaint && metrics.largestContentfulPaint > thresholds.largestContentfulPaint) {
      failures.push(`LCP ${metrics.largestContentfulPaint}ms exceeds threshold ${thresholds.largestContentfulPaint}ms`);
    }
    
    if (thresholds.cumulativeLayoutShift && metrics.cumulativeLayoutShift > thresholds.cumulativeLayoutShift) {
      failures.push(`CLS ${metrics.cumulativeLayoutShift} exceeds threshold ${thresholds.cumulativeLayoutShift}`);
    }
    
    if (thresholds.firstInputDelay && metrics.firstInputDelay > thresholds.firstInputDelay) {
      failures.push(`FID ${metrics.firstInputDelay}ms exceeds threshold ${thresholds.firstInputDelay}ms`);
    }
    
    const passed = failures.length === 0;
    
    if (passed) {
      this.logger.success('All performance thresholds passed');
    } else {
      this.logger.error('Performance threshold failures:', failures);
    }
    
    return { passed, failures };
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport(): Promise<{
    coreWebVitals: PerformanceMetrics;
    pageLoad: any;
    network: any;
    javascript: any;
    css: any;
    memory: any;
    timestamp: string;
  }> {
    this.logger.info('Generating comprehensive performance report');
    
    const [coreWebVitals, pageLoad, network, javascript, css, memory] = await Promise.all([
      this.getCoreWebVitals(),
      this.getPageLoadMetrics(),
      this.measureNetworkPerformance(),
      this.measureJavaScriptExecution(),
      this.measureCSSPerformance(),
      this.getMemoryUsage()
    ]);
    
    const report = {
      coreWebVitals,
      pageLoad,
      network,
      javascript,
      css,
      memory,
      timestamp: new Date().toISOString()
    };
    
    this.logger.success('Performance report generated');
    return report;
  }

  /**
   * Monitor performance during action
   */
  async monitorPerformanceDuringAction<T>(
    action: () => Promise<T>,
    actionName: string
  ): Promise<{ result: T; performanceData: any }> {
    this.logger.info(`Monitoring performance during: ${actionName}`);
    
    const startTime = Date.now();
    const beforeMemory = await this.getMemoryUsage();
    
    const result = await action();
    
    const endTime = Date.now();
    const afterMemory = await this.getMemoryUsage();
    const duration = endTime - startTime;
    
    const performanceData = {
      actionName,
      duration,
      memoryBefore: beforeMemory,
      memoryAfter: afterMemory,
      memoryDelta: {
        usedJSHeapSize: afterMemory.usedJSHeapSize - beforeMemory.usedJSHeapSize,
        totalJSHeapSize: afterMemory.totalJSHeapSize - beforeMemory.totalJSHeapSize
      }
    };
    
    this.logger.info(`Performance monitoring completed for ${actionName}:`, performanceData);
    
    return { result, performanceData };
  }
}
