/**
 * @spec T003-e2e-runner
 * Unit tests for file-utils.ts (T012)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  readJsonFile,
  writeJsonFile,
  fileExists,
  ensureDirExists,
  deleteFile,
} from '@/utils/file-utils';

const TEST_DIR = join(__dirname, 'fixtures', 'temp');

describe('file-utils', () => {
  beforeEach(() => {
    // Clean up test directory before each test
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up test directory after each test
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('fileExists', () => {
    it('should return true for existing file', () => {
      mkdirSync(TEST_DIR, { recursive: true });
      const filePath = join(TEST_DIR, 'test.json');
      writeFileSync(filePath, '{}');

      expect(fileExists(filePath)).toBe(true);
    });

    it('should return false for non-existing file', () => {
      const filePath = join(TEST_DIR, 'non-existing.json');

      expect(fileExists(filePath)).toBe(false);
    });

    it('should return true for existing directory', () => {
      mkdirSync(TEST_DIR, { recursive: true });

      expect(fileExists(TEST_DIR)).toBe(true);
    });
  });

  describe('ensureDirExists', () => {
    it('should create directory if it does not exist', () => {
      const dirPath = join(TEST_DIR, 'new-dir');

      ensureDirExists(dirPath);

      expect(existsSync(dirPath)).toBe(true);
    });

    it('should create nested directories', () => {
      const dirPath = join(TEST_DIR, 'level1', 'level2', 'level3');

      ensureDirExists(dirPath);

      expect(existsSync(dirPath)).toBe(true);
    });

    it('should not throw if directory already exists', () => {
      mkdirSync(TEST_DIR, { recursive: true });

      expect(() => ensureDirExists(TEST_DIR)).not.toThrow();
      expect(existsSync(TEST_DIR)).toBe(true);
    });
  });

  describe('readJsonFile', () => {
    it('should read valid JSON file', () => {
      mkdirSync(TEST_DIR, { recursive: true });
      const filePath = join(TEST_DIR, 'config.json');
      const data = { env_profile: 'test', baseURL: 'http://localhost' };
      writeFileSync(filePath, JSON.stringify(data, null, 2));

      const result = readJsonFile(filePath);

      expect(result).toEqual(data);
    });

    it('should throw error for non-existing file', () => {
      const filePath = join(TEST_DIR, 'non-existing.json');

      expect(() => readJsonFile(filePath)).toThrow();
    });

    it('should throw error for invalid JSON', () => {
      mkdirSync(TEST_DIR, { recursive: true });
      const filePath = join(TEST_DIR, 'invalid.json');
      writeFileSync(filePath, '{ invalid json }');

      expect(() => readJsonFile(filePath)).toThrow(/Failed to parse JSON/);
    });

    it('should preserve complex nested structures', () => {
      mkdirSync(TEST_DIR, { recursive: true });
      const filePath = join(TEST_DIR, 'complex.json');
      const data = {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' },
        },
        nullValue: null,
      };
      writeFileSync(filePath, JSON.stringify(data));

      const result = readJsonFile(filePath);

      expect(result).toEqual(data);
    });
  });

  describe('writeJsonFile', () => {
    it('should write JSON data to file', () => {
      mkdirSync(TEST_DIR, { recursive: true });
      const filePath = join(TEST_DIR, 'output.json');
      const data = { env_profile: 'staging', timeout: 5000 };

      writeJsonFile(filePath, data);

      expect(existsSync(filePath)).toBe(true);
      const content = JSON.parse(readFileSync(filePath, 'utf-8'));
      expect(content).toEqual(data);
    });

    it('should create parent directories if they do not exist', () => {
      const filePath = join(TEST_DIR, 'nested', 'deep', 'output.json');
      const data = { key: 'value' };

      writeJsonFile(filePath, data);

      expect(existsSync(filePath)).toBe(true);
      const content = JSON.parse(readFileSync(filePath, 'utf-8'));
      expect(content).toEqual(data);
    });

    it('should format JSON with 2-space indentation', () => {
      mkdirSync(TEST_DIR, { recursive: true });
      const filePath = join(TEST_DIR, 'formatted.json');
      const data = { a: 1, b: { c: 2 } };

      writeJsonFile(filePath, data);

      const rawContent = readFileSync(filePath, 'utf-8');
      expect(rawContent).toContain('  "a": 1');
      expect(rawContent).toContain('  "b": {');
    });

    it('should overwrite existing file', () => {
      mkdirSync(TEST_DIR, { recursive: true });
      const filePath = join(TEST_DIR, 'overwrite.json');
      writeFileSync(filePath, JSON.stringify({ old: 'data' }));

      const newData = { new: 'data' };
      writeJsonFile(filePath, newData);

      const content = JSON.parse(readFileSync(filePath, 'utf-8'));
      expect(content).toEqual(newData);
      expect(content).not.toHaveProperty('old');
    });
  });

  describe('deleteFile', () => {
    it('should delete existing file', () => {
      mkdirSync(TEST_DIR, { recursive: true });
      const filePath = join(TEST_DIR, 'to-delete.json');
      writeFileSync(filePath, '{}');

      deleteFile(filePath);

      expect(existsSync(filePath)).toBe(false);
    });

    it('should not throw if file does not exist', () => {
      const filePath = join(TEST_DIR, 'non-existing.json');

      expect(() => deleteFile(filePath)).not.toThrow();
    });

    it('should delete directory recursively', () => {
      const dirPath = join(TEST_DIR, 'dir-to-delete');
      mkdirSync(dirPath, { recursive: true });
      writeFileSync(join(dirPath, 'file.txt'), 'content');

      deleteFile(dirPath);

      expect(existsSync(dirPath)).toBe(false);
    });

    it('should delete nested directories with multiple files', () => {
      const dirPath = join(TEST_DIR, 'nested-delete');
      const subDir = join(dirPath, 'subdir');
      mkdirSync(subDir, { recursive: true });
      writeFileSync(join(dirPath, 'file1.txt'), 'content1');
      writeFileSync(join(subDir, 'file2.txt'), 'content2');

      deleteFile(dirPath);

      expect(existsSync(dirPath)).toBe(false);
    });
  });
});
