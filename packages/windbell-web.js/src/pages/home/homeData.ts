import { defineBasicLoader } from "vue-router/experimental"
import { getHomeState, loadHomeState } from "./HomeState.ts"

export const useHomeData = defineBasicLoader(async () => {
  const state = getHomeState()

  if (state.hasLoaded) {
    // 已有数据：立即完成导航，旧内容继续显示，后台刷新。
    void loadHomeState(state)
    return state
  }

  // 首次进入：导航等待数据就绪。
  await loadHomeState(state)
  return state
})
