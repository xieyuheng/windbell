import type { RouteRecordRaw } from "vue-router"
import PageNotFound from "./errors/PageNotFound.vue"
import Session from "./session/Session.vue"
import SessionList from "./session-list/SessionList.vue"
import Settings from "./settings/Settings.vue"
import Tree from "./tree/Tree.vue"
import WorkspaceList from "./workspace-list/WorkspaceList.vue"

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/workspaces",
  },
  {
    path: "/workspaces",
    name: "workspace-list",
    component: WorkspaceList,
  },
  {
    path: "/workspaces/:workspaceId",
    redirect: (to) => ({
      name: "session-list",
      params: {
        workspaceId: to.params.workspaceId,
      },
    }),
  },
  {
    path: "/workspaces/:workspaceId/sessions",
    name: "session-list",
    component: SessionList,
  },
  {
    path: "/sessions/:sessionId",
    name: "session",
    component: Session,
  },
  {
    path: "/workspaces/:workspaceId/tree",
    name: "tree",
    component: Tree,
  },
  {
    path: "/settings",
    name: "settings",
    component: Settings,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: PageNotFound,
  },
]
