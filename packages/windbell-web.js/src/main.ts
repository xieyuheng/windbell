import { createHead } from "@unhead/vue/client"
import { createApp } from "vue"
import { createRouter, createWebHistory } from "vue-router"
import { DataLoaderPlugin } from "vue-router/experimental"
import App from "./app/App.vue"
import { i18n } from "./app/i18n.ts"
import { ensureThemeReady } from "./app/theme.ts"
import { routes } from "./pages/routes.ts"
import "./styles/index.css"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

const app = createApp(App)

// DataLoaderPlugin 必须在 router 之前注册。
app.use(DataLoaderPlugin, { router })
app.use(i18n)
app.use(createHead())
app.use(router)

document.documentElement.lang = i18n.global.locale.value

Promise.all([router.isReady(), ensureThemeReady()]).then(() => {
  app.mount("#app")
})
