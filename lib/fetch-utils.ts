/**
 * Enhanced fetch with timeout, error handling, and retries
 */
export async function enhancedFetch(
  url: string,
  options: RequestInit & {
    timeout?: number
    retries?: number
    retryDelay?: number
    onRetry?: (attempt: number, error: Error) => void
  } = {},
) {
  const { timeout = 8000, retries = 2, retryDelay = 1000, onRetry = () => {}, ...fetchOptions } = options

  let lastError: Error

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < retries) {
        onRetry(attempt + 1, lastError)
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)))
      }
    }
  }

  throw lastError!
}

/**
 * Safely parses JSON with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T
  } catch (error) {
    console.error("Error parsing JSON:", error)
    return fallback
  }
}

/**
 * Creates a cache key from an object of parameters
 */
export function createCacheKey(params: Record<string, any>): string {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join("&")
}
