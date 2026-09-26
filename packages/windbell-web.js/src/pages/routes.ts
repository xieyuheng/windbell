import type { RouteRecordRaw } from "vue-router"
import DashboardPage from "./dashboard/DashboardPage.vue"
import NotFoundPage from "./errors/NotFoundPage.vue"
import SessionDustbinPage from "./session-dustbin/SessionDustbinPage.vue"
import SessionPage from "./session/SessionPage.vue"
import SettingsPage from "./settings/SettingsPage.vue"
import TreePage from "./tree/TreePage.vue"
import WorkspacePage from "./workspace/WorkspacePage.vue"

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardPage,
  },
  {
    path: "/workspaces",
    redirect: "/dashboard",
  },
  {
    path: "/workspaces/:workspaceId/sessions",
    redirect: (to) => ({
      name: "workspace",
      params: {
        workspaceId: to.params.workspaceId,
      },
    }),
  },
  {
    path: "/workspaces/:workspaceId",
    name: "workspace",
    component: WorkspacePage,
  },
  {
    path: "/workspaces/:workspaceId/session-dustbin",
    name: "session-dustbin",
    component: SessionDustbinPage,
  },
  {
    path: "/sessions/:sessionId",
    name: "session",
    component: SessionPage,
  },
  {
    path: "/workspaces/:workspaceId/tree",
    name: "tree",
    component: TreePage,
  },
  {
    path: "/settings",
    name: "settings",
    component: SettingsPage,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: NotFoundPage,
  },
]
