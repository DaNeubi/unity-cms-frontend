import { defineStore } from 'pinia'

export const companyStore = defineStore('company', {
  state: () => {
    return {
      companyId: -1
    }
  },

  getters: {
    getCompanyId () : number {
      return this.companyId
    }
  },

  actions: {
    updateCompanyId (updatedCompanyId: number) {
      localStorage.setItem('company', updatedCompanyId.toString())
      this.companyId = updatedCompanyId
    },
    checkForSavedCompany () : boolean {
      const savedCompanyId = localStorage.getItem('company')
      if (savedCompanyId === '-1') return false
      if (savedCompanyId) {
        this.companyId = parseInt(savedCompanyId)
        return true
      }
      return false
    }
  }
})
