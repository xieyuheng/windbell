import type { RouteRecordRaw } from "vue-router"
import HomePage from "./home/HomePage.vue"
import NotFoundPage from "./errors/NotFoundPage.vue"
import SessionDustbinPage from "./session-dustbin/SessionDustbinPage.vue"
import WorkspaceDustbinPage from "./workspace-dustbin/WorkspaceDustbinPage.vue"
import SessionPage from "./session/SessionPage.vue"
import SettingsPage from "./settings/SettingsPage.vue"
import TreePage from "./tree/TreePage.vue"
import WorkspacePage from "./workspace/WorkspacePage.vue"

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "home",
    component: HomePage,
  },
  {
    path: "/dashboard",
    redirect: "/home",
  },
  {
    path: "/workspaces",
    redirect: "/home",
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
    path: "/workspace-dustbin",
    name: "workspace-dustbin",
    component: WorkspaceDustbinPage,
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
