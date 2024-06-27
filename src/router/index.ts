import { route } from 'quasar/wrappers'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from 'vue-router'
import routes from './routes'
import { useUserStore } from 'stores/useUserStore'
import { api } from 'boot/axios'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(
      process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE
    )
  })
  // Verify, that the user is logged-in/authenticated and the token is set
  Router.beforeResolve(async (to, from, next) => {
    // check if autologin
    if (to.path.startsWith('/autologin/')) {
      next()
    } else {
      const userStore = useUserStore()
      if (userStore.userToken.length === 0 && to.path !== '/login') {
        // check if bearer token is in local storage
        if (localStorage.getItem('token') !== null) {
          userStore.userToken = localStorage.getItem('token') as string
          userStore.authenticated = true
          // set axios bearer token
          if (api.defaults.headers.common.Authorization === undefined ||
            api.defaults.headers.common.Authorization === null ||
            api.defaults.headers.common.Authorization === 0) {
            api.defaults.headers.common.Authorization = `Bearer ${userStore.userToken}`
          }
          if (!userStore.tokenTested) {
            if (!await userStore.checkTokenAndUser()) {
              next({ name: 'login' })
            }
          }
          next()
        } else {
          next({ name: 'login' })
        }
      } else if ((to.path === '/login' || from.path === '/login') && userStore.userToken.length > 0) {
        next()
      } else if (!userStore.tokenTested && to.path !== '/login') {
        if (!await userStore.checkTokenAndUser()) {
          next({ name: 'login' })
        } else {
          next()
        }
      } else {
        next()
      }
    }
  })

  return Router
})
