import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index'
import "vant/es/notify/style"
import "vant/es/toast/style"
import vueEsign from 'vue-esign'
const app = createApp(App)
app.use(router)
app.use(vueEsign)
app.mount('#app')
