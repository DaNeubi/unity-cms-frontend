<template>
  <div class="column">
    <div class="row">
      <CreateSomethingNewButton text="Neuen Artikel erstellen"
                                @create-something-new="showCreateDialog()"
                                v-if="canCreate"/>
      <CreateSomethingNewButton text="Ausgewählte(n) Artikel löschen"
                                icon="mdi-delete"
                                class="q-ml-md"
                                :disabled="deleteButtonDisabled"
                                @create-something-new="deleteSelectedItems()"
                                v-if="canDelete"/>
    </div>
    <div class="row">
      <q-table
        class="default-table-height q-mt-md full-width cms-sticky-header-table"
        virtual-scroll
        v-model:pagination="pagination"
        title="Alle Artikel"
        :columns="columns"
        no-data-label="Keine Daten vorhanden"
        :loading="loading"
        :rows="rows"
        row-key="id"
        :selection="canDelete ? 'multiple' : 'none'"
        v-model:selected="selectedItems"
        loading-label="Daten werden abgerufen..."
        @selection="(state) => state.added ? deleteButtonDisabled = false : deleteButtonDisabled = true">
        <template v-slot:no-data="{ message }">
          <div class="full-width row q-gutter-sm items-center">
            <q-icon size="2em" name="mdi-alert"/>
            <span>{{ message }}</span>
          </div>
        </template>
        <template v-slot:loading>
          <q-inner-loading showing color="primary"/>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props" v-if="columns?.length > 0">
            <q-td v-if="canDelete">
              <q-checkbox color="accent"
                          v-model="props.selected"/>
            </q-td>
            <q-td v-for="headerVal in columns"
                  :key="headerVal.name"
                  :props="props">
              <div v-if="headerVal.name === 'name'"
                   class="cursor-pointer">
                {{ props.row[headerVal.name] }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              v-if="canEditName"
                              buttons label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editItem(val, props.row, headerVal.name)">
                  <q-input v-model="scope.value"
                           outlined
                           label="Name des Artikels"
                           type="text"
                           counter
                           maxlength="128"
                           :min="1"/>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'description'"
                   class="cursor-pointer row items-center justify-end" style="height: 100%">
                <div v-if="props.row.description.length > 0">
                  {{ props.row[headerVal.name] }}
                </div>
                <div v-else style="height: 100%" class="">
                  <!-- Der div existiert nur, dass man auch was auswählen kann, wenn nix vorhanden ist.-->
                </div>
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              v-if="canEditDescription"
                              buttons label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editItem(val, props.row, headerVal.name)">
                  <q-input v-model="scope.value"
                           outlined label="Beschreibung des Artikels" type="text" counter :min="0" maxlength="512"/>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'purchase_price'"
                   class="cursor-pointer">
                ${{ parseFloat(props.row[headerVal.name]) }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              v-if="canEditPurchasePrice"
                              buttons label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editItem(val, props.row, headerVal.name)">
                  <q-input v-model.number="scope.value" outlined label="Einkaufspreis des Artikels" type="number"
                           :min="-2147483648" :max="2147483647"
                           hint="Bis zu 6 Stellen vor dem Komma und 4 Stellen nach dem Komma"/>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'selling_price'"
                   class="cursor-pointer">
                ${{ parseFloat(props.row[headerVal.name]) }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              v-if="canEditSellingPrice"
                              buttons label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editItem(val, props.row, headerVal.name)">
                  <q-input v-model.number="scope.value" outlined label="Verkaufspreis des Artikels"
                           type="number" :min="-2147483648" :max="2147483647"
                           hint="Bis zu 6 Stellen vor dem Komma und 4 Stellen nach dem Komma"/>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'active'"
                   class="cursor-pointer">
                {{ props.row[headerVal.name] === 1 ? 'Ja' : 'Nein' }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              v-if="canEditAvailability"
                              buttons label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editItem(val, props.row, headerVal.name)">
                  <q-checkbox v-model="scope.value"
                              keep-color
                              :true-value="1"
                              :false-value="0"
                              color="accent"
                              label="Aktiv"/>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'expense_on_sale'"
                   class="cursor-pointer">
                <div>
                  {{ props.row[headerVal.name] === 0 ? 'Nein' : 'Ja' }}
                </div>
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              v-if="canEditPurchaseOnSell"
                              buttons label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editItem(val, props.row, headerVal.name)">
                  <q-checkbox v-model="scope.value"
                              label="Einkauf aus Verkauf erstellen?"
                              :true-value="1"
                              :false-value="0"/>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'order_number'"
                   class="cursor-pointer">
                {{ props.row[headerVal.name] }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              v-if="canEditOrderNumber"
                              buttons label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editItem(val, props.row, headerVal.name)">
                  <q-input v-model.number="scope.value"
                           outlined
                           label="Sortierungsnummer des Artikels"
                           type="number"
                           :min="0"
                           :max="65535"/>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'discount_available'"
                   class="cursor-pointer">
                {{ props.row[headerVal.name] === 1 ? 'Ja' : 'Nein' }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              v-if="canEditDiscount"
                              buttons label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editItem(val, props.row, headerVal.name)">
                  <q-checkbox v-model="scope.value"
                              keep-color
                              :true-value="1"
                              :false-value="0"
                              color="accent"
                              label="Aktiv"/>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'user_share'"
                   class="cursor-pointer">
                {{ props.row[headerVal.name] === 1 ? 'Ja' : 'Nein' }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              v-if="canEditUserShare"
                              buttons label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editItem(val, props.row, headerVal.name)">
                  <q-checkbox v-model="scope.value"
                              keep-color
                              :true-value="1"
                              :false-value="0"
                              color="accent"
                              label="Aktiv"/>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'item_type_id'"
                   class="cursor-pointer row items-center justify-end full-height">
                {{ props.row.item_type?.name }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              v-if="canEditType"
                              buttons label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editItem(val, props.row, 'item_type')">
                  <q-select v-model="scope.value"
                            use-input
                            label="Artikeltyp"
                            :options="availableOptionItemTypes"
                            option-value="id"
                            option-label="name"
                            clearable
                            :display-value="availableOptionItemTypes.find((item) => item.id === scope.value)?.name"
                            @filter="filterItemType"/>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'item_category_id'"
                   class="cursor-pointer row items-center justify-end full-height">
                {{ props.row.item_category?.name }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-if="canEditCategory"
                              v-slot="scope"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editItem(val, props.row, 'item_category')">
                  <q-select v-model="scope.value"
                            use-input
                            label="Artikelkategorie"
                            :options="availableOptionItemCategories"
                            option-value="id"
                            option-label="name"
                            clearable
                            :display-value="availableOptionItemCategories.find((item) => item.id === scope.value)?.name"
                            @filter="filterItemCategory"/>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'created_at'">
                {{ FormatDateTime(props.row[headerVal.name]) }}
              </div>
              <div v-else-if="headerVal.name === 'updated_at'">
                {{ FormatDateTime(props.row[headerVal.name]) }}
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import { api } from 'boot/axios'
import { companyStore } from 'stores/companyStore'
import laravelEcho from 'boot/laravelecho'
import { useUserStore } from 'stores/useUserStore'
import { IItem } from 'src/misc/interfaces/Item/IItem'
import { useQuasar } from 'quasar'
import IItemType from 'src/misc/interfaces/Item/IItemType'
import IItemCategory from 'src/misc/interfaces/Item/IItemCategory'
import FormatDateTime from 'src/misc/functions/FormatDateTime'
import CreateNewArticleDialogComponent
  from 'components/productManagement/Articles/dialogs/CreateNewArticleDialogComponent.vue'
import AssignPolicies from 'src/misc/functions/policies/Policies'

export default defineComponent({
  name: 'ArticleList',
  components: { CreateSomethingNewButton },
  setup () {
    const $q = useQuasar()
    const columns = ref()
    const rows = ref<IItem[] | undefined>([])
    const loading = ref(true)
    const cStore = companyStore()
    const userStore = useUserStore()
    const userId = computed(() => userStore.userId)
    const companyId = computed(() => cStore.companyId)
    const canEdit = ref<boolean>(false)
    const canCreate = ref<boolean>(false)
    const canDelete = ref<boolean>(false)
    const canEditName = ref<boolean>(false)
    const canEditDescription = ref<boolean>(false)
    const canEditPurchasePrice = ref<boolean>(false)
    const canEditSellingPrice = ref<boolean>(false)
    const canEditType = ref<boolean>(false)
    const canEditCategory = ref<boolean>(false)
    const canEditDiscount = ref<boolean>(false)
    const canEditUserShare = ref<boolean>(false)
    const canEditAvailability = ref<boolean>(false)
    const canEditSubItems = ref<boolean>(false)
    const canEditOrderNumber = ref<boolean>(false)
    const canEditPurchaseOnSell = ref<boolean>(false)
    const selectedItems = ref<IItem[]>()
    const deleteButtonDisabled = ref<boolean>(true)
    const availableItemTypes = ref<IItemType[]>([])
    const availableOptionItemTypes = ref<IItemType[]>([])
    const availableItemCategories = ref<IItemCategory[]>([])
    const availableOptionItemCategories = ref<IItemCategory[]>([])
    watch(companyId, () => {
      getPermissions()
      getItems()
    })
    onMounted(() => {
      // get permissions
      joinReloadChannel()
      getPermissions()
      getItems()
    })
    watch(userId, () => {
      joinReloadChannel()
    })
    onUnmounted(() => {
      // stop listening to the change event
      laravelEcho.leave('user.reload.' + userId.value)
    })
    function joinReloadChannel () {
      if (userId.value <= 0) { return }
      // listen to the change event
      laravelEcho.private('user.reload.' + userId.value)
        .listen('.user.reload', () => {
          // just reload the companies
          loading.value = true
          rows.value = undefined
          columns.value = undefined
          getItems()
        })
    }
    function getPermissions () {
      if (companyId.value <= 0) { return }
      api.get('/api/policies/productManagement/items/' + companyId.value)
        .then((res) => {
          AssignPolicies([
            { policyName: 'ProductManagement_Articles_Create', policyToAssign: canCreate },
            { policyName: 'ProductManagement_Articles_Edit', policyToAssign: canEdit },
            { policyName: 'ProductManagement_Articles_Edit_Name', policyToAssign: canEditName },
            { policyName: 'ProductManagement_Articles_Edit_Description', policyToAssign: canEditDescription },
            { policyName: 'ProductManagement_Articles_Edit_PurchasePrice', policyToAssign: canEditPurchasePrice },
            { policyName: 'ProductManagement_Articles_Edit_SellingPrice', policyToAssign: canEditSellingPrice },
            { policyName: 'ProductManagement_Articles_Edit_Type', policyToAssign: canEditType },
            { policyName: 'ProductManagement_Articles_Edit_Category', policyToAssign: canEditCategory },
            { policyName: 'ProductManagement_Articles_Edit_SubArticles', policyToAssign: canEditSubItems },
            { policyName: 'ProductManagement_Articles_Edit_OrderNumber', policyToAssign: canEditOrderNumber },
            { policyName: 'ProductManagement_Articles_Edit_Discount', policyToAssign: canEditDiscount },
            { policyName: 'ProductManagement_Articles_Edit_UserShare', policyToAssign: canEditUserShare },
            { policyName: 'ProductManagement_Articles_Edit_Available', policyToAssign: canEditAvailability },
            { policyName: 'ProductManagement_Articles_Edit_Expense_On_Sale', policyToAssign: canEditPurchaseOnSell },
            { policyName: 'ProductManagement_Articles_Delete', policyToAssign: canDelete }
          ], res.data.itemPolicies)
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function getItems () {
      if (companyId.value <= 0) { return }
      api.get('/api/items/reduced/' + companyId.value)
        .then(response => {
          rows.value = response.data.items
          columns.value = response.data.headers
          loading.value = false
        })
        .catch(error => {
          console.error(error)
        })
    }
    function showCreateDialog () {
      $q.dialog({
        component: CreateNewArticleDialogComponent,
        ok: {
          push: true,
          label: 'Speichern'
        }
      })
        .onOk((newItem: IItem) => {
          api.post('/api/items/create/' + companyId.value, {
            name: newItem.name,
            description: newItem.description,
            purchase_price: newItem.purchase_price,
            selling_price: newItem.selling_price,
            active: newItem.active,
            order_number: newItem.order_number,
            discount_available: newItem.discount_available,
            user_share: newItem.user_share,
            is_menu: false,
            item_type_id: newItem.item_type_id,
            item_category_id: newItem.item_category,
            company_id: companyId.value,
            expense_on_sale: newItem.expense_on_sale
          })
            .then((res) => {
              rows.value?.push(res.data)
            })
            .catch((e) => {
              console.error(e)
            })
        })
    }
    function deleteSelectedItems () {
      $q.dialog({
        title: 'Artikel löschen',
        message: 'Willst du wirklich die Artikel löschen?',
        persistent: true,
        cancel: true
      })
        .onOk(() => {
          deleteItem()
        })
    }
    function deleteItem () {
      selectedItems.value?.forEach((item: IItem) => {
        api.post('/api/items/delete/' + companyId.value, {
          id: item.id
        })
          .then(() => {
            const index = rows.value?.indexOf(item)
            if (index !== undefined && index !== -1) {
              rows.value?.splice(index, 1)
            }
          })
          .catch((error) => {
            console.error(error)
          })
      })
    }
    function editItem (newValue: string, item: IItem, valueChanged: string) {
      if ((newValue === undefined || newValue.length === 0) && valueChanged !== 'description') return
      item[valueChanged] = newValue
      api.patch('/api/items/edit/' + companyId.value, {
        id: item.id,
        name: item.name,
        description: item.description,
        purchase_price: item.purchase_price,
        selling_price: item.selling_price,
        active: item.active,
        order_number: item.order_number,
        discount_available: item.discount_available,
        user_share: item.user_share,
        item_type_id: item.item_type?.id,
        expense_on_sale: item.expense_on_sale,
        item_category_id: item.item_category?.id
      })
        .then((res) => {
          const index = rows.value?.indexOf(item)
          if (index !== undefined && index !== -1) {
            rows.value?.splice(index, 1, res.data)
          }
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function filterItemType (val: string, update: (val: () => void) => void) {
      if (availableItemTypes.value !== undefined) {
        update(() => {
          const needle = val.toLowerCase()
          availableOptionItemTypes.value =
            availableItemTypes.value?.filter((v) => v.name.toLowerCase().indexOf(needle) > -1)
        })
      }
      api.get('/api/itemTypes/reducedForStock/' + companyId.value)
        .then((res) => {
          availableItemTypes.value = res.data.itemTypes
          const needle = val.toLowerCase()
          availableOptionItemTypes.value =
            availableItemTypes.value?.filter((v) => v.name.toLowerCase().indexOf(needle) > -1)
        })
    }
    function filterItemCategory (val: string, update: (val: () => void) => void) {
      if (availableItemCategories.value !== undefined) {
        update(() => {
          const needle = val.toLowerCase()
          availableOptionItemCategories.value =
            availableItemCategories.value?.filter((v) => v.name.toLowerCase().indexOf(needle) > -1)
        })
      }
      api.get('/api/itemCategories/reducedForStock/' + companyId.value)
        .then((res) => {
          availableItemCategories.value = res.data.itemCategories
          const needle = val.toLowerCase()
          availableOptionItemCategories.value =
            availableItemCategories.value?.filter((v) => v.name.toLowerCase().indexOf(needle) > -1)
        })
    }
    return {
      pagination: ref({
        rowsPerPage: 0
      }),
      columns,
      showCreateDialog,
      onMounted,
      loading,
      rows,
      canEdit,
      canCreate,
      canDelete,
      canEditName,
      canEditDescription,
      canEditPurchasePrice,
      canEditSellingPrice,
      canEditType,
      canEditCategory,
      canEditPurchaseOnSell,
      canEditDiscount,
      canEditUserShare,
      canEditAvailability,
      canEditSubItems,
      canEditOrderNumber,
      selectedItems,
      deleteButtonDisabled,
      deleteSelectedItems,
      editItem,
      availableOptionItemTypes,
      availableOptionItemCategories,
      filterItemType,
      filterItemCategory,
      FormatDateTime
    }
  }
})
</script>

<style scoped>

</style>
