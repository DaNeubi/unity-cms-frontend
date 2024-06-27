import { defineStore } from 'pinia'
import IDiscount from 'src/misc/interfaces/Discount/IDiscount'
import IItemStock from 'src/misc/interfaces/Item/IItemStock'
import { IItem } from 'src/misc/interfaces/Item/IItem'
import { LocalStorage } from 'quasar'
import IOldFoodCashRegisterState from 'src/misc/interfaces/WebWorker/IOldFoodCashRegisterState'

export const cashRegisterStateStore = defineStore('cashRegisterStateStore', {
  state: () => ({
    companyId: -1 as number | undefined,
    selectedDiscount: undefined as undefined | IDiscount,
    keepDiscountSelected: false as boolean | undefined,
    selectedItemStock: undefined as undefined | IItemStock,
    useDefaultItemStock: false as boolean | undefined,
    amountGiven: 0 as number | undefined,
    note: undefined as string | undefined,
    santosCardCode: undefined as number | undefined,
    availableItems: undefined as undefined | IItem[]
  }),
  getters: {
  },
  actions: {
    getStoreFromLocalStorage (companyId: number) : void {
      const storeState : IOldFoodCashRegisterState | null =
        LocalStorage.getItem('oldFoodCashRegisterState:' + companyId)
      if (storeState) {
        this.companyId = storeState.companyId
        this.selectedDiscount = storeState.selectedDiscount
        this.keepDiscountSelected = storeState.keepDiscountSelected
        this.selectedItemStock = storeState.selectedItemStock
        this.useDefaultItemStock = storeState.useDefaultItemStock
        this.amountGiven = storeState.amountGiven
        this.note = storeState.note
        this.santosCardCode = storeState.santosCardCode
        this.availableItems = storeState.availableItems
      }
    },
    createBasicStore (companyIdCurr: number) : void {
      this.companyId = companyIdCurr
      LocalStorage.set('oldFoodCashRegisterState:' + companyIdCurr, {
        companyId: companyIdCurr,
        selectedDiscount: undefined,
        keepDiscountSelected: true,
        selectedItemStock: undefined,
        useDefaultItemStock: false,
        amountGiven: 0,
        note: undefined,
        santosCardCode: undefined,
        availableItems: undefined
      })
    },
    updateStore (companyId: number, state: IOldFoodCashRegisterState) : void {
      LocalStorage.set('oldFoodCashRegisterState:' + companyId, state)
    },
    clearStore (companyId: number) : void {
      LocalStorage.remove('oldFoodCashRegisterState:' + companyId)
      this.createBasicStore(companyId)
    }
  }
})
