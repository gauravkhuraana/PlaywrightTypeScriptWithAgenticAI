import type { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import { Logger } from './src/utils/logger';

const logger = new Logger('GlobalTeardown');

async function globalTeardown(_config: FullConfig): Promise<void> {
  logger.info('Starting global teardown...');

  try {
    // Perform any global cleanup
    // Example: Clean up test data, close connections, etc.

    // Ensure archive directory exists so external tooling can copy results in.
    if (fs.existsSync('test-results') && !fs.existsSync('archived-results')) {
      fs.mkdirSync('archived-results', { recursive: true });
    }

    logger.info('Global teardown completed successfully');
  } catch (error) {
    logger.error('Global teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

export default globalTeardown;
