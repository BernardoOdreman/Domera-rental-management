"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/components/ui/toast-provider"
import { trackEvent } from "@/lib/analytics"

interface FormSubmitOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
  trackingCategory?: string
}

export function useFormSubmit<T = any>({
  onSuccess,
  onError,
  successMessage = "Operation completed successfully",
  errorMessage = "An error occurred",
  trackingCategory = "form_submission",
}: FormSubmitOptions<T> = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const submitForm = useCallback(
    async (submitFn: () => Promise<T>, customSuccessMessage?: string, customErrorMessage?: string) => {
      setIsSubmitting(true)
      setError(null)

      try {
        const result = await submitFn()

        // Track successful submission
        trackEvent("form_submit", {
          category: trackingCategory,
          status: "success",
        })

        // Show success toast
        if (customSuccessMessage || successMessage) {
          toast(customSuccessMessage || successMessage, "success")
        }

        // Call success callback
        if (onSuccess) {
          onSuccess(result)
        }

        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)

        // Track error
        trackEvent("error", {
          category: trackingCategory,
          action: "form_submit_error",
          error: error.message,
        })

        // Show error toast
        if (customErrorMessage || errorMessage) {
          toast(customErrorMessage || errorMessage, "error")
        }

        // Call error callback
        if (onError) {
          onError(error)
        }

        throw error
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSuccess, onError, successMessage, errorMessage, trackingCategory, toast],
  )

  return {
    submitForm,
    isSubmitting,
    error,
    setError,
  }
}
