<template>
  <q-tab-panel :name="`${ name }`">
    <div class="column">
      <h5 class="q-mt-sm q-mb-md">Neues Lager erstellen</h5>
      <div>
        <q-btn color="accent"
               label="Lager hinzufügen"
               icon="mdi-format-list-group-plus"
               @click="createItemStock()"/>
      </div>
      <q-separator class="q-mt-md q-mb-md"/>
      <q-input v-model="stockName" label="Name des Lagers" outlined reactive-rules
               :rules="[val => val.length > 0 || 'Das muss schon!']"/>
      <q-separator class="q-mt-md q-mb-md"/>
      <span class="hint-text">
        Aus einem Standard-Lager wird immer zuerst entnommen,
        sofern in der Kasse nicht explizit ein Lager angegeben wurde.<br/>
        Es kann immer nur ein Standard-Lager geben.<br/>
        Es MUSS immer ein Standard-Lager vorhanden sein. Es ist nicht möglich mit Artikelbeständen zu arbeiten ohne ein Standardlager zu haben.
      </span>
      <q-checkbox v-model="defaultStock"
                  :label="`Standard Lager? ${ (defaultStock ? 'Ja' : 'Nein') }`"/>
      <q-separator class="q-mt-md q-mb-md"/>
      <h6 class="q-mt-none q-mb-none">Artikel hinzufügen</h6>
      <div class="row q-gutter-sm items-center q-pt-none">
        <q-btn color="positive"
               icon="mdi-plus-circle-outline"
               outline
               class="col"
               size="md"
               @click="addItemToItemStock"/>
        <q-select outlined
                  label="Artikel hinzufügen..."
                  :options="availableArticles"
                  v-model="articleSelect"
                  clearable
                  class="col-11"
                  option-value="id"
                  option-label="name"
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
               title="Artikel, die in dem Lager sein werden"
               :columns="articleTableColumns"
               :rows="itemStockItems"
               no-data-label="Keine Artikel ausgewählt"
               row-key="id"
               :pagination=" { rowsPerPage: 15 }"
               v-model:selected="selectedItems"
               :selection="'single'"
               @selection="(state) => state.added? removeItemButtonDisabled = false : removeItemButtonDisabled = true">
        <template v-slot:top-right>
          <q-btn color="accent"
                 icon="mdi-delete"
                 label="Ausgewählte entfernen"
                 :disable="removeItemButtonDisabled"
                 @click="removeItemsFromItemStock()"/>
        </template>
        <template v-slot:no-data="{ message }">
          <div class="full-width row q-gutter-sm items-center">
            <q-icon size="2em" name="mdi-alert"/>
            <span>{{ message }}</span>
          </div>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props" v-if="articleTableColumns?.length > 0">
            <q-td>
              <q-checkbox color="accent"
                          v-model="props.selected"/>
            </q-td>
            <q-td v-for="headerVal in articleTableColumns" :key="headerVal.name" :props="props">
              <div v-if="headerVal.name === 'item'">
                {{ props.row.item.name }}
              </div>
              <div v-if="headerVal.name === 'wanted_amount'" class="cursor-pointer">
                {{ props.row[headerVal.name] }}
                <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope" buttons label-set="Übernehmen"
                              label-cancel="Abbrechen"
                              @save="(val) => editItemStockItem(val, props.row, headerVal.name)">
                  <q-input v-model.number="scope.value" outlined label="Soll bearbeiten" type="number"
                           :max="2147483647" :min="-2147483647"/>
                </q-popup-edit>
              </div>
              <div v-if="headerVal.name === 'current_amount'"
                   class="cursor-pointer">
                {{ props.row[headerVal.name] }}
                <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope" buttons label-set="Übernehmen"
                              label-cancel="Abbrechen"
                              @save="(val) => editItemStockItem(val, props.row, headerVal.name)">
                  <q-input v-model.number="scope.value" outlined label="Ist bearbeiten" type="number"
                           :max="2147483647" :min="-2147483647"/>
                </q-popup-edit>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
      <q-separator class="q-mt-md q-mb-md"/>
      <h6 class="q-mt-none q-mb-none">Artikeltypen hinzufügen</h6>
      <div class="row q-gutter-sm items-center q-pt-none">
        <q-btn color="positive" icon="mdi-plus-circle-outline" outline class="col" size="md"
               @click="addItemTypeToItemStock"/>
        <q-select outlined label="Artikel-Typen hinzufügen..." :options="availableArticleTypes"
                  v-model="articleTypeSelect" clearable class="col-11" option-label="name" option-value="id"
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
               title="Artikel-Typen, die in dem Lager sein werden" :columns="articleTypeTableColumns"
               :rows="itemStockItemTypes" row-key="id" v-model:selected="selectedItemTypes"
               :selection="'single'" :pagination="{ rowsPerPage: 15 }"
               @selection="(state) => state.added? removeItemTypeButtonDisabled = false : removeItemTypeButtonDisabled = true"
               no-data-label="Keine Artikel-Typen ausgewählt">
        <template v-slot:top-right>
          <q-btn color="accent" icon="mdi-delete" label="Ausgewählte entfernen" size="md"
                 :disable="removeItemTypeButtonDisabled" @click="removeItemTypesFromItemStock()"/>
        </template>
        <template v-slot:no-data="{ message }">
          <div class="full-width row q-gutter-sm items-center">
            <q-icon size="2em" name="mdi-alert"/>
            <span>{{ message }}</span>
          </div>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props" v-if="articleTypeTableColumns?.length > 0">
            <q-td>
              <q-checkbox color="accent"
                          v-model="props.selected"/>
            </q-td>
            <q-td v-for="headerVal in articleTypeTableColumns" :key="headerVal.name" :props="props">
              <div v-if="headerVal.name === 'item_type'">
                {{ props.row.item_type.name }}
              </div>
              <div v-if="headerVal.name === 'wanted_amount'"
                   class="cursor-pointer">
                {{ props.row[headerVal.name] }}
                <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope"
                              buttons label-set="Übernehmen" label-cancel="Abbrechen"
                              @save="(val) => editItemStockItemType(val, props.row, headerVal.name)">
                  <q-input v-model.number="scope.value" outlined label="Soll bearbeiten" type="number"
                           :max="2147483647" :min="-2147483647"/>
                </q-popup-edit>
              </div>
              <div v-if="headerVal.name === 'current_amount'"
                   class="cursor-pointer">
                {{ props.row[headerVal.name] }}
                <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope" buttons label-set="Übernehmen"
                              label-cancel="Abbrechen"
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
  </q-tab-panel>
</template>

<script setup lang="ts">
import { IItem } from 'src/misc/interfaces/Item/IItem'
import IItemType from 'src/misc/interfaces/Item/IItemType'
import { computed, ref } from 'vue'
import { IItemStockItem } from 'src/misc/interfaces/Item/IItemStockItem'
import { api } from 'boot/axios'
import { IItemStockItemType } from 'src/misc/interfaces/Item/IItemStockItemType'
import { companyStore } from 'stores/companyStore'

defineProps({
  name: {
    type: String,
    required: true
  },
  canCreate: {
    type: Boolean,
    required: true
  }
})
const emits = defineEmits(['item-stock-created'])
const defaultStock = ref<boolean>(false)
const stockName = ref<string>()
const articles = ref<IItem[]>()
const articleTypes = ref<IItemType[]>()
const availableArticles = ref()
const articleSelect = ref<IItem>()
const availableArticleTypes = ref()
const articleTypeSelect = ref<IItemType>()
const itemStockItems = ref<IItemStockItem[]>([])
const itemStockItemTypes = ref<IItemStockItemType[]>([])
const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
const selectedItems = ref<IItem[]>([])
const selectedItemTypes = ref<IItemType[]>([])
const removeItemButtonDisabled = ref<boolean>(true)
const removeItemTypeButtonDisabled = ref<boolean>(true)
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
function createItemStock () {
  if (stockName.value === undefined || stockName.value === '') {
    return
  }
  const items: IItemStockItem[] = [
    ...itemStockItems.value
  ]
  items.forEach((item: Partial<IItemStockItem>) => {
    delete item.created_at
    delete item.item
  })
  const itemTypes: IItemStockItemType[] = [
    ...itemStockItemTypes.value
  ]
  itemTypes.forEach((itemType: Partial<IItemStockItemType>) => {
    delete itemType.created_at
    delete itemType.item_type
  })

  api.post('/api/itemStocks/create/' + companyId.value, {
    name: stockName.value,
    is_default: defaultStock.value,
    itemStockItems: items,
    itemStockItemTypes: itemTypes
  })
    .then((res) => {
      emits('item-stock-created', res.data)
    })
    .catch((error) => {
      console.error(error)
    })
}
function addItemToItemStock () {
  if (articleSelect.value === undefined) {
    return
  }
  // add the selected item to the itemStockItems
  const itemStockItem: IItemStockItem = {
    id: 0,
    item_stock_id: 0,
    item_id: articleSelect.value?.id as number,
    item: articleSelect.value as IItem,
    wanted_amount: 0,
    current_amount: 0,
    company_id: companyId.value,
    created_at: undefined
  }
  itemStockItems.value.push(itemStockItem)
  // remove the selected item from the available items
  availableArticles.value = availableArticles.value?.filter((i : IItem) => {
    return i.id !== articleSelect.value?.id
  }) as IItem[]
  articleSelect.value = undefined
}
function addItemTypeToItemStock () {
  if (articleTypeSelect.value === undefined) {
    return
  }
  // add the selected itemType to the itemStockItemTypes
  const itemStockItemType: IItemStockItemType = {
    id: 0,
    item_stock_id: 0,
    item_type_id: articleTypeSelect.value?.id as number,
    item_type: articleTypeSelect.value as IItemType,
    wanted_amount: 0,
    current_amount: 0,
    company_id: companyId.value,
    created_at: undefined
  }
  itemStockItemTypes.value.push(itemStockItemType)
  // remove the selected itemType from the available itemTypes
  availableArticleTypes.value = availableArticleTypes.value?.filter((i : IItemType) => {
    return i.id !== articleTypeSelect.value?.id
  }) as IItemType[]
  articleTypeSelect.value = undefined
}
function removeItemsFromItemStock () {
  if (selectedItems.value.length === 0) {
    return
  }
  for (let i = 0; i < selectedItems.value.length; i++) {
    const index = selectedItems.value.indexOf(selectedItems.value[i])
    if (index !== -1) {
      // add the item to the available items
      availableArticles.value.push(selectedItems.value[i])
      // remove the item from the itemStockItems
      itemStockItems.value.splice(index, 1)
    }
  }
}
function removeItemTypesFromItemStock () {
  if (selectedItemTypes.value.length === 0) {
    return
  }
  for (let i = 0; i < selectedItemTypes.value.length; i++) {
    const index = selectedItemTypes.value.indexOf(selectedItemTypes.value[i])
    if (index !== -1) {
      // add the itemType to the available itemTypes
      availableArticleTypes.value.push(selectedItemTypes.value[i])
      // remove the itemType from the itemStockItemTypes
      itemStockItemTypes.value.splice(index, 1)
    }
  }
}
function filterItems (val: string, update: (val: () => void) => void) {
  if (articles.value !== null) {
    update(() => {
      const needle = val.toLowerCase()
      availableArticles.value =
        articles.value?.filter((v) => v.name.toLowerCase().includes(needle)) as IItem[]
      availableArticles.value = availableArticles.value?.filter((i : IItem) => {
        return !itemStockItems.value?.some((isi : IItemStockItem) => isi.item_id === i.id)
      }) as IItem[]
    })
  }
  api.get('/api/items/reducedForStock/' + companyId.value)
    .then((res) => {
      articles.value = res.data.items
      availableArticles.value = articles.value
      availableArticles.value = availableArticles.value?.filter((i : IItem) => {
        return !itemStockItems.value?.some((isi : IItemStockItem) => isi.item_id === i.id)
      }) as IItem[]
    })
    .catch((err) => {
      console.error(err)
    })
}
function filterItemTypes (val: string, update: (val: () => void) => void) {
  if (articleTypes.value !== null) {
    update(() => {
      const needle = val.toLowerCase()
      availableArticleTypes.value =
        articleTypes.value?.filter((v) => v.name.toLowerCase().includes(needle))
      availableArticleTypes.value = availableArticleTypes.value?.filter((i : IItemType) => {
        return !itemStockItemTypes.value?.some((isi : IItemStockItemType) => isi.item_type_id === i.id)
      }) as IItemType[]
    })
  }
  api.get('/api/itemTypes/reducedForStock/' + companyId.value)
    .then((res) => {
      articleTypes.value = res.data.itemTypes
      availableArticleTypes.value = articleTypes.value
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
</script>
