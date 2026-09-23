import type { RouteRecordRaw } from "vue-router"

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/workspaces",
  },
  {
    path: "/workspaces",
    name: "workspace-list",
    component: () => import("./workspace-list/WorkspaceList.vue"),
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
    component: () => import("./session-list/SessionList.vue"),
  },
  {
    path: "/sessions/:sessionId",
    name: "session",
    component: () => import("./session/Session.vue"),
  },
  {
    path: "/workspaces/:workspaceId/tree",
    name: "tree",
    component: () => import("./tree/Tree.vue"),
  },
  {
    path: "/settings",
    name: "settings",
    component: () => import("./settings/Settings.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("./errors/PageNotFound.vue"),
  },
]
