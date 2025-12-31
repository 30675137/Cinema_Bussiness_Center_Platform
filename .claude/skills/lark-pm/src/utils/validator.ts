/**
 * @spec T004-lark-project-management
 * Input validation utility using Zod schemas
 */

import { z, ZodError } from 'zod'
import logger from './logger.js'

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: z.ZodIssue[]
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Validate input data against a Zod schema
 * @param schema Zod schema to validate against
 * @param data Input data to validate
 * @returns Validated and typed data
 * @throws ValidationError if validation fails
 */
export function validate<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof ZodError) {
      logger.error({ errors: error.errors }, 'Validation failed')
      throw new ValidationError(
        `Validation failed: ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
        error.errors
      )
    }
    throw error
  }
}

/**
 * Safely validate input data and return result with success flag
 * @param schema Zod schema to validate against
 * @param data Input data to validate
 * @returns Validation result with success flag
 */
export function safeValidate<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: z.ZodIssue[] } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, errors: result.error.errors }
}
