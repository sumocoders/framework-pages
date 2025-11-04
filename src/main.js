import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import * as bootstrap from 'bootstrap/dist/js/bootstrap.js'
if (process.env.NODE_ENV === 'development') {
  import('bootstrap/scss/bootstrap.scss')
  import('bootstrap-icons/font/bootstrap-icons.css')
}

createApp(App).use(store).mount('#pages-app')
