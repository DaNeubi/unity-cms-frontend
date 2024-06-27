import IOldFoodCashRegisterState from 'src/misc/interfaces/WebWorker/IOldFoodCashRegisterState'

onmessage = function (currentState: MessageEvent<{ state: IOldFoodCashRegisterState, companyId: number }>) {
  saveOldFoodCashRegisterState(currentState.data.companyId, currentState.data.state)
}

function saveOldFoodCashRegisterState (companyId: number, currentState: IOldFoodCashRegisterState) {
  // remove all items where the amount is 0
  if (currentState.availableItems) {
    currentState.availableItems = currentState.availableItems.filter(item => item.amount > 0 || item.item_menus !== undefined)
  }
  // unset the item stock items, we dont need them
  if (currentState.selectedItemStock !== undefined) {
    currentState.selectedItemStock = {
      id: currentState.selectedItemStock.id,
      is_default: currentState.selectedItemStock.is_default,
      item_stock_items: [],
      company_id: currentState.selectedItemStock.company_id,
      name: currentState.selectedItemStock.name,
      item_stock_item_types: []
    }
  }
  postMessage({ date: new Date(), updatedState: currentState })
}
