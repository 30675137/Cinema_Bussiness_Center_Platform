/**
 * @spec T004-lark-project-management
 * Retry utility with exponential backoff for Lark API calls
 */

export interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  onRetry?: (error: Error, attempt: number) => void
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 2,
  baseDelay: 1000,
  maxDelay: 10000,
  onRetry: () => {},
}

/**
 * Execute a function with exponential backoff retry
 * @param fn Function to execute
 * @param options Retry configuration
 * @returns Result of the function
 * @throws Last error if all retries fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error | undefined

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt === opts.maxRetries) {
        throw lastError
      }

      const delay = Math.min(
        opts.baseDelay * Math.pow(2, attempt),
        opts.maxDelay
      )

      opts.onRetry(lastError, attempt + 1)

      await sleep(delay)
    }
  }

  throw lastError || new Error('Retry failed with unknown error')
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
