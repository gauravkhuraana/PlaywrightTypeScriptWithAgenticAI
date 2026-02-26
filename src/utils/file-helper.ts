import { Page, Download } from '@playwright/test';
import { Logger } from './logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * File Helper for handling file uploads, downloads, and filesystem operations in tests
 */
export class FileHelper {
  private readonly page: Page;
  private readonly logger: Logger;
  private readonly downloadDir: string;
  private readonly uploadDir: string;

  constructor(page: Page, downloadDir?: string, uploadDir?: string) {
    this.page = page;
    this.logger = new Logger('FileHelper');
    this.downloadDir = downloadDir || path.join('test-results', 'downloads');
    this.uploadDir = uploadDir || path.join('src', 'data', 'uploads');
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    [this.downloadDir, this.uploadDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // ── Downloads ────────────────────────────────

  /**
   * Wait for a download triggered by an action and save it.
   * Returns the saved file path.
   */
  async waitForDownload(triggerAction: () => Promise<void>, saveName?: string): Promise<string> {
    this.logger.info('Waiting for download...');
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      triggerAction()
    ]);
    return this.saveDownload(download, saveName);
  }

  /**
   * Save a Playwright Download object to the downloads directory.
   */
  async saveDownload(download: Download, saveName?: string): Promise<string> {
    const fileName = saveName || download.suggestedFilename();
    const filePath = path.join(this.downloadDir, fileName);
    await download.saveAs(filePath);
    this.logger.success(`Download saved: ${filePath}`);
    return filePath;
  }

  /**
   * Verify a downloaded file exists and optionally check its size.
   */
  verifyDownload(filePath: string, minSizeBytes?: number): boolean {
    if (!fs.existsSync(filePath)) {
      this.logger.error(`File not found: ${filePath}`);
      return false;
    }
    if (minSizeBytes !== undefined) {
      const size = fs.statSync(filePath).size;
      if (size < minSizeBytes) {
        this.logger.error(`File too small: ${size} bytes (min ${minSizeBytes})`);
        return false;
      }
    }
    this.logger.success(`Download verified: ${filePath}`);
    return true;
  }

  // ── Uploads ──────────────────────────────────

  /**
   * Upload a file to a file input element.
   */
  async uploadFile(selector: string, filePath: string): Promise<void> {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Upload file not found: ${absolutePath}`);
    }
    this.logger.info(`Uploading file: ${absolutePath}`);
    await this.page.setInputFiles(selector, absolutePath);
    this.logger.success('File uploaded');
  }

  /**
   * Upload multiple files to a file input element.
   */
  async uploadMultipleFiles(selector: string, filePaths: string[]): Promise<void> {
    const resolved = filePaths.map(p => {
      const abs = path.resolve(p);
      if (!fs.existsSync(abs)) throw new Error(`Upload file not found: ${abs}`);
      return abs;
    });
    this.logger.info(`Uploading ${resolved.length} files`);
    await this.page.setInputFiles(selector, resolved);
    this.logger.success(`${resolved.length} files uploaded`);
  }

  /**
   * Clear a file input element.
   */
  async clearFileInput(selector: string): Promise<void> {
    await this.page.setInputFiles(selector, []);
    this.logger.info('File input cleared');
  }

  // ── File System Utilities ────────────────────

  /**
   * Read a JSON file and return parsed content.
   */
  readJson<T = unknown>(filePath: string): T {
    const content = fs.readFileSync(path.resolve(filePath), 'utf-8');
    return JSON.parse(content) as T;
  }

  /**
   * Write an object to a JSON file.
   */
  writeJson(filePath: string, data: unknown): void {
    const resolved = path.resolve(filePath);
    const dir = path.dirname(resolved);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(resolved, JSON.stringify(data, null, 2));
    this.logger.info(`JSON written: ${resolved}`);
  }

  /**
   * Read a CSV file and return rows as string arrays.
   */
  readCsv(filePath: string, delimiter: string = ','): string[][] {
    const content = fs.readFileSync(path.resolve(filePath), 'utf-8');
    return content.trim().split('\n').map(line => line.split(delimiter));
  }

  /**
   * Create a temporary file with given content and return its path.
   */
  createTempFile(fileName: string, content: string): string {
    const tempDir = path.join(this.downloadDir, 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, content);
    this.logger.info(`Temp file created: ${filePath}`);
    return filePath;
  }

  /**
   * Remove a file if it exists.
   */
  deleteFile(filePath: string): void {
    const resolved = path.resolve(filePath);
    if (fs.existsSync(resolved)) {
      fs.unlinkSync(resolved);
      this.logger.info(`Deleted: ${resolved}`);
    }
  }

  /**
   * Clean up the downloads directory.
   */
  cleanDownloads(): void {
    if (fs.existsSync(this.downloadDir)) {
      fs.readdirSync(this.downloadDir).forEach(file => {
        const filePath = path.join(this.downloadDir, file);
        if (fs.statSync(filePath).isFile()) fs.unlinkSync(filePath);
      });
      this.logger.info('Downloads directory cleaned');
    }
  }
}
