import { createHead } from "@unhead/vue/client"
import { createApp } from "vue"
import { createRouter, createWebHistory } from "vue-router"
import App from "./app/App.vue"
import { i18n } from "./app/i18n"
import { routes } from "./pages/routes"
import "./styles/index.css"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

const app = createApp(App)

app.use(i18n)
app.use(createHead())
app.use(router)

document.documentElement.lang = i18n.global.locale.value

router.isReady().then(() => {
  app.mount("#app")
})
