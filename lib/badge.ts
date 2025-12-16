/**
 * Badge API utilities for PWA notification badges
 * Supported on Chrome/Edge on Android, Windows, macOS
 */

export const BadgeAPI = {
  /**
   * Check if Badging API is supported
   */
  isSupported(): boolean {
    return "setAppBadge" in navigator && "clearAppBadge" in navigator
  },

  /**
   * Set the app badge to a specific number
   * @param count - Number to display (0-99+)
   */
  async set(count: number): Promise<void> {
    if (!this.isSupported()) {
      console.log("Badging API not supported on this device")
      return
    }

    try {
      if (count > 0) {
        await (navigator as any).setAppBadge(count)
        console.log(`Badge set to: ${count}`)
      } else {
        await this.clear()
      }
    } catch (error) {
      console.error("Error setting app badge:", error)
    }
  },

  /**
   * Clear the app badge
   */
  async clear(): Promise<void> {
    if (!this.isSupported()) {
      return
    }

    try {
      await (navigator as any).clearAppBadge()
      console.log("Badge cleared")
    } catch (error) {
      console.error("Error clearing app badge:", error)
    }
  },

  /**
   * Increment the badge count
   * @param amount - Amount to increment by (default: 1)
   */
  async increment(amount = 1): Promise<void> {
    if (!this.isSupported()) {
      return
    }

    try {
      // Note: There's no way to read current badge, so we manage it separately
      const currentCount = Number.parseInt(localStorage.getItem("badge_count") || "0")
      const newCount = currentCount + amount
      localStorage.setItem("badge_count", newCount.toString())
      await this.set(newCount)
    } catch (error) {
      console.error("Error incrementing badge:", error)
    }
  },

  /**
   * Decrement the badge count
   * @param amount - Amount to decrement by (default: 1)
   */
  async decrement(amount = 1): Promise<void> {
    if (!this.isSupported()) {
      return
    }

    try {
      const currentCount = Number.parseInt(localStorage.getItem("badge_count") || "0")
      const newCount = Math.max(0, currentCount - amount)
      localStorage.setItem("badge_count", newCount.toString())
      await this.set(newCount)
    } catch (error) {
      console.error("Error decrementing badge:", error)
    }
  },
}
