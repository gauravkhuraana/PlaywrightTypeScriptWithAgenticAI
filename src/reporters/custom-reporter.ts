import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import { Logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Custom Playwright Reporter
 */
export default class CustomReporter implements Reporter {
  private readonly logger: Logger;
  private startTime: number = 0;
  private totalTests: number = 0;
  private passedTests: number = 0;
  private failedTests: number = 0;
  private skippedTests: number = 0;
  private results: Array<{
    title: string;
    status: string;
    duration: number;
    error?: string;
    projectName: string;
  }> = [];

  constructor() {
    this.logger = new Logger('CustomReporter');
  }

  onBegin(config: any, suite: any): void {
    this.startTime = Date.now();
    this.totalTests = suite.allTests().length;
    this.logger.info(`Starting test execution with ${this.totalTests} tests`);
    
    // Ensure report directory exists
    const reportDir = 'test-results/custom-reports';
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
  }

  onTestBegin(test: TestCase): void {
    this.logger.step(`Starting test: ${test.title}`);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const duration = result.duration;
    const status = result.status;
    
    this.results.push({
      title: test.title,
      status,
      duration,
      error: result.error?.message,
      projectName: test.parent.project()?.name || 'unknown'
    });

    switch (status) {
      case 'passed':
        this.passedTests++;
        this.logger.success(`✓ ${test.title} (${duration}ms)`);
        break;
      case 'failed':
        this.failedTests++;
        this.logger.error(`✗ ${test.title} (${duration}ms)`, result.error?.message);
        break;
      case 'skipped':
        this.skippedTests++;
        this.logger.warn(`- ${test.title} (skipped)`);
        break;
      case 'timedOut':
        this.failedTests++;
        this.logger.error(`⏰ ${test.title} (timed out after ${duration}ms)`);
        break;
    }
  }

  onEnd(result: FullResult): void {
    const totalDuration = Date.now() - this.startTime;
    const successRate = this.totalTests > 0 ? (this.passedTests / this.totalTests) * 100 : 0;

    // Log summary
    this.logger.info('='.repeat(60));
    this.logger.info('TEST EXECUTION SUMMARY');
    this.logger.info('='.repeat(60));
    this.logger.info(`Total Tests: ${this.totalTests}`);
    this.logger.success(`Passed: ${this.passedTests}`);
    this.logger.error(`Failed: ${this.failedTests}`);
    this.logger.warn(`Skipped: ${this.skippedTests}`);
    this.logger.info(`Success Rate: ${successRate.toFixed(2)}%`);
    this.logger.info(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    this.logger.info('='.repeat(60));

    // Generate custom reports
    this.generateJSONReport();
    this.generateHTMLReport();
    this.generateCSVReport();
    this.generateMetricsReport();

    // Send notifications if configured
    if (process.env.ENABLE_NOTIFICATIONS === 'true') {
      this.sendNotifications(result, successRate, totalDuration);
    }
  }

  private generateJSONReport(): void {
    const report = {
      summary: {
        total: this.totalTests,
        passed: this.passedTests,
        failed: this.failedTests,
        skipped: this.skippedTests,
        successRate: this.totalTests > 0 ? (this.passedTests / this.totalTests) * 100 : 0,
        duration: Date.now() - this.startTime,
        timestamp: new Date().toISOString()
      },
      results: this.results,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        ci: !!process.env.CI
      }
    };

    const reportPath = path.join('test-results/custom-reports', 'report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.logger.info(`JSON report generated: ${reportPath}`);
  }

  private generateHTMLReport(): void {
    const successRate = this.totalTests > 0 ? (this.passedTests / this.totalTests) * 100 : 0;
    const duration = Date.now() - this.startTime;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Execution Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric h3 { margin: 0 0 10px 0; color: #333; }
        .metric .value { font-size: 2em; font-weight: bold; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        .total { color: #007bff; }
        .results-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .results-table th, .results-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .results-table th { background-color: #f8f9fa; font-weight: bold; }
        .status-passed { background-color: #d4edda; color: #155724; }
        .status-failed { background-color: #f8d7da; color: #721c24; }
        .status-skipped { background-color: #fff3cd; color: #856404; }
        .progress-bar { width: 100%; height: 20px; background-color: #e9ecef; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; background-color: #28a745; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Test Execution Report</h1>
            <p>Generated on ${new Date().toISOString()}</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <h3>Total Tests</h3>
                <div class="value total">${this.totalTests}</div>
            </div>
            <div class="metric">
                <h3>Passed</h3>
                <div class="value passed">${this.passedTests}</div>
            </div>
            <div class="metric">
                <h3>Failed</h3>
                <div class="value failed">${this.failedTests}</div>
            </div>
            <div class="metric">
                <h3>Skipped</h3>
                <div class="value skipped">${this.skippedTests}</div>
            </div>
            <div class="metric">
                <h3>Success Rate</h3>
                <div class="value">${successRate.toFixed(1)}%</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${successRate}%"></div>
                </div>
            </div>
            <div class="metric">
                <h3>Duration</h3>
                <div class="value">${(duration / 1000).toFixed(1)}s</div>
            </div>
        </div>
        
        <table class="results-table">
            <thead>
                <tr>
                    <th>Test Name</th>
                    <th>Status</th>
                    <th>Duration</th>
                    <th>Project</th>
                    <th>Error</th>
                </tr>
            </thead>
            <tbody>
                ${this.results.map(result => `
                    <tr>
                        <td>${result.title}</td>
                        <td class="status-${result.status}">${result.status.toUpperCase()}</td>
                        <td>${result.duration}ms</td>
                        <td>${result.projectName}</td>
                        <td>${result.error || '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`;

    const reportPath = path.join('test-results/custom-reports', 'report.html');
    fs.writeFileSync(reportPath, html);
    this.logger.info(`HTML report generated: ${reportPath}`);
  }

  private generateCSVReport(): void {
    const csvHeaders = 'Test Name,Status,Duration (ms),Project,Error\n';
    const csvRows = this.results.map(result =>
      `"${result.title}","${result.status}","${result.duration}","${result.projectName}","${result.error || ''}"`
    ).join('\n');

    const csvContent = csvHeaders + csvRows;
    const reportPath = path.join('test-results/custom-reports', 'report.csv');
    fs.writeFileSync(reportPath, csvContent);
    this.logger.info(`CSV report generated: ${reportPath}`);
  }

  private generateMetricsReport(): void {
    const duration = Date.now() - this.startTime;
    const successRate = this.totalTests > 0 ? (this.passedTests / this.totalTests) * 100 : 0;
    
    // Calculate additional metrics
    const averageTestDuration = this.results.length > 0 
      ? this.results.reduce((sum, result) => sum + result.duration, 0) / this.results.length 
      : 0;

    const slowestTest = this.results.reduce((slowest, result) => 
      result.duration > slowest.duration ? result : slowest, 
      { title: 'None', duration: 0 }
    );

    const fastestTest = this.results.reduce((fastest, result) => 
      result.duration < fastest.duration ? result : fastest, 
      { title: 'None', duration: Infinity }
    );

    const projectStats = this.results.reduce((stats, result) => {
      if (!stats[result.projectName]) {
        stats[result.projectName] = { total: 0, passed: 0, failed: 0 };
      }
      stats[result.projectName].total++;
      if (result.status === 'passed') stats[result.projectName].passed++;
      if (result.status === 'failed') stats[result.projectName].failed++;
      return stats;
    }, {} as Record<string, { total: number; passed: number; failed: number }>);

    const metrics = {
      execution: {
        totalDuration: duration,
        averageTestDuration: Math.round(averageTestDuration),
        slowestTest: slowestTest.title,
        slowestTestDuration: slowestTest.duration,
        fastestTest: fastestTest.title !== 'None' ? fastestTest.title : 'None',
        fastestTestDuration: fastestTest.duration !== Infinity ? fastestTest.duration : 0
      },
      summary: {
        total: this.totalTests,
        passed: this.passedTests,
        failed: this.failedTests,
        skipped: this.skippedTests,
        successRate: Math.round(successRate * 100) / 100
      },
      projects: projectStats,
      timestamp: new Date().toISOString()
    };

    const reportPath = path.join('test-results/custom-reports', 'metrics.json');
    fs.writeFileSync(reportPath, JSON.stringify(metrics, null, 2));
    this.logger.info(`Metrics report generated: ${reportPath}`);
  }

  private async sendNotifications(result: FullResult, successRate: number, duration: number): void {
    try {
      const message = `
🔍 Test Execution Complete!

📊 Results:
• Total: ${this.totalTests}
• ✅ Passed: ${this.passedTests}
• ❌ Failed: ${this.failedTests}
• ⏭️ Skipped: ${this.skippedTests}
• 📈 Success Rate: ${successRate.toFixed(1)}%
• ⏱️ Duration: ${(duration / 1000).toFixed(1)}s

${this.failedTests > 0 ? '⚠️ Some tests failed. Please check the detailed report.' : '🎉 All tests passed!'}
      `;

      // Slack notification
      if (process.env.SLACK_WEBHOOK_URL) {
        await this.sendSlackNotification(message);
      }

      // Teams notification
      if (process.env.TEAMS_WEBHOOK_URL) {
        await this.sendTeamsNotification(message);
      }

      // Email notification
      if (process.env.EMAIL_ENABLED === 'true') {
        await this.sendEmailNotification(message);
      }

    } catch (error) {
      this.logger.error('Failed to send notifications:', error);
    }
  }

  private async sendSlackNotification(message: string): Promise<void> {
    // Implementation for Slack webhook
    this.logger.info('Slack notification would be sent:', message);
  }

  private async sendTeamsNotification(message: string): Promise<void> {
    // Implementation for Teams webhook
    this.logger.info('Teams notification would be sent:', message);
  }

  private async sendEmailNotification(message: string): Promise<void> {
    // Implementation for email notification
    this.logger.info('Email notification would be sent:', message);
  }
}
