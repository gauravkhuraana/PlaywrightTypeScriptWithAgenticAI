import { FullConfig } from '@playwright/test';
import { Logger } from './src/utils/logger';

const logger = new Logger('GlobalTeardown');

async function globalTeardown(config: FullConfig) {
  logger.info('Starting global teardown...');
  
  try {
    // Perform any global cleanup
    // Example: Clean up test data, close connections, etc.
    
    // Archive test results if needed
    const fs = require('fs');
    const path = require('path');
    
    if (fs.existsSync('test-results')) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const archiveDir = path.join('archived-results', timestamp);
      
      if (!fs.existsSync('archived-results')) {
        fs.mkdirSync('archived-results', { recursive: true });
      }
      
      // Copy results to archive (optional)
      // fs.cpSync('test-results', archiveDir, { recursive: true });
    }
    
    logger.info('Global teardown completed successfully');
  } catch (error) {
    logger.error('Global teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

export default globalTeardown;
