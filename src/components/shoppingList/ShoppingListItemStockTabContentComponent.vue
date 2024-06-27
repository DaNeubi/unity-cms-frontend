<template>
  <q-tab-panel :name="`${ name }`">
    <div class="column">
      <span>
        Anzahl der Produkte, die in diesem Lager fehlen:
        <span class="missing_amount_negative" v-if="itemStockMissingAmount > 0">
          {{ itemStockMissingAmount }}
        </span>
        <span class="missing_amount_positive" v-else>
          {{ itemStockMissingAmount }}
        </span>
        Stück
      </span>
      <div class="q-mt-md">
        <q-btn label="Lager-Ist aktualisieren"
               v-if="canManuallyUpdate"
               style="background: #0A85FF;"
               icon="mdi-refresh"
               @click="updateAmountManually()"/>
      </div>
      <div class="q-mt-md row items-center" v-if="canMakePurchase">
        <q-btn label="Ich hab was eingekauft"
               style="background: #099A6C;"
               icon="mdi-basket-outline"
               @click="makePurchase()"/>
        <q-option-group :options="toggleOptions"
                        class="q-ml-sm"
                        v-model="selectedPaymentMethod"
                        color="accent"
                        inline>
          <template v-slot:label="opt">
            <span>{{ opt.label }}</span>
            <q-tooltip>
              Hier angeben, wie du an der Metro bezahlt hast.
            </q-tooltip>
          </template>
        </q-option-group>
      </div>
      <q-table class="q-mt-md full-width cms-sticky-header-table"
               title="Artikeltypen, die im Lager sind"
               no-data-label="Keine Daten vorhanden"
               :columns="articleTypeTableColumns"
               :pagination="{ rowsPerPage: 15 }"
               v-if="intermediateItemStock.item_stock_item_types.length > 0"
               :rows="intermediateItemStock.item_stock_item_types"
               row-key="id"
               loading-label="Daten werden abgerufen...">
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td v-for="headerVal in articleTypeTableColumns"
                  :key="headerVal.name" :props="props">
              <div v-if="headerVal.name === 'articleType'">
                {{ props.row.item_type.name }}
              </div>
              <div v-if="headerVal.name === 'wantedAmount'">
                {{ props.row.wanted_amount }}
              </div>
              <div v-if="headerVal.name === 'currentAmount'"
                   class="cursor-pointer full-height row items-center justify-end">
                <span :class="`${ props.row.current_amount == 0 ? 'text-orange-5' : props.row.current_amount < 0 ? 'text-red-5' : '' }`">
                  {{ props.row.current_amount }}
                </span>
                <q-popup-edit :model-value="props.row.current_amount"
                              v-slot="scope"
                              buttons
                              label-set="Übernehmen"
                              label-cancel="Abbrechen"
                              @save="(val) => editItemStockItemOrType(val, props.row)">
                  <q-input v-model.number="scope.value" type="number" dense label="Lager-Ist" outlined/>
                </q-popup-edit>
              </div>
              <div v-if="headerVal.name === 'missing'">
                <span v-if="props.row.wanted_amount - props.row.current_amount > 0"
                      class="missing_amount_negative">
                  {{ props.row.wanted_amount - props.row.current_amount }}
                </span>
                <span v-else-if="props.row.wanted_amount - props.row.current_amount === 0"
                      class="missing_amount_positive">
                  0
                </span>
                <span v-else
                      class="missing_amount_too_much">
                  {{ (props.row.wanted_amount - props.row.current_amount) * -1 }} zu viel
                </span>
              </div>
              <div v-if="headerVal.name === 'bought'">
                <q-input v-model.number="props.row.bought"
                         type="number"
                         dense
                         label="Anzahl dazugekauft"
                         :min="0"
                         outlined/>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
      <q-separator class="q-mt-md"/>
      <q-table class="q-mt-md full-width cms-sticky-header-table"
               title="Artikel, die im Lager sind"
               no-data-label="Keine Daten vorhanden"
               :columns="articleTableColumns"
               :pagination="{ rowsPerPage: 15 }"
               :rows="intermediateItemStock.item_stock_items"
               v-if="intermediateItemStock.item_stock_items.length > 0"
               row-key="id"
               loading-label="Daten werden abgerufen...">
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td v-for="headerVal in articleTableColumns"
                  :key="headerVal.name" :props="props">
              <div v-if="headerVal.name === 'article'">
                {{ props.row.item.name }}
              </div>
              <div v-if="headerVal.name === 'wantedAmount'">
                {{ props.row.wanted_amount }}
              </div>
              <div v-if="headerVal.name === 'currentAmount'"
                   class="cursor-pointer">
                <span :class="`${ props.row.current_amount == 0 ? 'text-orange-5' : props.row.current_amount < 0 ? 'text-red-5' : '' }`">
                  {{ props.row.current_amount }}
                </span>
                <q-popup-edit :model-value="props.row.current_amount"
                              v-slot="scope"
                              buttons
                              label-set="Übernehmen"
                              label-cancel="Abbrechen"
                              @save="(val) => editItemStockItemOrType(val, props.row)">
                  <q-input v-model.number="scope.value"
                           type="number"
                           dense
                           label="Lager-Ist"
                           outlined/>
                </q-popup-edit>
              </div>
              <div v-if="headerVal.name === 'missing'">
                <span v-if="props.row.wanted_amount - props.row.current_amount > 0"
                      class="missing_amount_negative">
                  {{ props.row.wanted_amount - props.row.current_amount }}
                </span>
                <span v-else-if="props.row.wanted_amount - props.row.current_amount === 0"
                      class="missing_amount_positive">
                  0
                </span>
                <span v-else
                      class="missing_amount_too_much">
                  {{ (props.row.wanted_amount - props.row.current_amount) * -1 }} zu viel
                </span>
              </div>
              <div v-if="headerVal.name === 'bought'">
                <q-input v-model.number="props.row.bought"
                         type="number"
                         dense
                         label="Anzahl dazugekauft"
                         :min="0"
                         outlined/>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </q-tab-panel>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import IItemStock from 'src/misc/interfaces/Item/IItemStock'
import TransactionType from 'src/misc/Enums/Transaction/TransactionType'
import { api } from 'src/boot/axios'
import { IItemStockItem } from 'src/misc/interfaces/Item/IItemStockItem'
import { IItemStockItemType } from 'src/misc/interfaces/Item/IItemStockItemType'

export default defineComponent({
  name: 'ShoppingListItemStockTabContentComponent',
  components: {},
  props: {
    itemStock: {
      type: Object as () => IItemStock,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    canManuallyUpdate: {
      type: Boolean,
      required: true,
      default: false
    },
    canMakePurchase: {
      type: Boolean,
      required: true,
      default: false
    },
    companyId: {
      type: Number,
      required: true
    }
  },
  setup (props) {
    const loadingArticleTypes = ref(true)
    const loadingArticles = ref(true)
    const itemStockMissingAmount = computed(() => {
      let missingAmount = 0
      props.itemStock.item_stock_item_types.forEach((itemType) => {
        missingAmount += itemType.wanted_amount - itemType.current_amount
      })
      props.itemStock.item_stock_items.forEach((item) => {
        missingAmount += item.wanted_amount - item.current_amount
      })
      return missingAmount
    })
    const articles = ref([])
    const articleTypes = ref([])
    const articleSelect = ref(null)
    const articleTypeSelect = ref(null)
    const selectedPaymentMethod = ref<TransactionType>(TransactionType.MetroPurchaseCard)
    const intermediateItemStock = ref<IItemStock>(props.itemStock)
    onMounted(async () => {
      setItemBoughtToDefault()
    })
    const articleTableColumns = [
      { name: 'article', label: 'Artikel', field: 'article' },
      { name: 'wantedAmount', label: 'Lager-Soll', field: 'wantedAmount' },
      { name: 'currentAmount', label: 'Lager-Ist', field: 'currentAmount' },
      { name: 'missing', label: 'Fehlt aktuell', field: 'missing' },
      { name: 'bought', label: 'Dazugekauft', field: 'bought' }
    ]
    const articleTypeTableColumns = [
      { name: 'articleType', label: 'Artikel-Typ', field: 'articleType' },
      { name: 'wantedAmount', label: 'Lager-Soll', field: 'wantedAmount' },
      { name: 'currentAmount', label: 'Lager-Ist', field: 'currentAmount' },
      { name: 'missing', label: 'Fehlt aktuell', field: 'missing' },
      { name: 'bought', label: 'Dazugekauft', field: 'bought' }
    ]
    const toggleOptions = [
      { label: 'Bar', value: TransactionType.MetroPurchaseMoney },
      { label: 'Karte', value: TransactionType.MetroPurchaseCard }
    ]
    function editItemStockItemOrType (newCurrent: number | string, itemStockItemOrType: IItemStockItem | IItemStockItemType) {
      if (typeof newCurrent !== 'number') {
        return
      }
      itemStockItemOrType.current_amount = newCurrent
    }
    function updateAmountManually () {
      // check if any of the current amount is not a number
      if (intermediateItemStock.value.item_stock_items.some((item) => isNaN(item.current_amount)) || intermediateItemStock.value.item_stock_item_types.some((itemType) => isNaN(itemType.current_amount))) {
        return
      }
      // update the amount manually
      api.post('/api/shopping-list/manuallyUpdateAmount/' + props.companyId, {
        item_stock_id: props.itemStock.id,
        item_stock: props.itemStock
      })
        .catch((error) => {
          console.error(error)
        })
    }
    function makePurchase () {
      let itemsToUpdate: [{ id?: number, bought?: number, item_stock_id?: number }] | null = [{ }]
      props.itemStock.item_stock_items.forEach((item) => {
        if (item.bought !== undefined && item.bought > 0 && itemsToUpdate !== null) {
          itemsToUpdate.push({
            id: item.id,
            bought: item.bought,
            item_stock_id: props.itemStock.id
          })
        }
      })
      itemsToUpdate.shift()
      if (itemsToUpdate.length < 1) {
        itemsToUpdate = null
      }
      let itemTypesToUpdate: [{ id?: number, bought?: number, item_stock_id?: number }] | null = [{ }]
      props.itemStock.item_stock_item_types.forEach((itemType) => {
        if (itemType.bought !== undefined && itemType.bought > 0 && itemTypesToUpdate !== null) {
          itemTypesToUpdate.push({
            id: itemType.id,
            bought: itemType.bought,
            item_stock_id: props.itemStock.id
          })
        }
      })
      itemTypesToUpdate.shift()
      if (itemTypesToUpdate.length < 1) {
        itemTypesToUpdate = null
      }
      // check if there is something to update
      if ((itemsToUpdate === null || itemsToUpdate.length < 1) && (itemTypesToUpdate === null || itemTypesToUpdate.length < 1)) {
        return
      }
      api.post('/api/shopping-list/createPurchase/' + props.companyId, {
        item_stock_id: props.itemStock.id,
        transaction_type: selectedPaymentMethod.value,
        item_stock_items: itemsToUpdate,
        item_stock_item_types: itemTypesToUpdate
      })
        .then(() => {
          setItemBoughtToDefault()
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function setItemBoughtToDefault () {
      // set the bought amount to 0 for every item type
      props.itemStock.item_stock_item_types.forEach((itemType) => {
        itemType.bought = 0
      })
      // set the bought amount to 0 for every item
      props.itemStock.item_stock_items.forEach((item) => {
        item.bought = 0
      })
    }
    return {
      itemStockMissingAmount,
      articles,
      articleTypes,
      articleSelect,
      articleTypeSelect,
      articleTableColumns,
      articleTypeTableColumns,
      loadingArticleTypes,
      loadingArticles,
      updateAmountManually,
      makePurchase,
      toggleOptions,
      selectedPaymentMethod,
      intermediateItemStock,
      editItemStockItemOrType
    }
  }
})
</script>

<style scoped>
.missing_amount_negative {
  text-decoration: underline;
  color: #FFAB40;
}
.missing_amount_positive {
  text-decoration: underline;
  color: #59B68C;
}
.missing_amount_too_much {
  text-decoration: underline;
  color: #ff4040;
}
</style>
