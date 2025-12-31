/**
 * @spec T004-lark-project-management
 * Persistent configuration manager for Base App tokens and table IDs
 */

import fs from 'fs/promises'
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
