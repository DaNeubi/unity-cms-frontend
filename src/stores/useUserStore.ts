import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { lastPageHistoryStore } from 'stores/lastPageStore'

export interface LoginFormThing {
  umail: string,
  pwd: string
}

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: 0,
    authenticated: false,
    userToken: '',
    tokenTested: false,
    userName: '',
    welcomeDone: undefined as boolean | undefined,
    sessionLogin: false,
    lastSavedRoute: undefined as string | undefined,
    currentLoggedOnDevice: undefined as string | undefined,
    companiesAvailable: false
  }),

  getters: {
    getUserId () : number {
      return this.userId
    },
    getAuthenticated () : boolean {
      return this.authenticated
    },
    token () : string {
      return this.userToken
    }
  },

  actions: {
    async signIn (credentials : LoginFormThing) : Promise<boolean> {
      let status = false
      await api.get('/sanctum/csrf-cookie', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Credentials': true
        }
      }).catch((e) => console.error(e))
      await api.post('/api/login', credentials).then((res) => {
        this.userToken = res.data.data.token
        localStorage.setItem('token', res.data.data.token)
        api.defaults.headers.common.Authorization = `Bearer ${this.userToken}`
        this.$state.authenticated = true
        this.$state.sessionLogin = false
        this.currentLoggedOnDevice = 'web'
        this.checkTokenAndUser()
        status = true
      }).catch((e) => {
        console.error(e)
        status = false
      })
      return status
    },
    async autoLogin (token : string) : Promise<boolean> {
      let status = false
      await api.get('/sanctum/csrf-cookie', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Credentials': true
        }
      }).catch((e) => console.error(e))
      await api.post('/api/autologin/?token=' + token)
        .then((res) => {
          this.userToken = res.data.data.token
          localStorage.setItem('token', res.data.data.token)
          api.defaults.headers.common.Authorization = `Bearer ${this.userToken}`
          this.$state.authenticated = true
          this.$state.sessionLogin = true
          this.currentLoggedOnDevice = 'tablet'
          this.checkTokenAndUser()
          status = true
        })
        .catch((error) => {
          console.error(error)
          status = false
        })
      return status
    },
    async signOut () : Promise<boolean> {
      return await api.post('/api/cuslogout').then(
        () => {
          console.info('Logged Out')
          localStorage.removeItem('token')
          this.$state.authenticated = false
          this.$state.userToken = ''
          this.$state.userId = 0
          this.$state.tokenTested = false
          this.$state.userName = ''
          this.$state.welcomeDone = undefined
          this.$state.sessionLogin = false
          this.$state.lastSavedRoute = undefined
          return true
        }
      ).catch((e) => {
        console.error(e)
        return false
      })
    },
    async checkTokenAndUser () : Promise<boolean> {
      let status = false
      await api.get('/sanctum/csrf-cookie',
        { withCredentials: true, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Credentials': true } })
        .catch((e) => console.error(e))
      await api.get('/api/user').then((res) => {
        this.userId = res.data.id
        this.tokenTested = true
        this.userName = res.data.first_name + ' ' + res.data.last_name
        // check if the user has completed the welcome process
        if (res.data.phone === null || res.data.bank_account_number === null) {
          this.welcomeDone = false
        } else {
          this.welcomeDone = true
        }
        // check if device is set, if not infer from the session login property
        if (this.currentLoggedOnDevice === undefined) {
          this.currentLoggedOnDevice = this.sessionLogin ? 'tablet' : 'web'
        }
        this.checkUserLastRoute()
        status = true
      }).catch((e) => {
        console.error(e)
        this.$state.authenticated = true
        this.userToken = ''
        this.tokenTested = true
        this.userId = 0
        status = false
      })
      return status
    },
    async checkUserLastRoute () {
      const lastRouteStore = lastPageHistoryStore()
      lastRouteStore.currentDevice = this.currentLoggedOnDevice ?? ''
      await api.get('/api/userSettings/lastRoute?device=' + this.currentLoggedOnDevice)
        .then((res) => {
          // check if allowed to save last route
          if (res.data.allowedOn === 'none') return
          // now check if the currentLoggedOnDevice is allowed to save the last route
          switch (res.data.allowedOn as string) {
            case 'web':
              if (this.currentLoggedOnDevice === 'web') {
                this.lastSavedRoute = res.data.route
                lastRouteStore.routeLoggingEnabled = true
                lastRouteStore.lastSavedRoute = res.data.route
              }
              break
            case 'tablet':
              if (this.currentLoggedOnDevice === 'tablet') {
                this.lastSavedRoute = res.data.route
                lastRouteStore.routeLoggingEnabled = true
                lastRouteStore.lastSavedRoute = res.data.route
              }
              break
            case 'both':
              this.lastSavedRoute = res.data.route
              lastRouteStore.routeLoggingEnabled = true
              lastRouteStore.lastSavedRoute = res.data.route
              break
            default:
          }
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }
})
