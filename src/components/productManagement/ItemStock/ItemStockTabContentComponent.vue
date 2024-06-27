<template>
  <q-tab-panel :name="`${ name }`">
    <div class="column">
      <div v-if="hectic" class="text-h4">Drauf klicken macht's laden auch nich schneller!?</div>
      <q-skeleton v-if="loading" height="5rem" @click="hectic = true"/>
      <div v-else class="column">
        <div class="row q-gutter-lg items-center">
          <q-input type="text"
                   class="col-4"
                   outlined
                   label="Name"
                   counter
                   maxlength="128"
                   v-model="itemStockName"/>
          <q-toggle class="col-2"
                    :label="`Standardlager: ${itemStockDefault ? 'Ja': 'Nein'}`"
                    :true-value="1"
                    :false-value="0"
                    v-model="itemStockDefault"/>
          <q-btn color="accent"
                 label="Aktualisieren"
                 icon="mdi-content-save"
                 v-if="canEditItemStock"
                 @click="updateItemStockFull()"/>
          <q-btn color="negative"
                 label="Löschen"
                 icon="mdi-delete"
                 v-if="canDeleteItemStock"
                 @click="deleteItemStock()"/>
        </div>
        <q-separator class="q-mt-md q-mb-md"/>
        <h6 class="q-mb-none q-mt-none" >Artikel hinzufügen</h6>
        <div class="row q-gutter-sm items-center q-pt-none">
          <q-btn color="positive"
                 icon="mdi-plus-circle-outline"
                 outline
                 class="col"
                 size="md"
                 @click="addItemToItemStock()"/>
          <q-select outlined
                    label="Artikel hinzufügen"
                    :options="availableArticles"
                    v-model="articleSelect"
                    clearable

                    option-value="id"
                    option-label="name"
                    class="col-11"
                    @filter="filterItems">
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  Keine Artikel verfügbar
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <q-table class="full-width cms-sticky-header-table default-table-height"
                 title="Artikel, die in dem Lager sind"
                 :columns="articleTableColumns"
                 :rows="itemStockItems"
                 :pagination="{ rowsPerPage: 30 }"
                 no-data-label="Keine Artikel im Lager"
                 row-key="id"
                 :selection="canDeleteItemStock ? 'single' : 'none'"
                 v-model:selected="selectedItems"
                 @selection="(state) => state.added? removeItemButtonDisabled = false : removeItemButtonDisabled = true">
          <template v-slot:top-right>
            <q-btn v-if="canEditItemStock"
                   color="accent"
                   label="Ausgewählte entfernen"
                   icon="mdi-delete"
                   :disable="removeItemButtonDisabled"
                   @click="removeItemFromItemStock()"/>
          </template>
          <template v-slot:no-data="{ message }">
            <div class="full-width row q-gutter-sm items-center">
              <q-icon size="2em" name="mdi-alert"/>
              <span>{{ message }}</span>
            </div>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props" v-if="articleTableColumns?.length > 0">
              <q-td v-if="canDelete">
                <q-checkbox color="accent"
                            v-model="props.selected"/>
              </q-td>
              <q-td v-for="headerVal in articleTableColumns"
                    :key="headerVal.name"
                    :props="props">
                <div v-if="headerVal.name === 'item'">
                  {{ props.row.item.name }}
                </div>
                <div v-if="headerVal.name === 'wanted_amount'"
                     class="cursor-pointer">
                  {{ props.row[headerVal.name] }}
                  <q-popup-edit :model-value="props.row[headerVal.name]"
                                v-slot="scope"
                                buttons
                                label-set="Übernehmen"
                                label-cancel="Abbrechen"
                                @save="(val) => editItemStockItem(val, props.row, headerVal.name)">
                    <q-input v-model.number="scope.value"
                             outlined
                             label="Soll bearbeiten"
                             type="number"
                             :max="2147483647"
                             :min="-2147483647"/>
                  </q-popup-edit>
                </div>
                <div v-if="headerVal.name === 'current_amount'"
                     class="cursor-pointer">
                  {{ props.row[headerVal.name] }}
                  <q-popup-edit :model-value="props.row[headerVal.name]"
                                v-slot="scope"
                                buttons
                                label-set="Übernehmen"
                                label-cancel="Abbrechen"
                                @save="(val) => editItemStockItem(val, props.row, headerVal.name)">
                    <q-input v-model.number="scope.value"
                             outlined
                             label="Ist bearbeiten"
                             type="number"
                             :max="2147483647"
                             :min="-2147483647"/>
                  </q-popup-edit>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
      <q-separator class="q-mt-md q-mb-md"/>
      <div v-if="hectic" class="text-h4">Drauf klicken macht's laden auch nicht schneller!?</div>
      <q-skeleton v-if="loading" height="5rem" @click="hectic = true"/>
        <div v-else class="column">
          <h6 class="q-mt-none q-mb-none">Artikeltypen hinzufügen</h6>
          <div class="row q-gutter-sm items-center q-pt-none">
            <q-btn color="positive"
                   icon="mdi-plus-circle-outline"
                   outline
                   class="col"
                   size="md"
                   @click="addItemTypeToItemStock()"/>
            <q-select outlined
                      label="Artikel-Typen hinzufügen"
                      :options="availableArticleTypes!"
                      v-model="articleTypeSelect"
                      clearable
                      option-value="id"
                      option-label="name"
                      class="col-11"
                      @filter="filterItemTypes">
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    Keine Artikeltypen verfügbar
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
          <q-table class="full-width cms-sticky-header-table default-table-height"
                   title="Artikel-Typen, die in dem Lager sind" :columns="articleTypeTableColumns"
                   :rows="itemStockItemTypes" :pagination="{ rowsPerPage: 30 }"
                   :selection="canDeleteItemStock ? 'single' : 'none'" no-data-label="Keine Artikel-Typen im Lager"
                   row-key="id" v-model:selected="selectedItemTypes"
                   @selection="(state) => state.added? removeItemTypeButtonDisabled = false : removeItemTypeButtonDisabled = true">
            <template v-slot:top-right>
              <q-btn v-if="canEditItemStock" color="accent" label="Ausgewählte entfernen" icon="mdi-delete"
                     :disable="removeItemTypeButtonDisabled" @click="removeItemTypeFromItemStock()"/>
            </template>
            <template v-slot:no-data="{ message }">
              <div class="full-width row q-gutter-sm items-center">
                <q-icon size="2em" name="mdi-alert"/>
                <span>{{ message }}</span>
              </div>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props" v-if="articleTypeTableColumns?.length > 0">
                <q-td v-if="canDelete">
                  <q-checkbox color="accent" v-model="props.selected"/>
                </q-td>
                <q-td v-for="headerVal in articleTypeTableColumns" :key="headerVal.name" :props="props">
                  <div v-if="headerVal.name === 'item_type'">
                    {{ props.row.item_type.name }}
                  </div>
                  <div v-if="headerVal.name === 'wanted_amount'" class="cursor-pointer">
                    {{ props.row[headerVal.name] }}
                    <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope" buttons
                                  label-set="Übernehmen" label-cancel="Abbrechen"
                                  @save="(val) => editItemStockItemType(val, props.row, headerVal.name)">
                      <q-input v-model.number="scope.value" outlined label="Soll bearbeiten" type="number"
                               :max="2147483647" :min="-2147483647"/>
                    </q-popup-edit>
                  </div>
                  <div v-if="headerVal.name === 'current_amount'"
                       class="cursor-pointer">
                    {{ props.row[headerVal.name] }}
                    <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope" buttons
                                  label-set="Übernehmen" label-cancel="Abbrechen"
                                  @save="(val) => editItemStockItemType(val, props.row, headerVal.name)">
                      <q-input v-model.number="scope.value" outlined label="Ist bearbeiten" type="number"
                               :max="2147483647" :min="-2147483647"/>
                    </q-popup-edit>
                  </div>
                </q-td>
              </q-tr>
            </template>
          </q-table>
      </div>
    </div>
  </q-tab-panel>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { IItemStockItem } from 'src/misc/interfaces/Item/IItemStockItem'
import { IItemStockItemType } from 'src/misc/interfaces/Item/IItemStockItemType'
import IItemStock from 'src/misc/interfaces/Item/IItemStock'
import { IItem } from 'src/misc/interfaces/Item/IItem'
import IItemType from 'src/misc/interfaces/Item/IItemType'
import { api } from 'src/boot/axios'
import { companyStore } from 'stores/companyStore'

const props = defineProps({
  name: String,
  itemStock: {
    type: Object as () => IItemStock,
    required: true
  },
  canEdit: {
    type: Boolean,
    required: true
  },
  canChangeDefault: {
    type: Boolean,
    required: true
  },
  canDelete: {
    type: Boolean,
    required: true
  }
})
const emits = defineEmits(['item-stock-deleted', 'item-stock-updated'])
const itemStockName = ref<string>(props.itemStock.name)
const itemStockDefault = ref<number | boolean>(props.itemStock.is_default)
const itemStockItems = ref<IItemStockItem[]>([])
const itemStockItemTypes = ref<IItemStockItemType[]>([])
const allArticles = ref<IItem[]>([])
const availableArticles = ref<IItem[]>([])
const allArticleTypes = ref<IItemType[]>([])
const availableArticleTypes = ref<IItemType[] | null>([])
const articleSelect = ref<IItem>()
const articleTypeSelect = ref<IItemType>()
const loading = ref<boolean>(false)
const hectic = ref<boolean>(false)
const selectedItems = ref<IItem[]>([])
const selectedItemTypes = ref<IItemType[]>([])
const canDeleteItemStock = ref<boolean>(false)
const canEditItemStock = ref<boolean>(false)
const canChangeDefaultItemStock = ref<boolean>(false)
const removeItemButtonDisabled = ref<boolean>(true)
const removeItemTypeButtonDisabled = ref<boolean>(true)
const itemStockItemsToRemove = ref<number[] | undefined>()
const itemStockItemTypesToRemove = ref<number[] | undefined>()
const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
const articleTableColumns = [
  { name: 'item', label: 'Artikel', field: 'item' },
  { name: 'wanted_amount', label: 'Lager-Soll', field: 'wanted_amount' },
  { name: 'current_amount', label: 'Lager-Ist', field: 'current_amount' }
]
const articleTypeTableColumns = [
  { name: 'item_type', label: 'Artikel-Typ', field: 'item_type' },
  { name: 'wanted_amount', label: 'Lager-Soll', field: 'wanted_amount' },
  { name: 'current_amount', label: 'Lager-Ist', field: 'current_amount' }
]
onMounted(async () => {
  // permissions
  canEditItemStock.value = props.canEdit
  canChangeDefaultItemStock.value = props.canChangeDefault
  canDeleteItemStock.value = props.canDelete
  // set values
  props.itemStock?.name === 'Lager werden geladen' ? loading.value = true : loading.value = false
  itemStockItems.value = props.itemStock?.item_stock_items
  itemStockItemTypes.value = props.itemStock?.item_stock_item_types
})
function filterItems (val: string, update: (val: () => void) => void) {
  if (allArticles.value !== null) {
    update(() => {
      const needle = val.toLowerCase()
      availableArticles.value =
        allArticles.value?.filter((v) => v.name.toLowerCase().includes(needle)) as IItem[]
      availableArticles.value = availableArticles.value?.filter((i : IItem) => {
        return !itemStockItems.value?.some((isi : IItemStockItem) => isi.item_id === i.id)
      }) as IItem[]
    })
  }
  api.get('/api/items/reducedForStock/' + companyId.value)
    .then((res) => {
      allArticles.value = res.data.items
      availableArticles.value = allArticles.value
      availableArticles.value = availableArticles.value?.filter((i : IItem) => {
        return !itemStockItems.value?.some((isi : IItemStockItem) => isi.item_id === i.id)
      }) as IItem[]
    })
    .catch((err) => {
      console.error(err)
    })
}
function filterItemTypes (val: string, update: (val: () => void) => void) {
  if (allArticles.value !== null) {
    update(() => {
      const needle = val.toLowerCase()
      availableArticleTypes.value =
        allArticleTypes.value?.filter((v) => v.name.toLowerCase().includes(needle))
      availableArticleTypes.value = availableArticleTypes.value?.filter((i : IItemType) => {
        return !itemStockItemTypes.value?.some((isi : IItemStockItemType) => isi.item_type_id === i.id)
      }) as IItemType[]
    })
  }
  api.get('/api/itemTypes/reducedForStock/' + companyId.value)
    .then((res) => {
      allArticleTypes.value = res.data.itemTypes
      availableArticleTypes.value = allArticleTypes.value
      availableArticleTypes.value = availableArticleTypes.value?.filter((i : IItemType) => {
        return !itemStockItemTypes.value?.some((isi : IItemStockItemType) => isi.item_type_id === i.id)
      }) as IItemType[]
    })
    .catch((err) => {
      console.error(err)
    })
}
function editItemStockItem (newValue: string, itemStockItem: IItemStockItem, valueChanged: string) {
  itemStockItem[valueChanged] = newValue
}
function editItemStockItemType (newValue: string, itemStockItemType: IItemStockItemType, valueChanged: string) {
  itemStockItemType[valueChanged] = newValue
}
function removeItemFromItemStock () {
  if (selectedItems.value === undefined) {
    return
  }
  for (let i = 0; i < selectedItems.value?.length; i++) {
    const index = selectedItems.value?.indexOf(selectedItems.value[i])
    if (index !== -1) {
      // add the item to the available items
      availableArticles.value?.push(selectedItems.value[i])
      // remove the item from the itemStockItems
      itemStockItems.value?.splice(index, 1)
      // add to the array of items to remove
      itemStockItemsToRemove.value ??= []
      itemStockItemsToRemove.value?.push(selectedItems.value[i].id)
    }
  }
  selectedItems.value = []
  removeItemButtonDisabled.value = true
}
function removeItemTypeFromItemStock () {
  if (selectedItemTypes.value === undefined) {
    return
  }
  for (let i = 0; i < selectedItemTypes.value?.length; i++) {
    const index = selectedItemTypes.value?.indexOf(selectedItemTypes.value[i])
    if (index !== -1) {
      // add the item to the available items
      availableArticleTypes.value?.push(selectedItemTypes.value[i])
      // remove the item from the itemStockItems
      itemStockItemTypes.value?.splice(index, 1)
      // add to the array of items to remove
      itemStockItemTypesToRemove.value ??= []
      itemStockItemTypesToRemove.value?.push(selectedItemTypes.value[i].id)
    }
  }
  selectedItemTypes.value = []
  removeItemTypeButtonDisabled.value = true
}
function addItemToItemStock () {
  // first add the selected item to the itemStockItems
  const itemStockItem: IItemStockItem = {
    id: 0,
    item_stock_id: props.itemStock.id,
    item_id: articleSelect.value?.id as number,
    item: articleSelect.value as IItem,
    wanted_amount: 0,
    current_amount: 0,
    company_id: companyId.value,
    created_at: undefined
  }
  itemStockItems.value.push(itemStockItem)
  // remove the selected item from the available items
  availableArticles.value?.indexOf(articleSelect.value as IItem) !== -1
    ? availableArticles.value?.splice(availableArticles.value?.indexOf(articleSelect.value as IItem), 1)
    : console.error('item not found in availableArticles')
  articleSelect.value = undefined
}
function addItemTypeToItemStock () {
  // first add the selected itemType to the itemStockItemTypes
  const itemStockItemType: IItemStockItemType = {
    id: 0,
    item_stock_id: props.itemStock.id,
    item_type_id: articleTypeSelect.value?.id as number,
    item_type: articleTypeSelect.value as IItemType,
    wanted_amount: 0,
    current_amount: 0,
    company_id: companyId.value,
    created_at: undefined
  }
  itemStockItemTypes.value.push(itemStockItemType)
  // remove the selected itemType from the available itemTypes
  availableArticleTypes.value?.indexOf(articleTypeSelect.value as IItemType) !== -1
    ? availableArticleTypes.value?.splice(availableArticleTypes.value?.indexOf(articleTypeSelect.value as IItemType), 1)
    : console.error('itemType not found in availableArticleTypes')
  articleTypeSelect.value = undefined
}
function updateItemStockFull () {
  // remove unnecessary data for reduced bandwidth
  const items: IItemStockItem[] = [
    ...JSON.parse(JSON.stringify(itemStockItems.value))
  ]
  items.forEach((item: Partial<IItemStockItem>) => {
    delete item.created_at
    delete item.item
  })
  const itemTypes: IItemStockItemType[] = [
    ...JSON.parse(JSON.stringify(itemStockItemTypes.value))
  ]
  itemTypes.forEach((itemType: Partial<IItemStockItemType>) => {
    delete itemType.created_at
    delete itemType.item_type
  })

  api.patch('/api/itemStocks/edit/' + companyId.value, {
    id: props.itemStock.id,
    name: itemStockName.value,
    is_default: itemStockDefault.value,
    item_stock_items: items,
    item_stock_item_types: itemTypes,
    items_to_remove: itemStockItemsToRemove.value,
    item_types_to_remove: itemStockItemTypesToRemove.value
  })
    .then(() => {
      emits('item-stock-updated', itemStockName.value)
    })
    .catch((err) => {
      console.error(err)
    })
}
function deleteItemStock () {
  if (companyId.value <= 0 || props.itemStock === undefined) return
  api.post('/api/itemStocks/delete/' + companyId.value, {
    id: props.itemStock?.id
  })
    .then(() => {
      emits('item-stock-deleted', props.itemStock?.id)
    })
    .catch((err) => {
      console.error(err)
    })
}
</script>
