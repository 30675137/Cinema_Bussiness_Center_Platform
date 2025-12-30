/**
 * @spec T004-e2e-testdata-planner
 * Zod schemas for E2E testdata planner
 */
import { z } from 'zod';

// Common patterns
const TestdataRefPattern = /^TD-[A-Z]+-[A-Z0-9]+$/;
const SemanticVersionPattern = /^\d+\.\d+\.\d+$/;

// Fixture scope enum
export const FixtureScopeSchema = z.enum(['test', 'worker', 'global']);
export type FixtureScope = z.infer<typeof FixtureScopeSchema>;

// Environment profile enum
export const EnvironmentProfileSchema = z.enum(['ci', 'staging', 'production', 'local']);
export type EnvironmentProfile = z.infer<typeof EnvironmentProfileSchema>;

// ============================================================================
// Strategy Configurations
// ============================================================================

// Seed strategy configuration
export const SeedStrategyConfigSchema = z.object({
  type: z.literal('seed'),
  seedFilePath: z.string().min(1),
  seedKey: z.string().optional(),
  encoding: z.enum(['utf-8', 'utf-16']).default('utf-8'),
});
export type SeedStrategyConfig = z.infer<typeof SeedStrategyConfigSchema>;

// API authentication
export const ApiAuthenticationSchema = z.object({
  type: z.enum(['bearer', 'apiKey', 'basic']),
  tokenEnvVar: z.string().optional(),
  apiKeyHeader: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
});
export type ApiAuthentication = z.infer<typeof ApiAuthenticationSchema>;

// API strategy configuration
export const ApiStrategyConfigSchema = z.object({
  type: z.literal('api'),
  apiEndpoint: z.string().min(1),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  requestBody: z.record(z.unknown()).optional(),
  requestHeaders: z.record(z.string()).optional(),
  authentication: ApiAuthenticationSchema.optional(),
  responseMapping: z.record(z.string()).optional(),
  timeout: z.number().min(1000).max(120000).default(30000),
});
export type ApiStrategyConfig = z.infer<typeof ApiStrategyConfigSchema>;

// DB Script strategy configuration
export const DbScriptStrategyConfigSchema = z.object({
  type: z.literal('db-script'),
  dbScriptPath: z.string().min(1),
  transactional: z.boolean().default(true),
  outputMapping: z.record(z.string()).optional(),
  timeout: z.number().min(1000).max(300000).default(60000),
});
export type DbScriptStrategyConfig = z.infer<typeof DbScriptStrategyConfigSchema>;

// Union of all strategy configs
export const DataSupplyStrategySchema = z.discriminatedUnion('type', [
  SeedStrategyConfigSchema,
  ApiStrategyConfigSchema,
  DbScriptStrategyConfigSchema,
]);
export type DataSupplyStrategy = z.infer<typeof DataSupplyStrategySchema>;

// ============================================================================
// Testdata Blueprint
// ============================================================================

export const TestdataBlueprintSchema = z.object({
  // Core identification
  id: z.string().regex(TestdataRefPattern, {
    message: 'Invalid testdata_ref format. Expected: TD-<ENTITY>-<ID> (e.g., TD-ORDER-001)',
  }),
  version: z.string().regex(SemanticVersionPattern, {
    message: 'Invalid version format. Expected: X.Y.Z (e.g., 1.0.0)',
  }),
  description: z.string().min(10).max(500),

  // Data supply strategy
  strategy: DataSupplyStrategySchema,

  // Dependencies
  dependencies: z
    .array(
      z.string().regex(TestdataRefPattern, {
        message: 'Invalid dependency format. Expected: TD-<ENTITY>-<ID>',
      })
    )
    .max(20)
    .default([]),

  // Environment constraints
  environments: z.array(EnvironmentProfileSchema).optional(),

  // Fixture configuration
  scope: FixtureScopeSchema,
  teardown: z.boolean(),
  timeout: z.number().min(1000).max(300000),

  // Metadata (optional, auto-generated)
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type TestdataBlueprint = z.infer<typeof TestdataBlueprintSchema>;

// ============================================================================
// Lifecycle Plan
// ============================================================================

// Lifecycle step
export const StepSchema = z.object({
  stepId: z.string(),
  type: z.enum(['load-seed', 'call-api', 'execute-sql', 'cleanup']),
  testdataRef: z.string().regex(TestdataRefPattern),
  description: z.string(),
  dependsOn: z.array(z.string()).default([]),
  optional: z.boolean().default(false),
  timeout: z.number().min(1000).max(120000).default(30000),
  config: z.record(z.unknown()),
});
export type Step = z.infer<typeof StepSchema>;

// Dependency graph
export interface DependencyNode {
  id: string;
  blueprint: TestdataBlueprint;
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: Map<string, string[]>; // nodeId -> array of dependency IDs
}

// Lifecycle plan
export const LifecyclePlanSchema = z.object({
  testdataRef: z.string().regex(TestdataRefPattern),
  version: z.string().regex(SemanticVersionPattern),
  scope: FixtureScopeSchema,
  setupSteps: z.array(StepSchema),
  teardownSteps: z.array(StepSchema),
  totalTimeout: z.number().min(1000).max(300000),
  generatedAt: z.string().datetime(),
});
export type LifecyclePlan = z.infer<typeof LifecyclePlanSchema>;

// ============================================================================
// Data Provenance
// ============================================================================

// Cleanup status
export const CleanupStatusSchema = z.enum(['success', 'failed', 'skipped', 'partial']);
export type CleanupStatus = z.infer<typeof CleanupStatusSchema>;

// Data creation record
export const DataCreationRecordSchema = z.object({
  testdataRef: z.string().regex(TestdataRefPattern),
  strategy: z.enum(['seed', 'api', 'db-script']),
  createdAt: z.string().datetime(),
  testId: z.string(),
  status: z.enum(['success', 'failed']),
  dataId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type DataCreationRecord = z.infer<typeof DataCreationRecordSchema>;

// Data cleanup record
export const DataCleanupRecordSchema = z.object({
  testdataRef: z.string().regex(TestdataRefPattern),
  cleanedAt: z.string().datetime(),
  status: CleanupStatusSchema,
  error: z.string().optional(),
});
export type DataCleanupRecord = z.infer<typeof DataCleanupRecordSchema>;

// Data provenance (entire log)
export const DataProvenanceSchema = z.object({
  testRunId: z.string(),
  environment: EnvironmentProfileSchema,
  dataCreated: z.array(DataCreationRecordSchema),
  dataCleanedUp: z.array(DataCleanupRecordSchema),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
});
export type DataProvenance = z.infer<typeof DataProvenanceSchema>;

// ============================================================================
// Validation Results
// ============================================================================

export const ValidationIssueSchema = z.object({
  type: z.enum(['error', 'warning', 'info']),
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});
export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;

export const ValidationResultSchema = z.object({
  valid: z.boolean(),
  issues: z.array(ValidationIssueSchema),
});
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
