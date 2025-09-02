import { PlaywrightTestOptions } from '@playwright/test';

export interface TestOptions extends PlaywrightTestOptions {
  /**
   * Test environment (dev, staging, prod)
   */
  environment: string;
  
  /**
   * API base URL for API tests
   */
  apiBaseURL: string;
  
  /**
   * Enable visual testing
   */
  enableVisualTesting?: boolean;
  
  /**
   * Enable accessibility testing
   */
  enableAccessibilityTesting?: boolean;
  
  /**
   * Enable performance testing
   */
  enablePerformanceTesting?: boolean;
  
  /**
   * Test data configuration
   */
  testDataConfig?: {
    source: 'json' | 'yaml' | 'api';
    path?: string;
    endpoint?: string;
  };
  
  /**
   * Browser configuration
   */
  browserConfig?: {
    slowMo?: number;
    devtools?: boolean;
    recordVideo?: boolean;
    recordHar?: boolean;
  };
  
  /**
   * Mobile testing configuration
   */
  mobileConfig?: {
    deviceName: string;
    orientation: 'portrait' | 'landscape';
  };
  
  /**
   * API testing configuration
   */
  apiConfig?: {
    timeout: number;
    retries: number;
    headers?: Record<string, string>;
  };
  
  /**
   * Database configuration
   */
  dbConfig?: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  };
}
