/**
 * @spec T004-e2e-testdata-planner
 * Strategy selector - selects and validates data supply strategies from blueprints
 */
import type { TestdataBlueprint, DataSupplyStrategy } from './schemas';
import * as logger from './utils/logger';

/**
 * Strategy selector class
 * Selects the appropriate data supply strategy from a blueprint
 */
export class StrategySelector {
  /**
   * Select strategy from blueprint
   * @param blueprint - Blueprint containing strategy configuration
   * @returns Data supply strategy
   */
  selectStrategy(blueprint: TestdataBlueprint): DataSupplyStrategy {
    logger.debug(`Selecting strategy for blueprint: ${blueprint.id}`);

    const strategy = blueprint.strategy;

    // Validate strategy configuration
    this.validateStrategyConfig(strategy);

    logger.debug(`Selected ${strategy.type} strategy for ${blueprint.id}`);

    return strategy;
  }

  /**
   * Validate strategy configuration
   * @param strategy - Strategy to validate
   * @throws Error if strategy configuration is invalid
   */
  validateStrategyConfig(strategy: DataSupplyStrategy): void {
    switch (strategy.type) {
      case 'seed':
        if (!strategy.seedFilePath) {
          throw new Error('Seed strategy requires seedFilePath');
        }
        break;

      case 'api':
        if (!strategy.apiEndpoint) {
          throw new Error('API strategy requires apiEndpoint');
        }
        if (!strategy.method) {
          throw new Error('API strategy requires method');
        }
        // Validate endpoint format (should start with /)
        if (!strategy.apiEndpoint.startsWith('/')) {
          logger.warn(
            `API endpoint should start with /. Got: ${strategy.apiEndpoint}`
          );
        }
        break;

      case 'db-script':
        if (!strategy.dbScriptPath) {
          throw new Error('DB-script strategy requires dbScriptPath');
        }
        // Validate script path (should end with .sql)
        if (!strategy.dbScriptPath.endsWith('.sql')) {
          logger.warn(
            `DB script path should end with .sql. Got: ${strategy.dbScriptPath}`
          );
        }
        break;

      default:
        // TypeScript discriminated union should prevent this
        const exhaustive: never = strategy;
        throw new Error(`Unknown strategy type: ${exhaustive}`);
    }
  }

  /**
   * Get strategy type from blueprint
   * @param blueprint - Blueprint to get strategy type from
   * @returns Strategy type string
   */
  getStrategyType(blueprint: TestdataBlueprint): 'seed' | 'api' | 'db-script' {
    return blueprint.strategy.type;
  }
}
