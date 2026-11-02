import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/styles/main.css'
import App from './App.vue'
import router from './router/index.js'
import { reveal } from './directives/reveal.js'

createApp(App).use(createPinia()).use(router).directive('reveal', reveal).mount('#app')
