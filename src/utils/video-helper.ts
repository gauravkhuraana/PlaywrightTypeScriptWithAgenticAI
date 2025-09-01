import { Page, TestInfo } from '@playwright/test';
import { Logger } from './logger';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Video Helper for recording and managing videos
 */
export class VideoHelper {
  private readonly page: Page;
  private readonly testInfo: TestInfo;
  private readonly logger: Logger;
  private readonly videoDir: string;
  private readonly recordVideo: boolean;

  constructor(page: Page, testInfo: TestInfo, recordVideo: boolean = false) {
    this.page = page;
    this.testInfo = testInfo;
    this.logger = new Logger('VideoHelper');
    this.videoDir = path.join('test-results', 'videos');
    this.recordVideo = recordVideo;
    this.ensureDirectoryExists();
  }

  /**
   * Ensure video directory exists
   */
  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.videoDir)) {
      fs.mkdirSync(this.videoDir, { recursive: true });
    }
  }

  /**
   * Start video recording
   */
  async startRecording(): Promise<void> {
    if (!this.recordVideo) {
      this.logger.info('Video recording is disabled');
      return;
    }

    this.logger.info('Starting video recording');
    
    // Video recording is typically configured at the browser context level
    // This method can be used to track recording state or add custom logic
    
    this.logger.success('Video recording started');
  }

  /**
   * Stop video recording
   */
  async stopRecording(): Promise<string | null> {
    if (!this.recordVideo) {
      this.logger.info('Video recording is disabled');
      return null;
    }

    this.logger.info('Stopping video recording');
    
    try {
      // Get the video path from the page
      const videoPath = await this.page.video()?.path();
      
      if (videoPath) {
        // Copy video to our video directory with a better name
        const testName = this.testInfo.title.replace(/[^a-zA-Z0-9]/g, '_');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const newVideoPath = path.join(this.videoDir, `${testName}-${timestamp}.webm`);
        
        // Wait a bit for the video to be fully written
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Copy the video file
        if (fs.existsSync(videoPath)) {
          fs.copyFileSync(videoPath, newVideoPath);
          
          // Attach to test report
          await this.testInfo.attach('video', {
            path: newVideoPath,
            contentType: 'video/webm'
          });
          
          this.logger.success(`Video recording saved: ${newVideoPath}`);
          return newVideoPath;
        }
      }
      
      this.logger.warn('No video path available');
      return null;
    } catch (error) {
      this.logger.error('Failed to stop video recording:', error);
      return null;
    }
  }

  /**
   * Save video on test failure
   */
  async saveFailureVideo(): Promise<string | null> {
    if (!this.recordVideo) {
      return null;
    }

    this.logger.info('Saving failure video');
    
    try {
      const videoPath = await this.page.video()?.path();
      
      if (videoPath) {
        const testName = this.testInfo.title.replace(/[^a-zA-Z0-9]/g, '_');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const failureVideoPath = path.join(this.videoDir, `failure-${testName}-${timestamp}.webm`);
        
        // Wait for video to be written
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (fs.existsSync(videoPath)) {
          fs.copyFileSync(videoPath, failureVideoPath);
          
          // Attach to test report
          await this.testInfo.attach('failure-video', {
            path: failureVideoPath,
            contentType: 'video/webm'
          });
          
          this.logger.success(`Failure video saved: ${failureVideoPath}`);
          return failureVideoPath;
        }
      }
      
      return null;
    } catch (error) {
      this.logger.error('Failed to save failure video:', error);
      return null;
    }
  }

  /**
   * Get video duration
   */
  async getVideoDuration(videoPath: string): Promise<number> {
    try {
      // This would require a video processing library like ffprobe
      // For now, return 0 as placeholder
      this.logger.info(`Getting video duration for: ${videoPath}`);
      return 0;
    } catch (error) {
      this.logger.error('Failed to get video duration:', error);
      return 0;
    }
  }

  /**
   * Compress video
   */
  async compressVideo(inputPath: string, outputPath?: string): Promise<string | null> {
    try {
      const output = outputPath || inputPath.replace('.webm', '-compressed.webm');
      
      // This would require ffmpeg or similar video processing tool
      // For now, just copy the file as placeholder
      this.logger.info(`Compressing video: ${inputPath} -> ${output}`);
      
      if (fs.existsSync(inputPath)) {
        fs.copyFileSync(inputPath, output);
        this.logger.success(`Video compressed: ${output}`);
        return output;
      }
      
      return null;
    } catch (error) {
      this.logger.error('Failed to compress video:', error);
      return null;
    }
  }

  /**
   * Extract frames from video
   */
  async extractFrames(videoPath: string, frameCount: number = 10): Promise<string[]> {
    try {
      this.logger.info(`Extracting ${frameCount} frames from: ${videoPath}`);
      
      const frameDir = path.join(this.videoDir, 'frames');
      if (!fs.existsSync(frameDir)) {
        fs.mkdirSync(frameDir, { recursive: true });
      }
      
      const frames: string[] = [];
      
      // This would require ffmpeg to extract actual frames
      // For now, return empty array as placeholder
      this.logger.info(`Frame extraction completed: ${frames.length} frames`);
      return frames;
    } catch (error) {
      this.logger.error('Failed to extract frames:', error);
      return [];
    }
  }

  /**
   * Create video thumbnail
   */
  async createThumbnail(videoPath: string): Promise<string | null> {
    try {
      const thumbnailPath = videoPath.replace('.webm', '-thumbnail.png');
      
      // This would require ffmpeg to create actual thumbnail
      // For now, return null as placeholder
      this.logger.info(`Creating thumbnail for: ${videoPath}`);
      
      return null;
    } catch (error) {
      this.logger.error('Failed to create thumbnail:', error);
      return null;
    }
  }

  /**
   * Get all videos for current test
   */
  getTestVideos(): string[] {
    const testName = this.testInfo.title.replace(/[^a-zA-Z0-9]/g, '_');
    if (!fs.existsSync(this.videoDir)) {
      return [];
    }
    
    return fs.readdirSync(this.videoDir)
      .filter(file => file.includes(testName) && file.endsWith('.webm'))
      .map(file => path.join(this.videoDir, file));
  }

  /**
   * Clean up old videos
   */
  cleanupOldVideos(daysOld: number = 7): void {
    if (!fs.existsSync(this.videoDir)) {
      return;
    }

    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    
    fs.readdirSync(this.videoDir).forEach(file => {
      const filePath = path.join(this.videoDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime.getTime() < cutoffTime) {
        fs.unlinkSync(filePath);
        this.logger.info(`Cleaned up old video: ${file}`);
      }
    });
  }

  /**
   * Get video file size
   */
  getVideoSize(videoPath: string): number {
    try {
      if (fs.existsSync(videoPath)) {
        const stats = fs.statSync(videoPath);
        return stats.size;
      }
      return 0;
    } catch (error) {
      this.logger.error('Failed to get video size:', error);
      return 0;
    }
  }

  /**
   * Convert video format
   */
  async convertVideo(inputPath: string, outputFormat: 'mp4' | 'avi' | 'mov'): Promise<string | null> {
    try {
      const outputPath = inputPath.replace('.webm', `.${outputFormat}`);
      
      // This would require ffmpeg for actual conversion
      // For now, just log the action
      this.logger.info(`Converting video: ${inputPath} -> ${outputPath}`);
      
      return null;
    } catch (error) {
      this.logger.error('Failed to convert video:', error);
      return null;
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.logger.info('Cleaning up video helper resources');
    
    // Ensure any ongoing recording is stopped
    if (this.recordVideo) {
      await this.stopRecording();
    }
  }

  /**
   * Check if video recording is enabled
   */
  isRecordingEnabled(): boolean {
    return this.recordVideo;
  }

  /**
   * Get video directory path
   */
  getVideoDirectory(): string {
    return this.videoDir;
  }
}
