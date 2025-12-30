/**
 * @spec T004-e2e-testdata-planner
 * Blueprint loader - loads and validates testdata blueprints from YAML files
 */
import fs from 'fs/promises';
import path from 'path';
import { loadYamlFile } from './utils/file-utils';
import { TestdataBlueprintSchema, type TestdataBlueprint } from './schemas';
import { BlueprintValidationError } from './utils/error-handler';
import * as logger from './utils/logger';

/**
 * Blueprint loader class
 * Responsible for loading blueprint files and maintaining a registry
 */
export class BlueprintLoader {
  /**
   * Load a single blueprint from a YAML file
   * @param filePath - Path to blueprint YAML file
   * @returns Validated blueprint
   * @throws BlueprintValidationError if validation fails
   */
  async loadBlueprint(filePath: string): Promise<TestdataBlueprint> {
    logger.debug(`Loading blueprint from ${filePath}`);

    try {
      // Load YAML file
      const data = await loadYamlFile(filePath);

      // Validate blueprint schema
      const blueprint = this.validateBlueprint(data);

      logger.debug(`Successfully loaded blueprint: ${blueprint.id}`);
      return blueprint;
    } catch (error) {
      if (error instanceof BlueprintValidationError) {
        throw error;
      }

      // Wrap other errors (file not found, invalid YAML, etc.)
      if (error instanceof Error) {
        throw new Error(`Failed to load blueprint from ${filePath}: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Load all blueprints from a directory
   * @param dirPath - Directory containing blueprint YAML files
   * @returns Map of blueprint ID to blueprint object
   */
  async loadAllBlueprints(dirPath: string): Promise<Map<string, TestdataBlueprint>> {
    logger.debug(`Loading all blueprints from ${dirPath}`);

    const blueprints = new Map<string, TestdataBlueprint>();
    const errors: Array<{ file: string; error: Error }> = [];

    try {
      // Read directory
      const files = await fs.readdir(dirPath);

      // Filter for blueprint files (*.blueprint.yaml or *.blueprint.yml)
      const blueprintFiles = files.filter(
        (file) => file.endsWith('.blueprint.yaml') || file.endsWith('.blueprint.yml')
      );

      if (blueprintFiles.length === 0) {
        logger.warn(`No blueprint files found in ${dirPath}`);
        return blueprints;
      }

      // Load each blueprint
      for (const file of blueprintFiles) {
        const filePath = path.join(dirPath, file);

        try {
          const blueprint = await this.loadBlueprint(filePath);
          blueprints.set(blueprint.id, blueprint);
        } catch (error) {
          // Collect errors but continue loading other blueprints
          if (error instanceof Error) {
            logger.warn(`Failed to load blueprint ${file}: ${error.message}`);
            errors.push({ file, error });
          }
        }
      }

      logger.info(
        `Loaded ${blueprints.size} blueprint(s) from ${dirPath} (${errors.length} failed)`
      );

      // Log collected errors
      if (errors.length > 0) {
        logger.debug('Failed blueprints:', errors);
      }

      return blueprints;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load blueprints from ${dirPath}: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Validate blueprint data against schema
   * @param data - Raw blueprint data
   * @returns Validated blueprint
   * @throws BlueprintValidationError if validation fails
   */
  validateBlueprint(data: unknown): TestdataBlueprint {
    const result = TestdataBlueprintSchema.safeParse(data);

    if (!result.success) {
      // Extract blueprint ID if available for better error message
      const blueprintId =
        typeof data === 'object' && data !== null && 'id' in data
          ? String(data.id)
          : 'unknown';

      // Format Zod errors
      const errors = result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);

      throw new BlueprintValidationError(blueprintId, errors.join('; '));
    }

    return result.data;
  }
}

/**
 * Blueprint registry - maintains a collection of loaded blueprints
 */
export class BlueprintRegistry {
  private blueprints: Map<string, TestdataBlueprint> = new Map();

  /**
   * Register a blueprint
   * @param blueprint - Blueprint to register
   */
  register(blueprint: TestdataBlueprint): void {
    this.blueprints.set(blueprint.id, blueprint);
  }

  /**
   * Get a blueprint by ID
   * @param id - Blueprint ID
   * @returns Blueprint or undefined if not found
   */
  get(id: string): TestdataBlueprint | undefined {
    return this.blueprints.get(id);
  }

  /**
   * Check if a blueprint exists
   * @param id - Blueprint ID
   * @returns True if blueprint exists
   */
  has(id: string): boolean {
    return this.blueprints.has(id);
  }

  /**
   * Get all blueprint IDs
   * @returns Array of blueprint IDs
   */
  getAllIds(): string[] {
    return Array.from(this.blueprints.keys());
  }

  /**
   * Get all blueprints
   * @returns Array of blueprints
   */
  getAll(): TestdataBlueprint[] {
    return Array.from(this.blueprints.values());
  }

  /**
   * Get the number of registered blueprints
   * @returns Count
   */
  size(): number {
    return this.blueprints.size;
  }

  /**
   * Clear all blueprints
   */
  clear(): void {
    this.blueprints.clear();
  }

  /**
   * Load blueprints from a map
   * @param blueprints - Map of blueprints
   */
  loadFromMap(blueprints: Map<string, TestdataBlueprint>): void {
    blueprints.forEach((blueprint) => this.register(blueprint));
  }
}
