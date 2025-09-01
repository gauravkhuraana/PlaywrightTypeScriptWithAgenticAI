# Use official Playwright image as base
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Install additional browsers if needed
# RUN npx playwright install

# Create directories for test results
RUN mkdir -p test-results
RUN mkdir -p playwright-report
RUN mkdir -p allure-results

# Set environment variables
ENV CI=true
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Create non-root user for security
RUN groupadd -r testuser && useradd -r -g testuser testuser
RUN chown -R testuser:testuser /app
USER testuser

# Expose port for reports (optional)
EXPOSE 3000

# Default command - run tests
CMD ["npm", "run", "test"]
