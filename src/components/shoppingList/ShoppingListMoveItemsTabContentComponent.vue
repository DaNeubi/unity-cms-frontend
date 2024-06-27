<template>
  <q-tab-panel :name="`${ name }`">
    <div class="column">
      <h5 class="q-mt-none q-mb-sm">Artikel zwischen den vorhandenen Artikelbeständen schubsen</h5>
      <span class="hint-text">
        Hier kannst du Artikel zwischen unterschiedlichen Artikelbeständen hin und her schieben.
      </span>
      <div class="row justify-between">
        <q-select v-model="selectedFromStock"
                  outlined label="Von Lager"
                  class="select_width"
                  clearable
                  hint="Artikelbestand aus dem etwas in einen anderen Bestand gepackt werden soll"
                  :option-label="option => option.name"
                  :options="fromAvailableStocks"/>
        <q-select v-model="selectedToStock"
                  outlined label="An Lager"
                  class="select_width"
                  hint="Artikelbestand in den etwas aus einem anderen Bestand gepackt werden soll"
                  clearable
                  :option-label="option => option.name"
                  :options="toAvailableStocks"/>
      </div>
      <div class="row justify-around">
        <div class="q-mt-lg">
          <div v-if="selectedFromStock !== undefined" class="col">
            <q-table class="full-width cms-sticky-header-table"
                     :title="selectedFromStock.name + ' - Artikel'"
                     no-data-label="Keine Daten vorhanden"
                     :columns="fromStockColumns"
                     :row-key="id"
                     virtual-scroll
                     v-model:pagination="pagination"
                     :rows-per-page-options="[0]"
                     :rows="selectedFromStock.item_stock_items">
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td v-for="headerVal in fromStockColumns"
                        :key="headerVal.name" :props="props">
                    <div v-if="headerVal.name === 'article'">
                      {{ props.row.item.name }}
                    </div>
                    <div v-if="headerVal.name === 'wantedAmount'">
                      {{ props.row.wanted_amount }}
                    </div>
                    <div v-if="headerVal.name === 'currentAmount'">
                      {{ props.row.current_amount }}
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
                    <div v-if="headerVal.name === 'move'"
                         class="cursor-pointer">
                      {{ props.row.move }}
                      <q-popup-edit :model-value="props.row.move"
                                    v-slot="scope"
                                    buttons
                                    label-set="Übernehmen"
                                    label-cancel="Abbrechen"
                                    @save="(val) => editItemStockItemOrItemTypeMove(val, props.row)">
                        <q-input v-model.number="scope.value"
                                 type="number"
                                 v-if="selectedToStock !== undefined && selectedToStock.item_stock_items.find((itemStockItem) => itemStockItem.item_id === props.row.item_id)"
                                 dense
                                 label="Anzahl Rüberschieben"
                                 :min="0"
                                 outlined/>
                        <span v-else>
                          Dieser Artikel ist nicht im anderen Artikelbestand vorhanden.
                        </span>
                      </q-popup-edit>
                    </div>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
            <q-space class="q-mt-lg"/>
            <q-table class="full-width cms-sticky-header-table"
                     :title="selectedFromStock.name + ' - Artikeltypen'"
                     no-data-label="Keine Daten vorhanden"
                     :columns="fromStockColumns"
                     :row-key="id"
                     virtual-scroll
                     v-model:pagination="pagination"
                     :rows-per-page-options="[0]"
                     :rows="selectedFromStock.item_stock_item_types">
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td v-for="headerVal in fromStockColumns"
                        :key="headerVal.name" :props="props">
                    <div v-if="headerVal.name === 'article'">
                      {{ props.row.item_type.name }}
                    </div>
                    <div v-if="headerVal.name === 'wantedAmount'">
                      {{ props.row.wanted_amount }}
                    </div>
                    <div v-if="headerVal.name === 'currentAmount'">
                      {{ props.row.current_amount }}
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
                    <div v-if="headerVal.name === 'move'"
                         class="cursor-pointer">
                      {{ props.row.move }}
                      <q-popup-edit :model-value="props.row.move"
                                    v-slot="scope"
                                    buttons
                                    label-set="Übernehmen"
                                    label-cancel="Abbrechen"
                                    @save="(val) => editItemStockItemOrItemTypeMove(val, props.row)">
                        <q-input v-model.number="scope.value"
                                 type="number"
                                 v-if="selectedToStock !== undefined && selectedToStock.item_stock_item_types.find((itemStockItem) => itemStockItem.item_id === props.row.item_id)"
                                 dense
                                 label="Anzahl Rüberschieben"
                                 :min="0"
                                 outlined/>
                        <span v-else>
                          Dieser Artikeltyp ist nicht im anderen Artikelbestand vorhanden.
                        </span>
                      </q-popup-edit>
                    </div>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
        </div>
        <div class="q-mt-lg">
          <div v-if="selectedToStock !== undefined">
            <q-table class="full-width cms-sticky-header-table"
                     :title="selectedToStock.name + ' - Artikel'"
                     no-data-label="Keine Daten vorhanden"
                     :columns="toStockColumns"
                     :row-key="id"
                     virtual-scroll
                     v-model:pagination="pagination"
                     :rows-per-page-options="[0]"
                     :rows="selectedToStock.item_stock_items">
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td v-for="headerVal in fromStockColumns"
                        :key="headerVal.name" :props="props">
                    <div v-if="headerVal.name === 'article'">
                      {{ props.row.item.name }}
                    </div>
                    <div v-if="headerVal.name === 'wantedAmount'">
                      {{ props.row.wanted_amount }}
                    </div>
                    <div v-if="headerVal.name === 'currentAmount'">
                      {{ props.row.current_amount }}
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
                  </q-td>
                </q-tr>
              </template>
            </q-table>
            <q-space class="q-mt-lg"/>
            <q-table class="full-width cms-sticky-header-table"
                     :title="selectedToStock.name + ' - Artikeltypen'"
                     no-data-label="Keine Daten vorhanden"
                     :columns="toStockColumns"
                     :row-key="id"
                     virtual-scroll
                     v-model:pagination="pagination"
                     :rows-per-page-options="[0]"
                     :rows="selectedToStock.item_stock_item_types">
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td v-for="headerVal in fromStockColumns"
                        :key="headerVal.name" :props="props">
                    <div v-if="headerVal.name === 'article'">
                      {{ props.row.item_type.name }}
                    </div>
                    <div v-if="headerVal.name === 'wantedAmount'">
                      {{ props.row.wanted_amount }}
                    </div>
                    <div v-if="headerVal.name === 'currentAmount'">
                      {{ props.row.current_amount }}
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
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>
        </div>
      </div>
      <div class="q-mt-lg">
        <q-btn label="SCHIEEEEEEEBUNG ⚽"
               icon="mdi-cached"
               color="positive"
               v-if="canMove"
               @click="moveItems()"
               :disable="moveButtonDisabledState"/>
      </div>
    </div>
  </q-tab-panel>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import IItemStock from 'src/misc/interfaces/Item/IItemStock'
import { IItemStockItem } from 'src/misc/interfaces/Item/IItemStockItem'
import { IItemStockItemType } from 'src/misc/interfaces/Item/IItemStockItemType'
import { api } from 'src/boot/axios'

export default defineComponent({
  name: 'ShoppingListMoveItemsTabContentComponent',
  components: {},
  props: {
    name: String,
    itemStocks: {
      type: Array as () => Array<IItemStock>,
      required: true
    },
    canMove: {
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
    const cloneBase = ref<IItemStock[]>()
    const selectedFromStock = ref<IItemStock>()
    const selectedToStock = ref<IItemStock>()
    const fromAvailableStocks = computed(() => cloneBase.value?.filter((itemStock) => itemStock.id !== selectedToStock.value?.id))
    const toAvailableStocks = computed(() => cloneBase.value?.filter((itemStock) => itemStock.id !== selectedFromStock.value?.id))
    const moveButtonDisabledState = ref(true)
    onMounted(async () => {
      // assign the move property with a default value of 0
      const intermedBaseClone = JSON.parse(JSON.stringify(props.itemStocks))
      intermedBaseClone.forEach((itemStock: IItemStock) => {
        itemStock.item_stock_items.forEach((itemStockItem) => {
          itemStockItem.move = 0
        })
        itemStock.item_stock_item_types.forEach((itemStockItemType) => {
          itemStockItemType.move = 0
        })
      })
      cloneBase.value = intermedBaseClone
    })
    const fromStockColumns = [
      { name: 'article', label: 'Artikel', field: 'article' },
      { name: 'wantedAmount', label: 'Lager-Soll', field: 'wantedAmount' },
      { name: 'currentAmount', label: 'Lager-Ist', field: 'currentAmount' },
      { name: 'missing', label: 'Fehlt aktuell', field: 'missing' },
      { name: 'move', label: 'Verschieben', field: 'move' }
    ]
    const toStockColumns = [
      { name: 'article', label: 'Artikel', field: 'article' },
      { name: 'wantedAmount', label: 'Lager-Soll', field: 'wantedAmount' },
      { name: 'currentAmount', label: 'Lager-Ist', field: 'currentAmount' },
      { name: 'missing', label: 'Fehlt aktuell', field: 'missing' }
    ]
    function editItemStockItemOrItemTypeMove (newMoveValue: number, itemStockItemOrType: IItemStockItem | IItemStockItemType) {
      itemStockItemOrType.move = newMoveValue
      // check for anything greater than 0 to enable the move button
      moveButtonDisabledState.value = !(selectedFromStock.value?.item_stock_items?.find((itemStockItem) => itemStockItem.move !== undefined && itemStockItem.move > 0) ||
        selectedFromStock.value?.item_stock_item_types?.find((itemStockItemType) => itemStockItemType.move !== undefined && itemStockItemType.move > 0))
    }
    function moveItems () {
      // prepare the data for the api call
      const itemsToMove: { id: number; move: number }[] = []
      selectedFromStock.value?.item_stock_items?.forEach((itemStockItem) => {
        if (itemStockItem.move !== undefined && itemStockItem.move > 0) {
          itemsToMove.push({
            id: itemStockItem.id,
            move: itemStockItem.move
          })
        }
      })
      const itemTypesToMove: { id: number; move: number }[] = []
      selectedFromStock.value?.item_stock_item_types?.forEach((itemStockItemType) => {
        if (itemStockItemType.move !== undefined && itemStockItemType.move > 0) {
          itemTypesToMove.push({
            id: itemStockItemType.id,
            move: itemStockItemType.move
          })
        }
      })

      api.post('/api/shopping-list/moveItems/' + props.companyId, {
        to_item_stock_id: selectedToStock.value?.id,
        from_item_stock_id: selectedFromStock.value?.id,
        item_stock_items: itemsToMove,
        item_stock_item_types: itemTypesToMove
      })
        .then(() => {
          // first update the current amount of the item stock items
          selectedFromStock.value?.item_stock_items?.forEach((itemStockItem) => {
            if (itemStockItem.move !== undefined && itemStockItem.move > 0) {
              itemStockItem.current_amount -= itemStockItem.move
            }
          })
          // then update the current amount of the item stock item types
          selectedFromStock.value?.item_stock_item_types?.forEach((itemStockItemType) => {
            if (itemStockItemType.move !== undefined && itemStockItemType.move > 0) {
              itemStockItemType.current_amount -= itemStockItemType.move
            }
          })
          // reset the move property
          const intermedBaseClone = JSON.parse(JSON.stringify(cloneBase.value))
          intermedBaseClone.forEach((itemStock: IItemStock) => {
            itemStock.item_stock_items.forEach((itemStockItem) => {
              itemStockItem.move = 0
            })
            itemStock.item_stock_item_types.forEach((itemStockItemType) => {
              itemStockItemType.move = 0
            })
          })
          cloneBase.value = intermedBaseClone
          // reset the selected stocks
          selectedFromStock.value = undefined
          selectedToStock.value = undefined
          // disable the move button
          moveButtonDisabledState.value = true
        })
        .catch((error) => {
          console.error(error)
        })
    }
    return {
      fromAvailableStocks,
      toAvailableStocks,
      selectedFromStock,
      selectedToStock,
      moveButtonDisabledState,
      fromStockColumns,
      toStockColumns,
      editItemStockItemOrItemTypeMove,
      moveItems
    }
  }
})
</script>

<style scoped>
.select_width {
  width: 45rem;
}
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
