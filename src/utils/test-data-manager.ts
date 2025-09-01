import { TestData } from '../types/test-data';
import { Logger } from './logger';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

/**
 * Test Data Manager for loading and managing test data
 */
export class TestDataManager {
  private readonly environment: string;
  private readonly logger: Logger;
  private testData: TestData | null = null;

  constructor(environment: string) {
    this.environment = environment;
    this.logger = new Logger('TestDataManager');
  }

  /**
   * Initialize the test data manager
   */
  async initialize(): Promise<void> {
    this.logger.info(`Initializing test data for environment: ${this.environment}`);
    await this.loadTestData();
  }

  /**
   * Load test data from files
   */
  private async loadTestData(): Promise<void> {
    try {
      const dataDir = path.join(process.cwd(), 'src', 'data');
      const envDataFile = path.join(dataDir, `${this.environment}.json`);
      const defaultDataFile = path.join(dataDir, 'default.json');
      
      let dataFile = defaultDataFile;
      if (fs.existsSync(envDataFile)) {
        dataFile = envDataFile;
      }

      if (fs.existsSync(dataFile)) {
        const fileContent = fs.readFileSync(dataFile, 'utf-8');
        this.testData = JSON.parse(fileContent);
        this.logger.info(`Test data loaded from: ${dataFile}`);
      } else {
        this.logger.warn(`Test data file not found: ${dataFile}. Using default data.`);
        this.testData = this.getDefaultTestData();
      }
    } catch (error) {
      this.logger.error('Failed to load test data:', error);
      this.testData = this.getDefaultTestData();
    }
  }

  /**
   * Get default test data
   */
  private getDefaultTestData(): TestData {
    return {
      users: [
        {
          id: 'user1',
          username: 'testuser1',
          email: 'testuser1@example.com',
          password: 'password123',
          role: 'user',
          profile: {
            firstName: 'Test',
            lastName: 'User',
            dateOfBirth: '1990-01-01',
            address: {
              street: '123 Test St',
              city: 'Test City',
              state: 'Test State',
              country: 'Test Country',
              zipCode: '12345'
            },
            preferences: {
              language: 'en',
              theme: 'light',
              notifications: true,
              newsletter: false
            }
          }
        }
      ],
      searchQueries: [
        {
          id: 'valid-search-1',
          query: 'playwright testing',
          expectedResults: 10,
          category: 'valid',
          description: 'Valid search for playwright testing',
          expectedBehavior: 'pass'
        },
        {
          id: 'valid-search-2',
          query: 'typescript automation',
          expectedResults: 10,
          category: 'valid',
          description: 'Valid search for typescript automation',
          expectedBehavior: 'pass'
        },
        {
          id: 'special-chars-search',
          query: 'test @#$%^&*()',
          expectedResults: 5,
          category: 'edge-case',
          description: 'Search with special characters',
          expectedBehavior: 'pass'
        },
        {
          id: 'long-query-search',
          query: 'a'.repeat(1000),
          expectedResults: 0,
          category: 'edge-case',
          description: 'Extremely long search query',
          expectedBehavior: 'fail'
        },
        {
          id: 'pagination-test',
          query: 'test pagination fail',
          expectedResults: 10,
          category: 'performance',
          description: 'Search result pagination test that should fail',
          expectedBehavior: 'fail'
        }
      ],
      urls: [
        {
          id: 'google-home',
          name: 'Google Home Page',
          url: 'https://www.google.com',
          environment: 'prod',
          expectedStatus: 200,
          timeout: 30000
        }
      ],
      environments: [
        {
          name: 'staging',
          baseUrl: 'https://www.google.com',
          apiUrl: 'https://jsonplaceholder.typicode.com',
          features: ['search', 'images', 'maps'],
          credentials: {
            username: 'staging_user',
            password: 'staging_pass'
          }
        },
        {
          name: 'prod',
          baseUrl: 'https://www.google.com',
          apiUrl: 'https://jsonplaceholder.typicode.com',
          features: ['search', 'images', 'maps', 'news'],
          credentials: {
            username: 'prod_user',
            password: 'prod_pass'
          }
        }
      ]
    };
  }

  /**
   * Get all users
   */
  getUsers() {
    return this.testData?.users || [];
  }

  /**
   * Get user by ID
   */
  getUserById(id: string) {
    return this.testData?.users.find(user => user.id === id);
  }

  /**
   * Get user by role
   */
  getUsersByRole(role: 'admin' | 'user' | 'guest') {
    return this.testData?.users.filter(user => user.role === role) || [];
  }

  /**
   * Get search queries
   */
  getSearchQueries() {
    return this.testData?.searchQueries || [];
  }

  /**
   * Get search query by ID
   */
  getSearchQueryById(id: string) {
    return this.testData?.searchQueries.find(query => query.id === id);
  }

  /**
   * Get search queries by category
   */
  getSearchQueriesByCategory(category: 'valid' | 'invalid' | 'edge-case' | 'performance') {
    return this.testData?.searchQueries.filter(query => query.category === category) || [];
  }

  /**
   * Get search queries by expected behavior
   */
  getSearchQueriesByBehavior(behavior: 'pass' | 'fail') {
    return this.testData?.searchQueries.filter(query => query.expectedBehavior === behavior) || [];
  }

  /**
   * Get URLs
   */
  getUrls() {
    return this.testData?.urls || [];
  }

  /**
   * Get URL by ID
   */
  getUrlById(id: string) {
    return this.testData?.urls.find(url => url.id === id);
  }

  /**
   * Get environment configuration
   */
  getEnvironment(name: string) {
    return this.testData?.environments.find(env => env.name === name);
  }

  /**
   * Get current environment configuration
   */
  getCurrentEnvironment() {
    return this.getEnvironment(this.environment);
  }

  /**
   * Get random user
   */
  getRandomUser() {
    const users = this.getUsers();
    return users[Math.floor(Math.random() * users.length)];
  }

  /**
   * Get random search query by category
   */
  getRandomSearchQuery(category?: 'valid' | 'invalid' | 'edge-case' | 'performance') {
    const queries = category ? this.getSearchQueriesByCategory(category) : this.getSearchQueries();
    return queries[Math.floor(Math.random() * queries.length)];
  }

  /**
   * Load test data from YAML file
   */
  async loadFromYaml(filePath: string): Promise<void> {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      this.testData = yaml.parse(fileContent);
      this.logger.info(`Test data loaded from YAML: ${filePath}`);
    } catch (error) {
      this.logger.error('Failed to load YAML test data:', error);
      throw error;
    }
  }

  /**
   * Load test data from API
   */
  async loadFromApi(apiUrl: string): Promise<void> {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      this.testData = await response.json();
      this.logger.info(`Test data loaded from API: ${apiUrl}`);
    } catch (error) {
      this.logger.error('Failed to load API test data:', error);
      throw error;
    }
  }

  /**
   * Save test data to file
   */
  async saveTestData(filePath: string, format: 'json' | 'yaml' = 'json'): Promise<void> {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      let content: string;
      if (format === 'yaml') {
        content = yaml.stringify(this.testData);
      } else {
        content = JSON.stringify(this.testData, null, 2);
      }

      fs.writeFileSync(filePath, content);
      this.logger.info(`Test data saved to: ${filePath}`);
    } catch (error) {
      this.logger.error('Failed to save test data:', error);
      throw error;
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.logger.info('Cleaning up test data manager');
    // Perform any necessary cleanup
  }

  /**
   * Validate test data structure
   */
  validateTestData(): boolean {
    if (!this.testData) {
      this.logger.error('Test data is not loaded');
      return false;
    }

    const requiredFields = ['users', 'searchQueries', 'urls', 'environments'];
    for (const field of requiredFields) {
      if (!this.testData[field as keyof TestData]) {
        this.logger.error(`Required field missing in test data: ${field}`);
        return false;
      }
    }

    this.logger.info('Test data validation passed');
    return true;
  }
}
