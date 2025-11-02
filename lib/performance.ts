type PerformanceMetricName =
  | "first-contentful-paint"
  | "largest-contentful-paint"
  | "first-input-delay"
  | "cumulative-layout-shift"
  | "time-to-interactive"
  | "page-load"
  | "api-call"
  | "render-time"
  | "memory-usage"

interface PerformanceMetric {
  name: PerformanceMetricName
  value: number
  rating: "good" | "needs-improvement" | "poor"
  timestamp: number
}

/**
 * Measures and logs performance metrics
 */
export function measurePerformance(name: PerformanceMetricName, value: number): PerformanceMetric {
  // Determine rating based on metric
  let rating: "good" | "needs-improvement" | "poor" = "good"

  switch (name) {
    case "first-contentful-paint":
      rating = value < 1800 ? "good" : value < 3000 ? "needs-improvement" : "poor"
      break
    case "largest-contentful-paint":
      rating = value < 2500 ? "good" : value < 4000 ? "needs-improvement" : "poor"
      break
    case "first-input-delay":
      rating = value < 100 ? "good" : value < 300 ? "needs-improvement" : "poor"
      break
    case "cumulative-layout-shift":
      rating = value < 0.1 ? "good" : value < 0.25 ? "needs-improvement" : "poor"
      break
    case "page-load":
      rating = value < 3000 ? "good" : value < 6000 ? "needs-improvement" : "poor"
      break
    case "api-call":
      rating = value < 500 ? "good" : value < 1500 ? "needs-improvement" : "poor"
      break
    default:
      rating = "good" // Default
  }

  const metric: PerformanceMetric = {
    name,
    value,
    rating,
    timestamp: Date.now(),
  }

  // Log in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Performance] ${name}: ${value}ms (${rating})`)
  }

  // Here you would normally send this to your monitoring service
  // Example: sendToAnalyticsService(metric);

  return metric
}

/**
 * Start a performance measurement
 */
export function startMeasure(markName: string): void {
  if (typeof performance !== "undefined") {
    performance.mark(`${markName}-start`)
  }
}

/**
 * End a performance measurement and get the duration
 */
export function endMeasure(markName: string, metricName?: PerformanceMetricName): number {
  if (typeof performance === "undefined") {
    return 0
  }

  const startMark = `${markName}-start`
  const endMark = `${markName}-end`

  // Set end mark
  performance.mark(endMark)

  try {
    // Measure between marks
    performance.measure(markName, startMark, endMark)

    // Get the measurement
    const entries = performance.getEntriesByName(markName, "measure")
    const duration = entries.length > 0 ? entries[0].duration : 0

    // Clear marks and measures to avoid memory leaks
    performance.clearMarks(startMark)
    performance.clearMarks(endMark)
    performance.clearMeasures(markName)

    // Report if metricName is provided
    if (metricName) {
      measurePerformance(metricName, duration)
    }

    return duration
  } catch (error) {
    console.error("Error measuring performance:", error)
    return 0
  }
}
