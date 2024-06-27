import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { ref } from 'vue'

const timerValue = ref()
export const lastPageHistoryStore = defineStore('lastPageHistoryStore', {
  state: () => ({
    lastRoute: '' as string,
    timeoutStarted: false as boolean,
    routeLoggingEnabled: false as boolean,
    currentDevice: '' as string,
    lastSavedRoute: undefined as string | undefined
  }),
  getters: {
  },
  actions: {
    setRoute (route: string) {
      if (!this.routeLoggingEnabled) return
      if (this.lastSavedRoute !== undefined && this.lastSavedRoute === route) return
      this.lastRoute = route
      // check if timeout is already started
      if (this.timeoutStarted) {
        this.lastRoute = route
        clearTimeout(timerValue.value)
      }
      // set timeout
      this.timeoutStarted = true
      timerValue.value = setTimeout(() => {
        pushLastRoute(this.lastRoute, this.currentDevice)
        this.timeoutStarted = false
      }, 5000)
    }
  }
})

function pushLastRoute (route: string, currentDevice: string) {
  api.post('/api/userSettings/setLastRoute', {
    lastRoute: route,
    device: currentDevice
  })
    .catch((error) => {
      console.error(error)
    })
}
