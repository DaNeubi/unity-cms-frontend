<template>
  <div class="column">
    <div v-if="loadingPermissions">
      <q-skeleton type="rect" height="3em"/>
      <q-card class="q-mt-md">
        <q-card-section>
          <div class="column q-gutter-md">
            <q-skeleton type="QInput"
                        v-for="n in 3"
                        :key="n"/>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div v-else>
      <q-tabs v-model="tab"
              inline-label
              align="left">
        <ShoppingListOverviewTabComponent name="Uebersicht"
                                          label="Übersicht"
                                          v-if="canSeeOverview"/>
        <ShoppingListMoveItemsTabComponent name="Warenschiebung"
                                           label="Warenschiebung"
                                           v-if="canMoveItems"/>
        <ShoppingListLoadingItemStockTabComponent v-if="loadingItemStocks"/>
        <ShoppingListItemStockTabComponent :name="itemStock.name"
                                           v-for="itemStock in allItemStocks"
                                           :key="itemStock.id"
                                           :default-stock="+itemStock.is_default??undefined"/>
      </q-tabs>
      <q-tab-panels v-model="tab">
        <ShoppingListOverviewTabContentComponent name="Uebersicht"
                                                 v-if="canSeeOverview"
                                                 :company-id="companyId"
                                                 :can-see-overview="canSeeOverview"/>
        <ShoppingListMoveItemsTabContentComponent name="Warenschiebung"
                                                  v-if="canMoveItems"
                                                  :can-move="canMoveItems"
                                                  :company-id="companyId"
                                                  :item-stocks="allItemStocks!"/>
        <ShoppingListLoadingItemStockTabContentComponent v-if="loadingItemStocks"/>
        <ShoppingListItemStockTabContentComponent :item-stock="itemStock"
                                                  :name="itemStock.name"
                                                  v-for="itemStock in allItemStocks"
                                                  :key="itemStock.id"
                                                  :can-make-purchase="canMakePurchase"
                                                  :can-manually-update="canManuallyUpdateAmount"
                                                  :company-id="companyId"/>
      </q-tab-panels>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import { api } from 'boot/axios'
import { companyStore } from 'stores/companyStore'
import ShoppingListMoveItemsTabComponent from 'components/shoppingList/ShoppingListMoveItemsTabComponent.vue'
import ShoppingListMoveItemsTabContentComponent
  from 'components/shoppingList/ShoppingListMoveItemsTabContentComponent.vue'
import ShoppingListOverviewTabComponent from 'components/shoppingList/ShoppingListOverviewTabComponent.vue'
import ShoppingListOverviewTabContentComponent
  from 'components/shoppingList/ShoppingListOverviewTabContentComponent.vue'
import IItemStock from 'src/misc/interfaces/Item/IItemStock'
import ShoppingListLoadingItemStockTabComponent
  from 'components/shoppingList/ShoppingListLoadingItemStockTabComponent.vue'
import ShoppingListLoadingItemStockTabContentComponent
  from 'components/shoppingList/ShoppingListLoadingItemStockTabContentComponent.vue'
import ShoppingListItemStockTabComponent from 'components/shoppingList/ShoppingListItemStockTabComponent.vue'
import ShoppingListItemStockTabContentComponent
  from 'components/shoppingList/ShoppingListItemStockTabContentComponent.vue'
import laravelEcho from 'boot/laravelecho'
import {
  IEncapsulatedIntermediateItemStockUpdated
} from 'src/misc/interfaces/Item/IEncapsulatedIntermediateItemStockUpdated'
import AssignPolicies from 'src/misc/functions/policies/Policies'

export default defineComponent({
  name: 'shoppingList',
  components: { ShoppingListItemStockTabContentComponent, ShoppingListItemStockTabComponent, ShoppingListLoadingItemStockTabContentComponent, ShoppingListLoadingItemStockTabComponent, ShoppingListOverviewTabContentComponent, ShoppingListOverviewTabComponent, ShoppingListMoveItemsTabContentComponent, ShoppingListMoveItemsTabComponent },
  setup () {
    const canMoveItems = ref<boolean>(false)
    const canManuallyUpdateAmount = ref<boolean>(false)
    const canMakePurchase = ref<boolean>(false)
    const canSeeOverview = ref<boolean>(false)
    const loadingPermissions = ref<boolean>(false)
    const loadingItemStocks = ref<boolean>(false)
    const allItemStocks = ref<IItemStock[]>()
    const cStore = companyStore()
    const companyId = computed(() => cStore.companyId)
    const tab = ref('Uebersicht')
    watch(companyId, () => {
      joinItemStockChangedEvent()
      getPermissions()
      getItemStocks()
    })
    onMounted(async () => {
      joinItemStockChangedEvent()
      getPermissions()
      getItemStocks()
    })
    onUnmounted(() => {
      laravelEcho.leave('itemStock.changed.' + companyId.value)
    })
    function joinItemStockChangedEvent () {
      if (companyId.value <= 0) { return }
      // listen to the general itemStock change event
      laravelEcho.join('itemStock.changed.' + companyId.value).listen('.company.itemStock.changed', (param: IEncapsulatedIntermediateItemStockUpdated) => {
        // check again for company
        if (param.intermediateItemStockUpdated?.company_id !== companyId.value) {
          return
        }

        // update the changed items/itemTypes in the itemStock
        const itemStockToUpdate = allItemStocks.value?.find((itemStock) => itemStock.id === param.intermediateItemStockUpdated?.itemStock_id)
        if (param.intermediateItemStockUpdated.itemStockItems !== undefined && param.intermediateItemStockUpdated.itemStockItems.length > 0) {
          for (let i = 0; i < param.intermediateItemStockUpdated.itemStockItems.length; i++) {
            const itemStockItemToUpdate = itemStockToUpdate?.item_stock_items?.find((itemStockItem) => itemStockItem.item_id === param.intermediateItemStockUpdated?.itemStockItems?.[i].item_id)
            if (itemStockItemToUpdate) {
              itemStockItemToUpdate.current_amount = +param.intermediateItemStockUpdated.itemStockItems[i].current_amount ?? 0
            }
          }
        }
        if (param.intermediateItemStockUpdated.itemStockItemTypes !== undefined && param.intermediateItemStockUpdated.itemStockItemTypes.length > 0) {
          for (let i = 0; i < param.intermediateItemStockUpdated.itemStockItemTypes.length; i++) {
            const itemStockItemTypeToUpdate = itemStockToUpdate?.item_stock_item_types?.find((itemStockItemType) => itemStockItemType.id === param.intermediateItemStockUpdated?.itemStockItemTypes?.[i].id)
            if (itemStockItemTypeToUpdate) {
              itemStockItemTypeToUpdate.current_amount = +param.intermediateItemStockUpdated?.itemStockItemTypes[i]?.current_amount ?? 0
            }
          }
        }
      })
    }
    function getPermissions () {
      if (companyId.value <= 0) { return }
      loadingPermissions.value = true
      api.get('/api/policies/shoppingList/shoppingList/' + companyId.value)
        .then((res) => {
          AssignPolicies([
            { policyName: 'Shopping_List_Move', policyToAssign: canMoveItems },
            { policyName: 'Shopping_List_Update', policyToAssign: canManuallyUpdateAmount },
            { policyName: 'Shopping_List_Purchase', policyToAssign: canMakePurchase },
            { policyName: 'Shopping_List_Overview', policyToAssign: canSeeOverview }
          ], res.data.shoppingListPolicies)
          loadingPermissions.value = false
          if (canSeeOverview.value) {
            tab.value = 'Uebersicht'
          } else if (canMoveItems.value) {
            tab.value = 'Warenschiebung'
          }
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function getItemStocks () {
      if (companyId.value <= 0) { return }
      loadingItemStocks.value = true
      api.get('/api/shopping-list/itemStocks/' + companyId.value)
        .then((res) => {
          allItemStocks.value = res.data.itemStocks
          loadingItemStocks.value = false
        })
        .catch((err) => {
          console.error(err)
        })
    }
    return {
      loadingPermissions,
      canMoveItems,
      canManuallyUpdateAmount,
      canMakePurchase,
      canSeeOverview,
      tab,
      companyId,
      loadingItemStocks,
      allItemStocks
    }
  }
})
</script>

<style scoped>

</style>
