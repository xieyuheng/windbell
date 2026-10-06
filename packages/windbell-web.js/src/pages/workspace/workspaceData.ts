import { defineBasicLoader } from "vue-router/experimental"
import { getWorkspaceState, loadWorkspaceState } from "./WorkspaceState.ts"

export const useWorkspaceData = defineBasicLoader(async (to) => {
  const workspaceId = String(to.params.workspaceId ?? "")
  const state = getWorkspaceState(workspaceId)

  if (state.hasLoaded) {
    // 已有缓存：立即完成导航，旧内容继续显示，后台刷新。
    void loadWorkspaceState(state)
    return state
  }

  // 首次进入该 workspace：导航等待数据就绪。
  await loadWorkspaceState(state)
  return state
})
