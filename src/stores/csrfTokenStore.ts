import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    token: ''
  }),

  getters: {
    getToken () : string {
      return this.token
    }
  },

  actions: {
    update (newToken: string) {
      this.token = newToken
    }
  }
})
