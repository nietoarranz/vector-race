import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// PrimeVue core
import PrimeVue from 'primevue/config'
// PrimeVue styles
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'
import ToastService from 'primevue/toastservice'
import Toast from 'primevue/toast'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})
app.use(ToastService)
app.component('Toast', Toast)

app.mount('#app')
