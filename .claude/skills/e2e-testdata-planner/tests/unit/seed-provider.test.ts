/**
 * @spec T004-e2e-testdata-planner
 * Unit tests for Seed Provider
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { SeedProvider } from '../../scripts/providers/seed-provider';
import { SeedFileNotFoundError } from '../../scripts/utils/error-handler';

const TEST_SEEDS_DIR = path.join(__dirname, '../fixtures/seeds');

describe('SeedProvider', () => {
  let provider: SeedProvider;

  beforeEach(async () => {
    provider = new SeedProvider();
    // Create test seeds directory
    await fs.mkdir(TEST_SEEDS_DIR, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test seeds
    await fs.rm(TEST_SEEDS_DIR, { recursive: true, force: true });
  });

  describe('loadSeed', () => {
    it('should load JSON seed file', async () => {
      const seedPath = path.join(TEST_SEEDS_DIR, 'users.json');
      const seedData = [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
      ];
      await fs.writeFile(seedPath, JSON.stringify(seedData), 'utf-8');

      const config = {
        type: 'seed' as const,
        seedFilePath: seedPath,
      };

      const result = await provider.loadSeed(config);

      expect(result).toEqual(seedData);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Alice');
    });

    it('should load YAML seed file', async () => {
      const seedPath = path.join(TEST_SEEDS_DIR, 'stores.yaml');
      const seedContent = `
- id: 1
  name: Store A
  location: Beijing
- id: 2
  name: Store B
  location: Shanghai
`;
      await fs.writeFile(seedPath, seedContent, 'utf-8');

      const config = {
        type: 'seed' as const,
        seedFilePath: seedPath,
      };

      const result = await provider.loadSeed(config);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Store A');
      expect(result[1].location).toBe('Shanghai');
    });

    it('should throw SeedFileNotFoundError when file does not exist', async () => {
      const config = {
        type: 'seed' as const,
        seedFilePath: path.join(TEST_SEEDS_DIR, 'nonexistent.json'),
      };

      await expect(provider.loadSeed(config)).rejects.toThrow(SeedFileNotFoundError);
    });

    it('should throw error for invalid JSON format', async () => {
      const seedPath = path.join(TEST_SEEDS_DIR, 'invalid.json');
      const invalidJson = '{ invalid json [unclosed';
      await fs.writeFile(seedPath, invalidJson, 'utf-8');

      const config = {
        type: 'seed' as const,
        seedFilePath: seedPath,
      };

      await expect(provider.loadSeed(config)).rejects.toThrow();
    });

    it('should throw error for invalid YAML format', async () => {
      const seedPath = path.join(TEST_SEEDS_DIR, 'invalid.yaml');
      const invalidYaml = `
        - id: 1
          invalid: [unclosed
      `;
      await fs.writeFile(seedPath, invalidYaml, 'utf-8');

      const config = {
        type: 'seed' as const,
        seedFilePath: seedPath,
      };

      await expect(provider.loadSeed(config)).rejects.toThrow();
    });

    it('should load seed file with .yml extension', async () => {
      const seedPath = path.join(TEST_SEEDS_DIR, 'products.yml');
      const seedContent = `
- id: 1
  name: Product A
  price: 100
`;
      await fs.writeFile(seedPath, seedContent, 'utf-8');

      const config = {
        type: 'seed' as const,
        seedFilePath: seedPath,
      };

      const result = await provider.loadSeed(config);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Product A');
    });

    it('should handle empty JSON array', async () => {
      const seedPath = path.join(TEST_SEEDS_DIR, 'empty.json');
      await fs.writeFile(seedPath, '[]', 'utf-8');

      const config = {
        type: 'seed' as const,
        seedFilePath: seedPath,
      };

      const result = await provider.loadSeed(config);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle empty YAML array', async () => {
      const seedPath = path.join(TEST_SEEDS_DIR, 'empty.yaml');
      await fs.writeFile(seedPath, '[]', 'utf-8');

      const config = {
        type: 'seed' as const,
        seedFilePath: seedPath,
      };

      const result = await provider.loadSeed(config);

      expect(result).toEqual([]);
    });
  });

  describe('validateSeedFile', () => {
    it('should validate existing seed file', async () => {
      const seedPath = path.join(TEST_SEEDS_DIR, 'valid.json');
      await fs.writeFile(seedPath, '[]', 'utf-8');

      expect(() => provider.validateSeedFile(seedPath)).not.toThrow();
    });

    it('should throw error for non-existent file', () => {
      const seedPath = path.join(TEST_SEEDS_DIR, 'nonexistent.json');

      expect(() => provider.validateSeedFile(seedPath)).toThrow(SeedFileNotFoundError);
    });

    it('should accept .json extension', async () => {
      const seedPath = path.join(TEST_SEEDS_DIR, 'test.json');
      await fs.writeFile(seedPath, '[]', 'utf-8');

      expect(() => provider.validateSeedFile(seedPath)).not.toThrow();
    });

    it('should accept .yaml extension', async () => {
      const seedPath = path.join(TEST_SEEDS_DIR, 'test.yaml');
      await fs.writeFile(seedPath, '[]', 'utf-8');

      expect(() => provider.validateSeedFile(seedPath)).not.toThrow();
    });

    it('should accept .yml extension', async () => {
      const seedPath = path.join(TEST_SEEDS_DIR, 'test.yml');
      await fs.writeFile(seedPath, '[]', 'utf-8');

      expect(() => provider.validateSeedFile(seedPath)).not.toThrow();
    });
  });

  describe('getSeedFileSize', () => {
    it('should return file size in bytes', async () => {
      const seedPath = path.join(TEST_SEEDS_DIR, 'size-test.json');
      const data = JSON.stringify({ test: 'data' });
      await fs.writeFile(seedPath, data, 'utf-8');

      const size = await provider.getSeedFileSize(seedPath);

      expect(size).toBeGreaterThan(0);
      expect(size).toBe(Buffer.byteLength(data, 'utf-8'));
    });

    it('should warn for large seed files (>10MB)', async () => {
      const seedPath = path.join(TEST_SEEDS_DIR, 'large.json');
      // Create a file larger than 10MB
      const largeData = JSON.stringify(new Array(500000).fill({ data: 'test data string' }));
      await fs.writeFile(seedPath, largeData, 'utf-8');

      const size = await provider.getSeedFileSize(seedPath);

      expect(size).toBeGreaterThan(10 * 1024 * 1024); // >10MB
    });
  });

  describe('isSeedFileTooLarge', () => {
    it('should return false for small files (<10MB)', () => {
      const size = 5 * 1024 * 1024; // 5MB

      const result = provider.isSeedFileTooLarge(size);

      expect(result).toBe(false);
    });

    it('should return true for large files (>10MB)', () => {
      const size = 15 * 1024 * 1024; // 15MB

      const result = provider.isSeedFileTooLarge(size);

      expect(result).toBe(true);
    });

    it('should return true for very large files (>50MB)', () => {
      const size = 60 * 1024 * 1024; // 60MB

      const result = provider.isSeedFileTooLarge(size);

      expect(result).toBe(true);
    });
  });
});
