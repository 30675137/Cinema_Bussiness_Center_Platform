/**
 * @spec T003-e2e-runner
 * File utility functions for cross-platform file I/O operations (T009)
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { dirname } from 'path';

/**
 * Check if a file or directory exists
 * @param filePath - Absolute or relative path to file/directory
 * @returns true if file/directory exists, false otherwise
 */
export function fileExists(filePath: string): boolean {
  return existsSync(filePath);
}

/**
 * Ensure a directory exists, creating it (and parent directories) if necessary
 * @param dirPath - Directory path to ensure exists
 */
export function ensureDirExists(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Read and parse a JSON file
 * @param filePath - Path to JSON file
 * @returns Parsed JSON data
 * @throws Error if file does not exist or contains invalid JSON
 */
export function readJsonFile<T = unknown>(filePath: string): T {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse JSON from ${filePath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Write data to a JSON file with 2-space indentation
 * Creates parent directories if they do not exist
 * @param filePath - Path to JSON file
 * @param data - Data to write (will be serialized to JSON)
 */
export function writeJsonFile(filePath: string, data: unknown): void {
  const dir = dirname(filePath);
  ensureDirExists(dir);

  const jsonContent = JSON.stringify(data, null, 2);
  writeFileSync(filePath, jsonContent, 'utf-8');
}

/**
 * Delete a file or directory
 * Does not throw if file/directory does not exist
 * @param filePath - Path to file or directory to delete
 */
export function deleteFile(filePath: string): void {
  if (existsSync(filePath)) {
    rmSync(filePath, { recursive: true, force: true });
  }
}
