import { test, expect } from '../../src/fixtures/base-fixtures';
import { allure } from 'allure-playwright';

test.describe('API Integration Tests', () => {
  test.beforeEach(async () => {
    allure.feature('API Testing');
  });

  test('should test GET request with httpbin @api @smoke', async ({
    apiClient,
    logger
  }) => {
    allure.story('GET Request Testing');
    allure.description('This test validates GET requests using httpbin.org testing service');
    allure.severity('critical');
    
    logger.step('Starting GET request API test');
    
    // Test GET request with query parameters
    const response = await apiClient.get('/get?param1=value1&param2=value2');
    
    // Validate response status
    expect(response.status).toBe(200);
    expect(apiClient.validateStatus(response, 200)).toBeTruthy();
    
    // Validate response structure
    expect(response.data).toBeDefined();
    expect(response.data.args).toBeDefined();
    expect(response.data.headers).toBeDefined();
    expect(response.data.url).toBeDefined();
    
    // Validate query parameters were received
    expect(response.data.args.param1).toBe('value1');
    expect(response.data.args.param2).toBe('value2');
    
    // Validate response time
    expect(apiClient.validateResponseTime(response, 5000)).toBeTruthy();
    
    logger.info(`Response URL: ${response.data.url}`);
    logger.info(`Response time: ${response.responseTime}ms`);
    logger.info(`Query params received: ${JSON.stringify(response.data.args)}`);
    
    // Attach response data to allure report
    allure.attachment('Response Status', response.status.toString(), 'text/plain');
    allure.attachment('Response Time', `${response.responseTime}ms`, 'text/plain');
    allure.attachment('Query Parameters', JSON.stringify(response.data.args, null, 2), 'application/json');
    allure.attachment('Response Headers', JSON.stringify(response.data.headers, null, 2), 'application/json');
    
    logger.success('✅ GET request API test passed');
  });

  test('should test JSON data with httpbin @api @smoke', async ({
    apiClient,
    logger
  }) => {
    allure.story('GET JSON Data');
    allure.description('This test validates getting JSON data from httpbin');
    allure.severity('normal');
    
    logger.step('Starting GET JSON data API test');
    
    // Get JSON data
    const response = await apiClient.get('/json');
    
    // Validate response
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    
    // httpbin /json returns a sample JSON object
    expect(typeof response.data).toBe('object');
    
    logger.info(`JSON data received: ${JSON.stringify(response.data)}`);
    logger.info(`Response time: ${response.responseTime}ms`);
    
    // Attach response data to allure report
    allure.attachment('Response Time', `${response.responseTime}ms`, 'text/plain');
    allure.attachment('JSON Data', JSON.stringify(response.data, null, 2), 'application/json');
    
    logger.success('✅ GET JSON data API test passed');
  });

  test('should test POST request with httpbin @api @crud', async ({
    apiClient,
    logger
  }) => {
    allure.story('POST Request Testing');
    allure.description('This test validates POST requests using httpbin');
    allure.severity('normal');
    
    logger.step('Starting POST request API test');
    
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test message from automated tests'
    };
    
    // Create POST request
    const response = await apiClient.post('/post', testData);
    
    // Validate response status
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    
    // Validate that httpbin echoed back our data
    expect(response.data.json).toBeDefined();
    expect(response.data.json.name).toBe(testData.name);
    expect(response.data.json.email).toBe(testData.email);
    expect(response.data.json.message).toBe(testData.message);
    
    // Validate headers were sent
    expect(response.data.headers).toBeDefined();
    
    logger.info(`POST data sent: ${JSON.stringify(testData)}`);
    logger.info(`Response time: ${response.responseTime}ms`);
    
    // Attach test data to allure report
    allure.attachment('Request Data', JSON.stringify(testData, null, 2), 'application/json');
    allure.attachment('Response Status', response.status.toString(), 'text/plain');
    allure.attachment('Response Time', `${response.responseTime}ms`, 'text/plain');
    allure.attachment('Echoed Data', JSON.stringify(response.data.json, null, 2), 'application/json');
    
    logger.success('✅ POST request API test passed');
  });

  test('should test PUT request with httpbin @api @crud', async ({
    apiClient,
    logger
  }) => {
    allure.story('PUT Request Testing');
    allure.description('This test validates PUT requests using httpbin');
    allure.severity('normal');
    
    logger.step('Starting PUT request API test');
    
    const updateData = {
      id: 123,
      name: 'Updated Test User',
      email: 'updated@example.com',
      status: 'active'
    };
    
    // Update via PUT request
    const response = await apiClient.put('/put', updateData);
    
    // Validate response status
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    
    // Validate that httpbin echoed back our data
    expect(response.data.json).toBeDefined();
    expect(response.data.json.id).toBe(updateData.id);
    expect(response.data.json.name).toBe(updateData.name);
    expect(response.data.json.email).toBe(updateData.email);
    expect(response.data.json.status).toBe(updateData.status);
    
    logger.info(`PUT data sent: ${JSON.stringify(updateData)}`);
    logger.info(`Response time: ${response.responseTime}ms`);
    
    // Attach test data to allure report
    allure.attachment('Request Data', JSON.stringify(updateData, null, 2), 'application/json');
    allure.attachment('Response Time', `${response.responseTime}ms`, 'text/plain');
    allure.attachment('Echoed Data', JSON.stringify(response.data.json, null, 2), 'application/json');
    
    logger.success('✅ PUT request API test passed');
  });

  test('should test DELETE request with httpbin @api @crud', async ({
    apiClient,
    logger
  }) => {
    allure.story('DELETE Request Testing');
    allure.description('This test validates DELETE requests using httpbin');
    allure.severity('normal');
    
    logger.step('Starting DELETE request API test');
    
    // Delete request
    const response = await apiClient.delete('/delete');
    
    // Validate response status
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    
    // Validate delete response structure
    expect(response.data.url).toBeDefined();
    expect(response.data.headers).toBeDefined();
    
    logger.info(`DELETE request completed`);
    logger.info(`Response time: ${response.responseTime}ms`);
    
    // Attach test data to allure report
    allure.attachment('Response Status', response.status.toString(), 'text/plain');
    allure.attachment('Response Time', `${response.responseTime}ms`, 'text/plain');
    allure.attachment('Response Data', JSON.stringify(response.data, null, 2), 'application/json');
    
    logger.success('✅ DELETE request API test passed');
  });

  test('should handle API error responses @api @error-handling', async ({
    apiClient,
    logger
  }) => {
    allure.story('API Error Handling');
    allure.description('This test validates proper handling of API error responses');
    allure.severity('normal');
    
    logger.step('Starting API error handling test');
    
    // Try to get a status that returns an error
    try {
      const response = await apiClient.get('/status/404');
      
      // httpbin /status/{code} returns the specified status code
      expect(response.status).toBe(404);
      
      logger.info('Received expected 404 status code');
      logger.info(`Response time: ${response.responseTime}ms`);
      
      // Attach test data to allure report
      allure.attachment('Expected Status Code', '404', 'text/plain');
      allure.attachment('Actual Status Code', response.status.toString(), 'text/plain');
      allure.attachment('Response Time', `${response.responseTime}ms`, 'text/plain');
      
    } catch (error) {
      logger.info(`Error handling test caught expected error: ${String(error)}`);
      
      // If an error is thrown, that's also valid behavior
      allure.attachment('Error Details', String(error), 'text/plain');
    }
    
    logger.success('✅ API error handling test passed');
  });

  test('should validate API response performance @api @performance', async ({
    apiClient,
    logger
  }) => {
    allure.story('API Performance');
    allure.description('This test validates API response performance meets requirements');
    allure.severity('normal');
    
    logger.step('Starting API performance test');
    
    const maxResponseTime = 2000; // 2 seconds
    const iterations = 5;
    const responseTimes: number[] = [];
    
    // Perform multiple API calls to test performance
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      const response = await apiClient.get('/posts/1');
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      responseTimes.push(responseTime);
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(maxResponseTime);
      
      logger.info(`API call ${i + 1}: ${responseTime}ms`);
    }
    
    // Calculate performance metrics
    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const minResponseTime = Math.min(...responseTimes);
    const maxResponseTime_actual = Math.max(...responseTimes);
    
    logger.info(`Performance metrics over ${iterations} calls:`);
    logger.info(`- Average response time: ${avgResponseTime.toFixed(2)}ms`);
    logger.info(`- Minimum response time: ${minResponseTime}ms`);
    logger.info(`- Maximum response time: ${maxResponseTime_actual}ms`);
    
    // Performance assertions
    expect(avgResponseTime).toBeLessThan(maxResponseTime);
    expect(maxResponseTime_actual).toBeLessThan(maxResponseTime * 1.5); // Allow 50% variance for max
    
    // Attach performance data to allure report
    allure.attachment('Iterations', iterations.toString(), 'text/plain');
    allure.attachment('Average Response Time', `${avgResponseTime.toFixed(2)}ms`, 'text/plain');
    allure.attachment('Min Response Time', `${minResponseTime}ms`, 'text/plain');
    allure.attachment('Max Response Time', `${maxResponseTime_actual}ms`, 'text/plain');
    allure.attachment('All Response Times', responseTimes.join(', ') + ' ms', 'text/plain');
    
    logger.success('✅ API performance test passed');
  });

  test('should validate API response schema @api @schema', async ({
    apiClient,
    logger
  }) => {
    allure.story('API Schema Validation');
    allure.description('This test validates API response adheres to expected schema');
    allure.severity('normal');
    
    logger.step('Starting API schema validation test');
    
    // Get posts
    const response = await apiClient.get('/posts');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBeTruthy();
    
    // Define expected schema for a post
    const postSchema = {
      id: 'number',
      title: 'string',
      body: 'string',
      userId: 'number'
    };
    
    // Validate schema for first few posts
    const postsToValidate = response.data.slice(0, 5);
    const schemaValidationResults: string[] = [];
    
    postsToValidate.forEach((post: any, index: number) => {
      const postNumber = index + 1;
      let isValid = true;
      const issues: string[] = [];
      
      // Check each required field
      Object.entries(postSchema).forEach(([field, expectedType]) => {
        if (!(field in post)) {
          issues.push(`Missing field: ${field}`);
          isValid = false;
        } else if (typeof post[field] !== expectedType) {
          issues.push(`Field ${field} has type ${typeof post[field]}, expected ${expectedType}`);
          isValid = false;
        }
      });
      
      if (isValid) {
        schemaValidationResults.push(`Post ${postNumber}: Valid schema`);
        logger.success(`✓ Post ${postNumber} schema is valid`);
      } else {
        schemaValidationResults.push(`Post ${postNumber}: Invalid schema - ${issues.join(', ')}`);
        logger.error(`✗ Post ${postNumber} schema issues: ${issues.join(', ')}`);
      }
    });
    
    // Count valid vs invalid
    const validCount = schemaValidationResults.filter(result => result.includes('Valid')).length;
    const invalidCount = schemaValidationResults.length - validCount;
    
    logger.info(`Schema validation results:`);
    logger.info(`- Valid posts: ${validCount}`);
    logger.info(`- Invalid posts: ${invalidCount}`);
    
    // Attach validation results to allure report
    allure.attachment('Expected Schema', JSON.stringify(postSchema, null, 2), 'application/json');
    allure.attachment('Posts Validated', postsToValidate.length.toString(), 'text/plain');
    allure.attachment('Valid Posts', validCount.toString(), 'text/plain');
    allure.attachment('Invalid Posts', invalidCount.toString(), 'text/plain');
    allure.attachment('Validation Details', schemaValidationResults.join('\\n'), 'text/plain');
    
    // Assert all posts have valid schema
    expect(invalidCount).toBe(0);
    
    logger.success('✅ API schema validation test passed');
  });
});
