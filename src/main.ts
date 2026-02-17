import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { vueDebounce } from 'vue-debounce'
import ui from '@nuxt/ui/vue-plugin'
import './assets/main.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.directive('debounce', vueDebounce({ lock: true }))
app.use(pinia)
app.use(router)
app.use(ui)

app.mount('#app')
