export const defaultSidebarRatio = 0.25
export const minSidebarRatio = 0.15
export const maxSidebarRatio = 0.5
export const sidebarRatioStorageKey = "windbell.ranger.sidebarRatio"

export function clampSidebarRatio(value: number): number {
  return Math.min(maxSidebarRatio, Math.max(minSidebarRatio, value))
}

export function readStoredSidebarRatio(): number {
  try {
    const stored = localStorage.getItem(sidebarRatioStorageKey)
    if (stored === null) return defaultSidebarRatio

    const value = Number(stored)
    if (!Number.isFinite(value)) return defaultSidebarRatio

    return clampSidebarRatio(value)
  } catch {
    return defaultSidebarRatio
  }
}

export function writeStoredSidebarRatio(value: number): void {
  try {
    localStorage.setItem(sidebarRatioStorageKey, String(value))
  } catch {
    // ignore storage errors
  }
}
