/**
 * @spec T004-lark-project-management
 * Lark API configuration from environment variables
 */

import { z } from 'zod'
import logger from '../utils/logger.js'

const LarkConfigSchema = z.object({
  appId: z.string().min(1, 'LARK_APP_ID is required'),
  appSecret: z.string().min(1, 'LARK_APP_SECRET is required'),
  userAccessToken: z.string().min(1, 'LARK_USER_ACCESS_TOKEN is required'),
})

export type LarkConfig = z.infer<typeof LarkConfigSchema>

/**
 * Load and validate Lark configuration from environment variables
 * @returns Validated Lark configuration
 * @throws Error if required environment variables are missing
 */
export function loadLarkConfig(): LarkConfig {
  const config = {
    appId: process.env.LARK_APP_ID || '',
    appSecret: process.env.LARK_APP_SECRET || '',
    userAccessToken: process.env.LARK_USER_ACCESS_TOKEN || '',
  }

  try {
    const validated = LarkConfigSchema.parse(config)
    logger.info('Lark configuration loaded successfully')
    return validated
  } catch (error) {
    logger.error({ error }, 'Failed to load Lark configuration')
    throw new Error(
      'Missing required Lark environment variables. Please check .env file.'
    )
  }
}
