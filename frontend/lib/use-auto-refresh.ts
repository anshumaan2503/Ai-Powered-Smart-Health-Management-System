import { useEffect, useRef } from 'react'

/**
 * Custom hook for managing auto-refresh with smart polling
 * Detects page visibility and adjusts polling accordingly
 */
export function useAutoRefresh(
  callback: () => Promise<void>,
  enabled: boolean = true,
  activeInterval: number = 10000, // 10 seconds when active
  inactiveInterval: number = 30000 // 30 seconds when inactive
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isVisibleRef = useRef(true)

  useEffect(() => {
    if (!enabled) return

    // Initial call
    callback().catch(console.error)

    // Handle visibility changes
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Setup polling interval
    const setupInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      const interval = isVisibleRef.current ? activeInterval : inactiveInterval

      intervalRef.current = setInterval(() => {
        if (!document.hidden) {
          callback().catch(console.error)
        }
      }, interval)
    }

    setupInterval()

    // Re-setup interval when visibility changes
    const handleVisibilityForInterval = () => {
      setupInterval()
    }

    document.addEventListener('visibilitychange', handleVisibilityForInterval)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('visibilitychange', handleVisibilityForInterval)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, callback, activeInterval, inactiveInterval])

  return {
    refresh: callback,
    stop: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }
}
