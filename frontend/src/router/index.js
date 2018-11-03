import Vue from 'vue'
import Router from 'vue-router'
import Home from '../components/Home'
import Generator from '../components/Generator'
import Plates from '../components/Plates'
import Login from '../components/Login'
import Register from '../components/Register'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/home',
      name: 'home',
      component: Home,
      children: [
        {
          path: '',
          redirect: 'generator'
        },
        {
          path: 'generator',
          name: 'generator',
          component: Generator
        },
        {
          path: 'plates',
          name: 'plates',
          component: Plates
        }
      ]
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/',
      redirect: 'login'
    }
  ]
})
