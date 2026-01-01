/**
 * @spec T004-lark-project-management
 * Persistent configuration manager for Base App tokens and table IDs
 */

import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import { z } from 'zod'
import logger from '../utils/logger.js'

const PersistedConfigSchema = z.object({
  baseAppToken: z.string().optional(),
  tableIds: z
    .object({
      tasks: z.string().optional(),
      technicalDebt: z.string().optional(),
      bugs: z.string().optional(),
      features: z.string().optional(),
      testRecords: z.string().optional(),
      backlog: z.string().optional(),
      productBacklog: z.string().optional(), // Product Backlog (产品待办列表)
    })
    .optional(),
})

export type PersistedConfig = z.infer<typeof PersistedConfigSchema>

const CONFIG_FILE_PATH = path.join(process.cwd(), 'config.json')

/**
 * Load persisted configuration from config.json
 */
export async function loadConfig(): Promise<PersistedConfig> {
  try {
    const content = await fs.readFile(CONFIG_FILE_PATH, 'utf-8')
    const config = JSON.parse(content)
    const validated = PersistedConfigSchema.parse(config)
    logger.info('Loaded persisted configuration from config.json')
    return validated
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      logger.info('No config.json found, starting with empty configuration')
      return {}
    }
    logger.error({ error }, 'Failed to load config.json')
    throw error
  }
}

/**
 * Save configuration to config.json
 */
export async function saveConfig(config: PersistedConfig): Promise<void> {
  try {
    const validated = PersistedConfigSchema.parse(config)
    await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(validated, null, 2), 'utf-8')
    logger.info('Saved configuration to config.json')
  } catch (error) {
    logger.error({ error }, 'Failed to save config.json')
    throw error
  }
}

/**
 * Update specific configuration fields
 */
export async function updateConfig(
  updates: Partial<PersistedConfig>
): Promise<PersistedConfig> {
  const current = await loadConfig()
  const updated = {
    ...current,
    ...updates,
    tableIds: {
      ...current.tableIds,
      ...updates.tableIds,
    },
  }
  await saveConfig(updated)
  return updated
}

/**
 * Get runtime configuration (synchronous version for command execution)
 */
export function getConfig(): {
  appToken?: string
  tables?: {
    tasks?: string
    technicalDebt?: string
    bugs?: string
    features?: string
    testRecords?: string
    backlog?: string
    productBacklog?: string
  }
  userAccessToken?: string
} {
  const configPath = path.join(process.cwd(), 'config.json')

  try {
    const content = fsSync.readFileSync(configPath, 'utf-8')
    const config = JSON.parse(content)

    logger.debug({ configPath, config }, 'Loaded config from file')

    return {
      appToken: config.baseAppToken,
      tables: config.tableIds,
      userAccessToken: process.env.LARK_USER_ACCESS_TOKEN,
    }
  } catch (error) {
    logger.warn(
      {
        configPath,
        errorMessage: (error as Error).message,
        errorCode: (error as NodeJS.ErrnoException).code,
      },
      'Failed to load config.json, using defaults'
    )
    return {
      userAccessToken: process.env.LARK_USER_ACCESS_TOKEN,
    }
  }
}
