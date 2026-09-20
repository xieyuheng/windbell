import type { Router } from "vue-router"

export type SettingsState = {
  goBack(): void
}

export function createSettingsState(router: Router): SettingsState {
  return {
    goBack() {
      if (window.history.length > 1) {
        router.back()
      } else {
        router.push({ name: "workspace-list" })
      }
    },
  }
}
