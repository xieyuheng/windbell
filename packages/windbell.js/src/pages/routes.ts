import type { RouteRecordRaw } from "vue-router"

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/projects",
  },
  {
    path: "/projects",
    name: "project-list",
    component: () => import("./project-list/ProjectList.vue"),
  },
  {
    path: "/projects/:projectId",
    redirect: (to) => ({
      name: "session-list",
      params: {
        projectId: to.params.projectId,
      },
    }),
  },
  {
    path: "/projects/:projectId/sessions",
    name: "session-list",
    component: () => import("./session-list/SessionList.vue"),
  },
  {
    path: "/projects/:projectId/sessions/:sessionId",
    name: "session",
    component: () => import("./session/Session.vue"),
  },
  {
    path: "/projects/:projectId/tree",
    name: "tree",
    component: () => import("./tree/Tree.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("./errors/PageNotFound.vue"),
  },
]
