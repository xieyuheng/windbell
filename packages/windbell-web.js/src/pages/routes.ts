import type { RouteRecordRaw } from "vue-router"
import HomePage from "./home/HomePage.vue"
import { useHomeData } from "./home/homeData.ts"
import MarkdownRenderPage from "./markdown/MarkdownRenderPage.vue"
import ProviderListPage from "./provider-list/ProviderListPage.vue"
import { useProviderListData } from "./provider-list/providerListData.ts"
import ProviderPage from "./provider/ProviderPage.vue"
import { useProviderData } from "./provider/providerData.ts"
import NotFoundPage from "./errors/NotFoundPage.vue"
import SessionDustbinPage from "./session-dustbin/SessionDustbinPage.vue"
import { useSessionDustbinData } from "./session-dustbin/sessionDustbinData.ts"
import WorkspaceDustbinPage from "./workspace-dustbin/WorkspaceDustbinPage.vue"
import { useWorkspaceDustbinData } from "./workspace-dustbin/workspaceDustbinData.ts"
import SessionPage from "./session/SessionPage.vue"
import { useSessionData } from "./session/sessionData.ts"
import SettingsPage from "./settings/SettingsPage.vue"
import ToolboxPage from "./toolbox/ToolboxPage.vue"
import ThemeListPage from "./theme-list/ThemeListPage.vue"
import ThemePage from "./theme/ThemePage.vue"
import WorkspacePage from "./workspace/WorkspacePage.vue"
import { useWorkspaceData } from "./workspace/workspaceData.ts"

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "home",
    component: HomePage,
    meta: {
      loaders: [useHomeData],
    },
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
    meta: {
      loaders: [useWorkspaceData],
    },
  },
  {
    path: "/workspace-dustbin",
    name: "workspace-dustbin",
    component: WorkspaceDustbinPage,
    meta: {
      loaders: [useWorkspaceDustbinData],
    },
  },
  {
    path: "/workspaces/:workspaceId/session-dustbin",
    name: "session-dustbin",
    component: SessionDustbinPage,
    meta: {
      loaders: [useSessionDustbinData],
    },
  },
  {
    path: "/sessions/:sessionId",
    name: "session",
    component: SessionPage,
    meta: {
      loaders: [useSessionData],
    },
  },
  {
    path: "/providers",
    name: "provider-list",
    component: ProviderListPage,
    meta: {
      loaders: [useProviderListData],
    },
  },
  {
    path: "/providers/:providerName",
    name: "provider",
    component: ProviderPage,
    meta: {
      loaders: [useProviderData],
    },
  },
  {
    path: "/settings",
    name: "settings",
    component: SettingsPage,
  },
  {
    path: "/toolbox",
    name: "toolbox",
    component: ToolboxPage,
  },
  {
    path: "/themes",
    name: "theme-list",
    component: ThemeListPage,
  },
  {
    path: "/themes/new",
    name: "theme-new",
    component: ThemePage,
  },
  {
    path: "/themes/:themeId",
    name: "theme",
    component: ThemePage,
  },
  {
    path: "/markdown",
    name: "markdown",
    component: MarkdownRenderPage,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: NotFoundPage,
  },
]
