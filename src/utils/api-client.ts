import { APIRequestContext, APIResponse, request } from '@playwright/test';
import { Logger } from './logger';
import { ApiResponse } from '../types/test-data';

/**
 * API Client for making HTTP requests and testing APIs
 */
export class ApiClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly retries: number;
  private readonly headers: Record<string, string>;
  private readonly logger: Logger;
  private apiContext: APIRequestContext | null = null;

  constructor(
    baseUrl: string,
    config?: {
      timeout?: number;
      retries?: number;
      headers?: Record<string, string>;
    }
  ) {
    this.baseUrl = baseUrl;
    this.timeout = config?.timeout || 30000;
    this.retries = config?.retries || 3;
    this.headers = config?.headers || {};
    this.logger = new Logger('ApiClient');
  }

  /**
   * Initialize API context
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing API client');
    this.apiContext = await request.newContext({
      baseURL: this.baseUrl,
      extraHTTPHeaders: this.headers,
      timeout: this.timeout
    });
  }

  /**
   * Get API context (initialize if not exists)
   */
  private async getContext(): Promise<APIRequestContext> {
    if (!this.apiContext) {
      await this.initialize();
    }
    return this.apiContext!;
  }

  /**
   * Make GET request
   */
  async get<T = any>(
    endpoint: string,
    options?: {
      params?: Record<string, string>;
      headers?: Record<string, string>;
      timeout?: number;
    }
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    this.logger.info(`GET request to: ${endpoint}`);

    try {
      const context = await this.getContext();
      const response = await context.get(endpoint, {
        params: options?.params,
        headers: options?.headers,
        timeout: options?.timeout || this.timeout
      });

      const result = await this.processResponse<T>(response, startTime);
      this.logger.success(`GET ${endpoint} completed in ${result.responseTime}ms`);
      return result;
    } catch (error) {
      this.logger.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * Make POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: {
      headers?: Record<string, string>;
      timeout?: number;
    }
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    this.logger.info(`POST request to: ${endpoint}`);

    try {
      const context = await this.getContext();
      const response = await context.post(endpoint, {
        data,
        headers: options?.headers,
        timeout: options?.timeout || this.timeout
      });

      const result = await this.processResponse<T>(response, startTime);
      this.logger.success(`POST ${endpoint} completed in ${result.responseTime}ms`);
      return result;
    } catch (error) {
      this.logger.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * Make PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: {
      headers?: Record<string, string>;
      timeout?: number;
    }
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    this.logger.info(`PUT request to: ${endpoint}`);

    try {
      const context = await this.getContext();
      const response = await context.put(endpoint, {
        data,
        headers: options?.headers,
        timeout: options?.timeout || this.timeout
      });

      const result = await this.processResponse<T>(response, startTime);
      this.logger.success(`PUT ${endpoint} completed in ${result.responseTime}ms`);
      return result;
    } catch (error) {
      this.logger.error(`PUT ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * Make DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    options?: {
      headers?: Record<string, string>;
      timeout?: number;
    }
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    this.logger.info(`DELETE request to: ${endpoint}`);

    try {
      const context = await this.getContext();
      const response = await context.delete(endpoint, {
        headers: options?.headers,
        timeout: options?.timeout || this.timeout
      });

      const result = await this.processResponse<T>(response, startTime);
      this.logger.success(`DELETE ${endpoint} completed in ${result.responseTime}ms`);
      return result;
    } catch (error) {
      this.logger.error(`DELETE ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * Make PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    options?: {
      headers?: Record<string, string>;
      timeout?: number;
    }
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    this.logger.info(`PATCH request to: ${endpoint}`);

    try {
      const context = await this.getContext();
      const response = await context.patch(endpoint, {
        data,
        headers: options?.headers,
        timeout: options?.timeout || this.timeout
      });

      const result = await this.processResponse<T>(response, startTime);
      this.logger.success(`PATCH ${endpoint} completed in ${result.responseTime}ms`);
      return result;
    } catch (error) {
      this.logger.error(`PATCH ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * Process API response
   */
  private async processResponse<T>(response: APIResponse, startTime: number): Promise<ApiResponse<T>> {
    const responseTime = Date.now() - startTime;
    const status = response.status();
    const statusText = response.statusText();
    const headers = response.headers();

    let data: T;
    try {
      const contentType = headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as any;
      }
    } catch {
      data = null as any;
    }

    return {
      status,
      statusText,
      headers,
      data,
      responseTime
    };
  }

  /**
   * Validate response status
   */
  validateStatus(response: ApiResponse, expectedStatus: number | number[]): boolean {
    const expected = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
    const isValid = expected.includes(response.status);
    
    if (isValid) {
      this.logger.success(`Status validation passed: ${response.status}`);
    } else {
      this.logger.error(`Status validation failed. Expected: ${expected}, Got: ${response.status}`);
    }
    
    return isValid;
  }

  /**
   * Validate response time
   */
  validateResponseTime(response: ApiResponse, maxTime: number): boolean {
    const isValid = response.responseTime <= maxTime;
    
    if (isValid) {
      this.logger.success(`Response time validation passed: ${response.responseTime}ms <= ${maxTime}ms`);
    } else {
      this.logger.error(`Response time validation failed: ${response.responseTime}ms > ${maxTime}ms`);
    }
    
    return isValid;
  }

  /**
   * Validate response schema
   */
  validateSchema(response: ApiResponse, schema: any): boolean {
    // Simple schema validation - can be enhanced with libraries like Joi or Ajv
    try {
      if (typeof schema === 'object' && schema !== null) {
        for (const key in schema) {
          if (!(key in response.data)) {
            this.logger.error(`Schema validation failed: Missing property '${key}'`);
            return false;
          }
        }
      }
      this.logger.success('Schema validation passed');
      return true;
    } catch (error) {
      this.logger.error('Schema validation failed:', error);
      return false;
    }
  }

  /**
   * Set authentication header
   */
  setAuthToken(token: string, type: 'Bearer' | 'Basic' = 'Bearer'): void {
    this.headers['Authorization'] = `${type} ${token}`;
    this.logger.info(`Authentication header set: ${type}`);
  }

  /**
   * Set custom header
   */
  setHeader(name: string, value: string): void {
    this.headers[name] = value;
    this.logger.info(`Custom header set: ${name}`);
  }

  /**
   * Remove header
   */
  removeHeader(name: string): void {
    delete this.headers[name];
    this.logger.info(`Header removed: ${name}`);
  }

  /**
   * Get response headers
   */
  getResponseHeaders(response: ApiResponse): Record<string, string> {
    return response.headers;
  }

  /**
   * Extract value from response using JSONPath
   */
  extractValue(response: ApiResponse, path: string): any {
    try {
      const keys = path.split('.');
      let value = response.data;
      
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          return null;
        }
      }
      
      return value;
    } catch (error) {
      this.logger.error(`Failed to extract value from path '${path}':`, error);
      return null;
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.logger.info('Cleaning up API client');
    if (this.apiContext) {
      await this.apiContext.dispose();
      this.apiContext = null;
    }
  }

  /**
   * Get base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get current headers
   */
  getHeaders(): Record<string, string> {
    return { ...this.headers };
  }
}
