/**
 * @spec T004-e2e-testdata-planner
 * Seed provider - loads test data from JSON/YAML seed files
 */
import fs from 'fs/promises';
import path from 'path';
import { loadYamlFile, loadJsonFile, fileExists } from '../utils/file-utils';
import { SeedFileNotFoundError } from '../utils/error-handler';
import * as logger from '../utils/logger';
import type { SeedStrategyConfig } from '../schemas';

/**
 * File size thresholds
 */
const LARGE_FILE_THRESHOLD_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_FILE_THRESHOLD_BYTES = 50 * 1024 * 1024; // 50MB (warning threshold)

/**
 * Seed provider class
 * Responsible for loading test data from seed files
 */
export class SeedProvider {
  /**
   * Load seed data from file
   * @param config - Seed strategy configuration
   * @returns Array of seed data
   * @throws SeedFileNotFoundError if file does not exist
   * @throws Error if file format is invalid
   */
  async loadSeed(config: SeedStrategyConfig): Promise<any[]> {
    const filePath = config.seedFilePath;

    logger.debug(`Loading seed file: ${filePath}`);

    // Check if file exists
    const exists = await fileExists(filePath);
    if (!exists) {
      throw new SeedFileNotFoundError(filePath);
    }

    // Check file size
    const fileSize = await this.getSeedFileSize(filePath);
    if (this.isSeedFileTooLarge(fileSize)) {
      logger.warn(
        `Seed file is large (${Math.round(fileSize / 1024 / 1024)}MB). ` +
          `Consider using db-script strategy for better performance.`
      );
    }

    // Load based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let data: any;

    try {
      if (ext === '.json') {
        data = await loadJsonFile(filePath);
      } else if (ext === '.yaml' || ext === '.yml') {
        data = await loadYamlFile(filePath);
      } else {
        throw new Error(
          `Unsupported seed file extension: ${ext}. Supported: .json, .yaml, .yml`
        );
      }

      // Ensure data is an array
      if (!Array.isArray(data)) {
        throw new Error(
          `Seed file must contain an array. Got: ${typeof data}`
        );
      }

      logger.debug(`Loaded ${data.length} records from ${filePath}`);

      return data;
    } catch (error) {
      if (error instanceof SeedFileNotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new Error(`Failed to load seed file ${filePath}: ${error.message}`);
      }

      throw error;
    }
  }

  /**
   * Validate seed file exists and has correct format
   * @param filePath - Path to seed file
   * @throws SeedFileNotFoundError if file does not exist
   * @throws Error if file extension is invalid
   */
  validateSeedFile(filePath: string): void {
    // Check file extension
    const ext = path.extname(filePath).toLowerCase();
    if (!['.json', '.yaml', '.yml'].includes(ext)) {
      throw new Error(
        `Invalid seed file extension: ${ext}. Supported: .json, .yaml, .yml`
      );
    }

    // Check if file exists (synchronous check for validation)
    try {
      const fs = require('fs');
      fs.accessSync(filePath, fs.constants.F_OK);
    } catch {
      throw new SeedFileNotFoundError(filePath);
    }
  }

  /**
   * Get seed file size in bytes
   * @param filePath - Path to seed file
   * @returns File size in bytes
   */
  async getSeedFileSize(filePath: string): Promise<number> {
    const stats = await fs.stat(filePath);
    return stats.size;
  }

  /**
   * Check if seed file is too large
   * @param sizeBytes - File size in bytes
   * @returns True if file is larger than threshold
   */
  isSeedFileTooLarge(sizeBytes: number): boolean {
    return sizeBytes > LARGE_FILE_THRESHOLD_BYTES;
  }
}
