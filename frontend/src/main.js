// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import axios from './axios'

import App from './App'
import VueBlu from 'vue-blu'
import VueDND from 'awe-dnd'
import 'vue-blu/dist/css/vue-blu.min.css'
import 'font-awesome-icons'

import router from './router'

Vue.use(VueBlu)
Vue.use(VueDND)
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
