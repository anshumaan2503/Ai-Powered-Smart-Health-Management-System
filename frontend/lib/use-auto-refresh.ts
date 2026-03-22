import { useEffect, useRef } from 'react'

/**
 * Runs an async refresh callback immediately (when enabled) and thereafter on a visibility-aware polling schedule.
 *
 * The hook invokes `callback` once on start when `enabled` is true, then repeatedly at `activeInterval` while the page is visible and at `inactiveInterval` while the page is hidden. Rejections from `callback` are logged to `console.error`.
 *
 * @param callback - Async function to run on each refresh tick and when manually invoked via `refresh`
 * @param enabled - When `false`, the hook does nothing and no polling is scheduled
 * @param activeInterval - Poll interval in milliseconds to use while the page is visible
 * @param inactiveInterval - Poll interval in milliseconds to use while the page is hidden
 * @returns An object with `{ refresh, stop }` where `refresh` is the original `callback` and `stop` clears the active polling interval
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
