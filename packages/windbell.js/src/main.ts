import { createApp } from "vue"
import { createRouter, createWebHistory } from "vue-router"
import App from "./App.vue"
import { routes } from "./pages/routes"
import "./styles/index.css"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

const app = createApp(App)

app.use(router)

router.isReady().then(() => {
  app.mount("#app")
})
