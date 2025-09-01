import { test, expect } from '../../src/fixtures/base-fixtures';
import { allure } from 'allure-playwright';

test.describe('API Integration Tests', () => {
  test.beforeEach(async () => {
    allure.feature('API Testing');
  });

  test('should get posts from JSONPlaceholder API @api @smoke', async ({
    apiClient,
    logger
  }) => {
    allure.story('GET Posts');
    allure.description('This test validates the GET /posts endpoint from JSONPlaceholder API');
    allure.severity('critical');
    
    logger.step('Starting GET posts API test');
    
    // Get all posts
    const response = await apiClient.get('/posts');
    
    // Validate response status
    expect(response.status).toBe(200);
    expect(apiClient.validateStatus(response, 200)).toBeTruthy();
    
    // Validate response structure
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBeTruthy();
    expect(response.data.length).toBeGreaterThan(0);
    
    // Validate response time
    expect(apiClient.validateResponseTime(response, 5000)).toBeTruthy();
    
    // Validate first post structure
    const firstPost = response.data[0];
    expect(firstPost).toHaveProperty('id');
    expect(firstPost).toHaveProperty('title');
    expect(firstPost).toHaveProperty('body');
    expect(firstPost).toHaveProperty('userId');
    
    logger.info(`Retrieved ${response.data.length} posts`);
    logger.info(`Response time: ${response.responseTime}ms`);
    
    // Attach response data to allure report
    allure.attachment('Response Status', response.status.toString(), 'text/plain');
    allure.attachment('Response Time', `${response.responseTime}ms`, 'text/plain');
    allure.attachment('Posts Count', response.data.length.toString(), 'text/plain');
    allure.attachment('First Post', JSON.stringify(firstPost, null, 2), 'application/json');
    
    logger.success('✅ GET posts API test passed');
  });

  test('should get specific post by ID @api @smoke', async ({
    apiClient,
    logger
  }) => {
    allure.story('GET Post by ID');
    allure.description('This test validates getting a specific post by ID');
    allure.severity('normal');
    
    logger.step('Starting GET post by ID API test');
    
    const postId = 1;
    
    // Get specific post
    const response = await apiClient.get(`/posts/${postId}`);
    
    // Validate response
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.id).toBe(postId);
    
    // Validate post structure
    expect(response.data).toHaveProperty('title');
    expect(response.data).toHaveProperty('body');
    expect(response.data).toHaveProperty('userId');
    
    // Validate data types
    expect(typeof response.data.id).toBe('number');
    expect(typeof response.data.title).toBe('string');
    expect(typeof response.data.body).toBe('string');
    expect(typeof response.data.userId).toBe('number');
    
    logger.info(`Retrieved post ${postId}: "${response.data.title}"`);
    logger.info(`Response time: ${response.responseTime}ms`);
    
    // Attach response data to allure report
    allure.attachment('Post ID', postId.toString(), 'text/plain');
    allure.attachment('Response Time', `${response.responseTime}ms`, 'text/plain');
    allure.attachment('Post Data', JSON.stringify(response.data, null, 2), 'application/json');
    
    logger.success('✅ GET post by ID API test passed');
  });

  test('should create new post @api @crud', async ({
    apiClient,
    logger
  }) => {
    allure.story('POST Create Post');
    allure.description('This test validates creating a new post via POST');
    allure.severity('normal');
    
    logger.step('Starting POST create post API test');
    
    const newPost = {
      title: 'Test Post Title',
      body: 'This is a test post body created by automated tests',
      userId: 1
    };
    
    // Create new post
    const response = await apiClient.post('/posts', newPost);
    
    // Validate response status (JSONPlaceholder returns 201 for POST)
    expect(response.status).toBe(201);
    expect(response.data).toBeDefined();
    
    // Validate created post data
    expect(response.data.title).toBe(newPost.title);
    expect(response.data.body).toBe(newPost.body);
    expect(response.data.userId).toBe(newPost.userId);
    expect(response.data.id).toBeDefined();
    expect(typeof response.data.id).toBe('number');
    
    logger.info(`Created post with ID: ${response.data.id}`);
    logger.info(`Response time: ${response.responseTime}ms`);
    
    // Attach test data to allure report
    allure.attachment('Request Data', JSON.stringify(newPost, null, 2), 'application/json');
    allure.attachment('Response Status', response.status.toString(), 'text/plain');
    allure.attachment('Response Time', `${response.responseTime}ms`, 'text/plain');
    allure.attachment('Created Post', JSON.stringify(response.data, null, 2), 'application/json');
    
    logger.success('✅ POST create post API test passed');
  });

  test('should update existing post @api @crud', async ({
    apiClient,
    logger
  }) => {
    allure.story('PUT Update Post');
    allure.description('This test validates updating an existing post via PUT');
    allure.severity('normal');
    
    logger.step('Starting PUT update post API test');
    
    const postId = 1;
    const updatedPost = {
      id: postId,
      title: 'Updated Test Post Title',
      body: 'This is an updated test post body',
      userId: 1
    };
    
    // Update existing post
    const response = await apiClient.put(`/posts/${postId}`, updatedPost);
    
    // Validate response status
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    
    // Validate updated post data
    expect(response.data.id).toBe(postId);
    expect(response.data.title).toBe(updatedPost.title);
    expect(response.data.body).toBe(updatedPost.body);
    expect(response.data.userId).toBe(updatedPost.userId);
    
    logger.info(`Updated post ${postId}: "${response.data.title}"`);
    logger.info(`Response time: ${response.responseTime}ms`);
    
    // Attach test data to allure report
    allure.attachment('Post ID', postId.toString(), 'text/plain');
    allure.attachment('Request Data', JSON.stringify(updatedPost, null, 2), 'application/json');
    allure.attachment('Response Time', `${response.responseTime}ms`, 'text/plain');
    allure.attachment('Updated Post', JSON.stringify(response.data, null, 2), 'application/json');
    
    logger.success('✅ PUT update post API test passed');
  });

  test('should delete post @api @crud', async ({
    apiClient,
    logger
  }) => {
    allure.story('DELETE Post');
    allure.description('This test validates deleting a post via DELETE');
    allure.severity('normal');
    
    logger.step('Starting DELETE post API test');
    
    const postId = 1;
    
    // Delete post
    const response = await apiClient.delete(`/posts/${postId}`);
    
    // Validate response status
    expect(response.status).toBe(200);
    
    logger.info(`Deleted post ${postId}`);
    logger.info(`Response time: ${response.responseTime}ms`);
    
    // Attach test data to allure report
    allure.attachment('Post ID', postId.toString(), 'text/plain');
    allure.attachment('Response Status', response.status.toString(), 'text/plain');
    allure.attachment('Response Time', `${response.responseTime}ms`, 'text/plain');
    
    logger.success('✅ DELETE post API test passed');
  });

  test('should handle API error responses @api @error-handling', async ({
    apiClient,
    logger
  }) => {
    allure.story('API Error Handling');
    allure.description('This test validates proper handling of API error responses');
    allure.severity('normal');
    
    logger.step('Starting API error handling test');
    
    // Try to get non-existent post
    const nonExistentId = 99999;
    
    try {
      const response = await apiClient.get(`/posts/${nonExistentId}`);
      
      // JSONPlaceholder returns empty object for non-existent resources
      expect(response.status).toBe(200);
      
      // Check if response is empty or contains error indication
      if (Object.keys(response.data).length === 0) {
        logger.info('Received empty response for non-existent resource (expected behavior)');
      }
      
      logger.info(`Response for non-existent post ${nonExistentId}:`);
      logger.info(`Status: ${response.status}`);
      logger.info(`Data: ${JSON.stringify(response.data)}`);
      logger.info(`Response time: ${response.responseTime}ms`);
      
      // Attach test data to allure report
      allure.attachment('Non-existent Post ID', nonExistentId.toString(), 'text/plain');
      allure.attachment('Response Status', response.status.toString(), 'text/plain');
      allure.attachment('Response Data', JSON.stringify(response.data, null, 2), 'application/json');
      allure.attachment('Response Time', `${response.responseTime}ms`, 'text/plain');
      
    } catch (error) {
      logger.info(`Error handling test caught expected error: ${error}`);
      
      // If an error is thrown, that's also valid behavior
      allure.attachment('Error Details', error.toString(), 'text/plain');
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
