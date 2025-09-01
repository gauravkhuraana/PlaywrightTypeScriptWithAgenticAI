import { chromium, FullConfig } from '@playwright/test';
import { Logger } from './src/utils/logger';

const logger = new Logger('GlobalSetup');

async function globalSetup(config: FullConfig) {
  logger.info('Starting global setup...');
  
  try {
    // Launch browser for authentication if needed
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Perform any global authentication or setup
    // Example: Login and save authentication state
    // await page.goto('https://example.com/login');
    // await page.fill('[data-testid="username"]', process.env.TEST_USERNAME!);
    // await page.fill('[data-testid="password"]', process.env.TEST_PASSWORD!);
    // await page.click('[data-testid="submit"]');
    // await page.context().storageState({ path: 'auth.json' });
    
    // Create test data directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync('test-results')) {
      fs.mkdirSync('test-results', { recursive: true });
    }
    
    await context.close();
    await browser.close();
    
    logger.info('Global setup completed successfully');
  } catch (error) {
    logger.error('Global setup failed:', error);
    throw error;
  }
}

export default globalSetup;
