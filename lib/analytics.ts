type EventType = "page_view" | "button_click" | "form_submit" | "error" | "login" | "logout" | "feature_use"

interface EventData {
  page?: string
  action?: string
  category?: string
  label?: string
  value?: number
  error?: string
  [key: string]: any
}

// This is a placeholder implementation
// Replace with your actual analytics service
export function trackEvent(eventType: EventType, data: EventData = {}) {
  // Add page path if not provided
  if (!data.page && typeof window !== "undefined") {
    data.page = window.location.pathname
  }

  // Log the event in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${eventType}:`, data)
  }

  // Here you would normally send this to your analytics service
  // Example:
  // if (typeof window !== 'undefined' && window.gtag) {
  //   window.gtag('event', eventType, data)
  // }
}

// Track page views
export function trackPageView(url: string) {
  trackEvent("page_view", { page: url })
}
