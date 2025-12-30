/**
 * @spec T004-e2e-testdata-planner
 * Lifecycle generator - generates setup and teardown step sequences
 */
import type { TestdataBlueprint, LifecyclePlan, Step } from './schemas';
import * as logger from './utils/logger';

/**
 * Lifecycle generator class
 * Responsible for generating lifecycle plans with setup and teardown steps
 */
export class LifecycleGenerator {
  /**
   * Generate lifecycle plan for a blueprint
   * @param blueprint - Target blueprint to generate plan for
   * @param dependencyOrder - Ordered list of blueprint IDs (dependencies first)
   * @param allBlueprints - Map of all blueprint IDs to blueprints
   * @returns Lifecycle plan
   */
  generateLifecyclePlan(
    blueprint: TestdataBlueprint,
    dependencyOrder: string[],
    allBlueprints: Map<string, TestdataBlueprint>
  ): LifecyclePlan {
    logger.debug(`Generating lifecycle plan for ${blueprint.id}`);

    // Get dependency blueprints in order
    const dependencies: TestdataBlueprint[] = [];
    for (const depId of dependencyOrder) {
      if (depId !== blueprint.id) {
        const depBlueprint = allBlueprints.get(depId);
        if (depBlueprint) {
          dependencies.push(depBlueprint);
        }
      }
    }

    // Generate setup steps
    const setupSteps = this.generateSetupSteps(blueprint, dependencies);

    // Generate teardown steps
    const teardownSteps = this.generateTeardownSteps(setupSteps);

    // Calculate total timeout
    const setupTimeout = setupSteps.reduce((sum, step) => sum + step.timeout, 0);
    const teardownTimeout = teardownSteps.reduce((sum, step) => sum + step.timeout, 0);
    const totalTimeout = setupTimeout + teardownTimeout;

    const plan: LifecyclePlan = {
      testdataRef: blueprint.id,
      version: blueprint.version,
      scope: blueprint.scope,
      setupSteps,
      teardownSteps,
      totalTimeout,
      generatedAt: new Date().toISOString(),
    };

    logger.debug(
      `Generated plan with ${setupSteps.length} setup and ${teardownSteps.length} teardown steps`
    );

    return plan;
  }

  /**
   * Generate setup steps for blueprint and its dependencies
   * @param blueprint - Target blueprint
   * @param dependencies - Dependency blueprints (already in correct order)
   * @returns Array of setup steps
   */
  generateSetupSteps(
    blueprint: TestdataBlueprint,
    dependencies: TestdataBlueprint[]
  ): Step[] {
    logger.debug(
      `Generating setup steps for ${blueprint.id} with ${dependencies.length} dependencies`
    );

    const steps: Step[] = [];

    // Create steps for dependencies first
    for (const dep of dependencies) {
      const step = this.createStepFromBlueprint(dep, 'setup');
      steps.push(step);
    }

    // Create step for target blueprint
    const targetStep = this.createStepFromBlueprint(blueprint, 'setup');
    steps.push(targetStep);

    // Assign dependencies between steps
    const blueprintDeps = new Map<string, string[]>();

    // Add blueprint's own dependencies
    if (blueprint.dependencies && blueprint.dependencies.length > 0) {
      blueprintDeps.set(blueprint.id, blueprint.dependencies);
    }

    // Add dependencies for dependency blueprints
    for (const dep of dependencies) {
      if (dep.dependencies && dep.dependencies.length > 0) {
        blueprintDeps.set(dep.id, dep.dependencies);
      }
    }

    return this.assignStepDependencies(steps, blueprintDeps);
  }

  /**
   * Generate teardown steps (reverse of setup)
   * @param setupSteps - Setup steps to reverse
   * @returns Array of teardown steps
   */
  generateTeardownSteps(setupSteps: Step[]): Step[] {
    logger.debug(`Generating teardown steps from ${setupSteps.length} setup steps`);

    const teardownSteps: Step[] = [];

    // Reverse the setup steps
    for (let i = setupSteps.length - 1; i >= 0; i--) {
      const setupStep = setupSteps[i];

      // Check if teardown is needed (from config or blueprint setting)
      const needsTeardown = setupStep.config.teardown === true;

      if (needsTeardown) {
        const teardownStep: Step = {
          id: `teardown-${setupStep.testdataRef}`,
          action: this.getTeardownAction(setupStep.action),
          testdataRef: setupStep.testdataRef,
          timeout: setupStep.timeout,
          dependsOn: [],
          config: { ...setupStep.config },
        };

        if (setupStep.optional) {
          teardownStep.optional = true;
        }

        teardownSteps.push(teardownStep);
      }
    }

    logger.debug(`Generated ${teardownSteps.length} teardown steps`);

    return teardownSteps;
  }

  /**
   * Assign step dependencies based on blueprint dependencies
   * @param steps - Steps to assign dependencies to
   * @param blueprintDeps - Map of blueprint ID to its dependency IDs
   * @returns Steps with assigned dependencies
   */
  assignStepDependencies(
    steps: Step[],
    blueprintDeps: Map<string, string[]>
  ): Step[] {
    logger.debug('Assigning step dependencies');

    // Create a map of testdataRef to step ID
    const refToStepId = new Map<string, string>();
    for (const step of steps) {
      refToStepId.set(step.testdataRef, step.id);
    }

    // Assign dependencies
    for (const step of steps) {
      const deps = blueprintDeps.get(step.testdataRef) || [];

      step.dependsOn = deps
        .map((depRef) => refToStepId.get(depRef))
        .filter((id): id is string => id !== undefined);
    }

    return steps;
  }

  /**
   * Create a step from a blueprint
   * @param blueprint - Blueprint to create step from
   * @param phase - Setup or teardown phase
   * @returns Step
   */
  private createStepFromBlueprint(
    blueprint: TestdataBlueprint,
    phase: 'setup' | 'teardown'
  ): Step {
    const action = this.getActionForStrategy(blueprint.strategy.type, phase);

    const step: Step = {
      id: `${phase}-${blueprint.id}`,
      action,
      testdataRef: blueprint.id,
      timeout: blueprint.timeout,
      dependsOn: [],
      config: {
        ...blueprint.strategy,
        teardown: blueprint.teardown,
      },
    };

    if (blueprint.optional) {
      step.optional = true;
    }

    return step;
  }

  /**
   * Get action name for strategy type and phase
   * @param strategyType - Strategy type
   * @param phase - Setup or teardown phase
   * @returns Action name
   */
  private getActionForStrategy(
    strategyType: 'seed' | 'api' | 'db-script',
    phase: 'setup' | 'teardown'
  ): string {
    if (phase === 'setup') {
      switch (strategyType) {
        case 'seed':
          return 'load-seed';
        case 'api':
          return 'call-api';
        case 'db-script':
          return 'execute-sql';
      }
    } else {
      switch (strategyType) {
        case 'seed':
          return 'cleanup-seed';
        case 'api':
          return 'cleanup-api';
        case 'db-script':
          return 'cleanup-db';
      }
    }
  }

  /**
   * Get teardown action for a setup action
   * @param setupAction - Setup action name
   * @returns Teardown action name
   */
  private getTeardownAction(setupAction: string): string {
    switch (setupAction) {
      case 'load-seed':
        return 'cleanup-seed';
      case 'call-api':
        return 'cleanup-api';
      case 'execute-sql':
        return 'cleanup-db';
      default:
        return `cleanup-${setupAction}`;
    }
  }
}
