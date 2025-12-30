/**
 * @spec T004-e2e-testdata-planner
 * Blueprint validator - validates blueprint business rules and cross-blueprint dependencies
 */
import type { TestdataBlueprint, ValidationResult, ValidationIssue } from './schemas';
import type { BlueprintRegistry } from './blueprint-loader';
import * as logger from './utils/logger';

/**
 * Blueprint validator class
 * Validates business rules beyond schema validation
 */
export class BlueprintValidator {
  /**
   * Validate blueprint structure (basic checks)
   * @param blueprint - Blueprint to validate
   * @returns Validation result
   */
  validateStructure(blueprint: TestdataBlueprint): ValidationResult {
    const issues: ValidationIssue[] = [];

    // Check description length
    if (blueprint.description.length < 10) {
      issues.push({
        type: 'error',
        code: 'INVALID_DESCRIPTION',
        message: `Description too short (${blueprint.description.length} characters). Must be at least 10 characters.`,
      });
    }

    if (blueprint.description.length > 500) {
      issues.push({
        type: 'error',
        code: 'INVALID_DESCRIPTION',
        message: `Description too long (${blueprint.description.length} characters). Must be at most 500 characters.`,
      });
    }

    return {
      valid: issues.filter((i) => i.type === 'error').length === 0,
      issues,
    };
  }

  /**
   * Validate dependency references
   * @param blueprint - Blueprint to validate
   * @param registry - Blueprint registry to check dependencies against
   * @returns Validation result
   */
  validateDependencyReferences(
    blueprint: TestdataBlueprint,
    registry: BlueprintRegistry
  ): ValidationResult {
    const issues: ValidationIssue[] = [];

    // No dependencies is valid
    if (!blueprint.dependencies || blueprint.dependencies.length === 0) {
      return { valid: true, issues: [] };
    }

    // Check each dependency exists
    for (const depId of blueprint.dependencies) {
      if (!registry.has(depId)) {
        issues.push({
          type: 'error',
          code: 'MISSING_DEPENDENCY',
          message: `Dependency not found: ${depId}. Referenced by ${blueprint.id}.`,
          details: {
            blueprintId: blueprint.id,
            missingDependency: depId,
            availableBlueprints: registry.getAllIds(),
          },
        });
      }
    }

    // Check for circular dependencies
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const detectCycle = (currentId: string, path: string[]): boolean => {
      visited.add(currentId);
      recursionStack.add(currentId);

      const current = registry.get(currentId);
      if (!current || !current.dependencies || current.dependencies.length === 0) {
        recursionStack.delete(currentId);
        return false;
      }

      for (const depId of current.dependencies) {
        if (!registry.has(depId)) {
          continue; // Skip missing dependencies (already reported above)
        }

        if (!visited.has(depId)) {
          if (detectCycle(depId, [...path, depId])) {
            return true;
          }
        } else if (recursionStack.has(depId)) {
          // Found a cycle
          const cyclePath = [...path, depId];
          issues.push({
            type: 'error',
            code: 'CIRCULAR_DEPENDENCY',
            message: `Circular dependency detected: ${cyclePath.join(' → ')}`,
            details: {
              cycle: cyclePath,
            },
          });
          return true;
        }
      }

      recursionStack.delete(currentId);
      return false;
    };

    detectCycle(blueprint.id, [blueprint.id]);

    return {
      valid: issues.filter((i) => i.type === 'error').length === 0,
      issues,
    };
  }

  /**
   * Validate environment configuration
   * @param blueprint - Blueprint to validate
   * @param envProfile - Current environment profile
   * @returns Validation result
   */
  validateEnvironmentConfig(
    blueprint: TestdataBlueprint,
    envProfile: string
  ): ValidationResult {
    const issues: ValidationIssue[] = [];

    // No environment constraints means blueprint is available everywhere
    if (!blueprint.environments || blueprint.environments.length === 0) {
      return { valid: true, issues: [] };
    }

    // Check if current environment is allowed
    if (!blueprint.environments.includes(envProfile as never)) {
      issues.push({
        type: 'error',
        code: 'ENVIRONMENT_MISMATCH',
        message: `Blueprint ${blueprint.id} is not available for environment "${envProfile}". Allowed: ${blueprint.environments.join(', ')}`,
        details: {
          blueprintId: blueprint.id,
          currentEnv: envProfile,
          allowedEnvs: blueprint.environments,
        },
      });
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Validate strategy configuration
   * @param blueprint - Blueprint to validate
   * @returns Validation result
   */
  validateStrategyConfig(blueprint: TestdataBlueprint): ValidationResult {
    const issues: ValidationIssue[] = [];

    // Strategy-specific validations
    switch (blueprint.strategy.type) {
      case 'seed':
        // Seed strategy is simple, no extra validation needed
        break;

      case 'api':
        // Validate API endpoint format
        if (!blueprint.strategy.apiEndpoint.startsWith('/')) {
          issues.push({
            type: 'warning',
            code: 'API_ENDPOINT_FORMAT',
            message: `API endpoint should start with /. Got: ${blueprint.strategy.apiEndpoint}`,
          });
        }
        break;

      case 'db-script':
        // DB script strategy validation
        if (!blueprint.strategy.dbScriptPath.endsWith('.sql')) {
          issues.push({
            type: 'warning',
            code: 'DB_SCRIPT_EXTENSION',
            message: `DB script path should end with .sql. Got: ${blueprint.strategy.dbScriptPath}`,
          });
        }
        break;
    }

    // Warn about large timeouts (> 2 minutes)
    if (blueprint.timeout > 120000) {
      issues.push({
        type: 'warning',
        code: 'LARGE_TIMEOUT',
        message: `Timeout is very large (${blueprint.timeout}ms / ${Math.round(blueprint.timeout / 1000)}s). Consider optimizing data setup.`,
        details: {
          timeout: blueprint.timeout,
          recommendedMax: 120000,
        },
      });
    }

    return {
      valid: issues.filter((i) => i.type === 'error').length === 0,
      issues,
    };
  }

  /**
   * Validate a blueprint completely
   * Runs all validation checks
   * @param blueprint - Blueprint to validate
   * @param registry - Blueprint registry
   * @param envProfile - Current environment profile
   * @returns Combined validation result
   */
  validateAll(
    blueprint: TestdataBlueprint,
    registry: BlueprintRegistry,
    envProfile?: string
  ): ValidationResult {
    logger.debug(`Validating blueprint: ${blueprint.id}`);

    const results = [
      this.validateStructure(blueprint),
      this.validateDependencyReferences(blueprint, registry),
      this.validateStrategyConfig(blueprint),
    ];

    // Add environment validation if environment is specified
    if (envProfile) {
      results.push(this.validateEnvironmentConfig(blueprint, envProfile));
    }

    // Combine all issues
    const allIssues = results.flatMap((r) => r.issues);
    const hasErrors = allIssues.some((i) => i.type === 'error');

    return {
      valid: !hasErrors,
      issues: allIssues,
    };
  }
}
