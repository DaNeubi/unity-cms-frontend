<template>
  <div class="column">
    <q-tabs v-model="tab" inline-label align="left">
      <ShoppingListMoveItemsTabComponent name="Warenschiebung" label="Warenschiebung"/>
      <ShoppingListItemStockTabComponent v-for="stocks in itemStocks"
                                         :key="stocks.name"
                                         :name="`${ stocks.name }`"/>
    </q-tabs>
    <q-tab-panels v-model="tab">
      <ShoppingListMoveItemsTabContentComponent name="Warenschiebung"/>
      <ShoppingListItemStockTabContentComponent v-for="stocks in itemStocks"
                                                :key="stocks.name"
                                                :name="`${ stocks.name }`"
                                                :id="stocks.id"/>
    </q-tab-panels>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import ShoppingListMoveItemsTabComponent from 'components/shoppingList/ShoppingListMoveItemsTabComponent.vue'
import ShoppingListMoveItemsTabContentComponent
  from 'components/shoppingList/ShoppingListMoveItemsTabContentComponent.vue'
import ShoppingListItemStockTabComponent from 'components/shoppingList/ShoppingListItemStockTabComponent.vue'
import ShoppingListItemStockTabContentComponent
  from 'components/shoppingList/ShoppingListItemStockTabContentComponent.vue'

export default defineComponent({
  name: 'ShoppingListComponent',
  components: { ShoppingListItemStockTabContentComponent, ShoppingListItemStockTabComponent, ShoppingListMoveItemsTabContentComponent, ShoppingListMoveItemsTabComponent },
  setup () {
    const tab = ref('Warenschiebung')
    const itemStocks = ref([
      {
        id: 0,
        name: 'test'
      },
      {
        id: 1,
        name: 'test2'
      }
    ])
    return {
      tab,
      itemStocks
    }
  }
})
</script>

<style scoped>

</style>
