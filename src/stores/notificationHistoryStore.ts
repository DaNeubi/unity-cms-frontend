import { defineStore } from 'pinia'

export const notificationHistoryStateStore = defineStore('notificationHistoryStateStore', {
  state: () => ({
    notifications: [] as { notification: string, timestamp: string }[]
  }),
  getters: {
  },
  actions: {
    addNotification (notification: string) : void {
      // check for the array limit
      if (this.notifications.length >= 10) {
        this.notifications.shift()
      }
      this.notifications.push({ notification, timestamp: new Date().toLocaleString() })
    },
    clearStore () : void {
      this.notifications = []
    }
  }
})
