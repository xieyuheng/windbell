import type { RouteRecordRaw } from "vue-router"
import HomePage from "./home/HomePage.vue"
import MarkdownRenderPage from "./markdown/MarkdownRenderPage.vue"
import ProviderListPage from "./provider-list/ProviderListPage.vue"
import ProviderPage from "./provider/ProviderPage.vue"
import NotFoundPage from "./errors/NotFoundPage.vue"
import SessionDustbinPage from "./session-dustbin/SessionDustbinPage.vue"
import WorkspaceDustbinPage from "./workspace-dustbin/WorkspaceDustbinPage.vue"
import SessionPage from "./session/SessionPage.vue"
import SettingsPage from "./settings/SettingsPage.vue"
import ThemeEditorPage from "./themes/ThemeEditorPage.vue"
import ThemesPage from "./themes/ThemesPage.vue"
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
    path: "/providers",
    name: "provider-list",
    component: ProviderListPage,
  },
  {
    path: "/providers/:providerName",
    name: "provider",
    component: ProviderPage,
  },
  {
    path: "/settings",
    name: "settings",
    component: SettingsPage,
  },
  {
    path: "/themes",
    name: "themes",
    component: ThemesPage,
  },
  {
    path: "/themes/new",
    name: "theme-new",
    component: ThemeEditorPage,
  },
  {
    path: "/themes/:themeId",
    name: "theme-editor",
    component: ThemeEditorPage,
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
