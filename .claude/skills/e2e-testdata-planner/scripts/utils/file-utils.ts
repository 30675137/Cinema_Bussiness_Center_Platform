/**
 * @spec T004-e2e-testdata-planner
 * File utility functions for loading/saving YAML and JSON files
 */
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

/**
 * Load and parse a YAML file
 * @param filePath - Absolute or relative path to YAML file
 * @returns Parsed YAML content
 * @throws Error if file not found or invalid YAML format
 */
export async function loadYamlFile(filePath: string): Promise<unknown> {
  validateFilePath(filePath);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return yaml.load(content);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load YAML file ${filePath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Load and parse a JSON file
 * @param filePath - Absolute or relative path to JSON file
 * @returns Parsed JSON content
 * @throws Error if file not found or invalid JSON format
 */
export async function loadJsonFile(filePath: string): Promise<unknown> {
  validateFilePath(filePath);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load JSON file ${filePath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Save data to a YAML file
 * @param filePath - Absolute or relative path to YAML file
 * @param data - Data to save
 * @throws Error if write fails
 */
export async function saveYamlFile(filePath: string, data: unknown): Promise<void> {
  validateFilePath(filePath);

  try {
    // Ensure parent directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    const yamlContent = yaml.dump(data, {
      indent: 2,
      lineWidth: 100,
      noRefs: true,
    });
    await fs.writeFile(filePath, yamlContent, 'utf-8');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to save YAML file ${filePath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Save data to a JSON file with pretty formatting
 * @param filePath - Absolute or relative path to JSON file
 * @param data - Data to save
 * @throws Error if write fails
 */
export async function saveJsonFile(filePath: string, data: unknown): Promise<void> {
  validateFilePath(filePath);

  try {
    // Ensure parent directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    const jsonContent = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonContent, 'utf-8');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to save JSON file ${filePath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Validate file path to prevent path traversal attacks
 * @param filePath - File path to validate
 * @throws Error if path contains dangerous patterns
 */
export function validateFilePath(filePath: string): void {
  // Check for .. patterns BEFORE normalization to catch traversal attempts
  if (filePath.includes('../') || filePath.includes('..\\')) {
    // Normalize to check if it's safe after resolution
    const normalized = path.normalize(filePath);

    // If it starts with .., it's definitely trying to go outside
    if (normalized.startsWith('..')) {
      throw new Error(
        `Dangerous path detected: ${filePath}. Path traversal is not allowed (../ pattern)`
      );
    }

    // For absolute paths with .., reject if the input had ../ pattern
    // (even if normalized doesn't, the intent was traversal)
    if (path.isAbsolute(filePath)) {
      throw new Error(
        `Dangerous path detected: ${filePath}. Path traversal is not allowed in absolute paths`
      );
    }
  }
}

/**
 * Check if a file or directory exists
 * @param filePath - Path to check
 * @returns True if exists, false otherwise
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
