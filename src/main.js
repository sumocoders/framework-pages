import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import * as bootstrap from 'bootstrap/dist/js/bootstrap.js'

createApp(App).use(store).mount('#pages-app')
