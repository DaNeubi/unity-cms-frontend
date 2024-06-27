<template>
  <div class="row"
       v-if="!creatingNewMenu">
    <div class="col-12">
      <CreateSomethingNewButton text="Neues Menü erstellen"
                                v-if="canCreate"
                                @create-something-new="creatingNewMenu = !creatingNewMenu"/>
      <EditSomethingButton text="Änderungen speichern"
                           v-if="canEdit"
                           class="q-ml-lg"
                           :disable="menusToChange === undefined || menusToChange.length === 0"
                           @create-something-new="commitEditChanges()"/>
      <DeleteSomethingButton text="Ausgewählte löschen"
                             v-if="canDelete"
                             class="q-ml-lg"
                             :disable="selectedMenusToDelete === undefined || selectedMenusToDelete.length === 0"
                             @createSomethingNew="commitDeleteChanges()"/>
    </div>
    <div class="col-12">
      <q-table
        class="default-table-height q-mt-md full-width cms-sticky-header-table"
        virtual-scroll
        :pagination="{ rowsPerPage: 30 }"
        title="Menüs/Bundles"
        :columns="columns"
        :rows="availableMenus"
        :selection="canDelete ? 'multiple' : 'none'"
        row-key="id"
        v-model:selected="selectedMenusToDelete"
        no-data-label="Keine Daten vorhanden"
      >
        <template v-slot:no-data="{ message }">
          <div class="full-width row q-gutter-sm items-center">
            <q-icon size="2em" name="mdi-alert"/>
            <span>{{ message }}</span>
          </div>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
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
                              v-if="canEdit"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editMenu(val, props.row, headerVal.name)">
                  <q-input v-model="scope.value"
                           outlined
                           label="Name"
                           type="text"
                           counter
                           maxlength="128"
                           :min="1"/>
                </q-popup-edit>
              </div>
              <div v-if="headerVal.name === 'description'"
                   class="cursor-pointer row items-center justify-end"
                   style="height: 100%;">
                <div v-if="props.row[headerVal.name] !== undefined && props.row[headerVal.name].length > 0">
                  {{ props.row[headerVal.name] }}
                </div>
                <div v-else
                     style="height: 100%; display: block;">
                  <!-- Der div existiert nur, dass man auch was auswählen kann, wenn nix vorhanden ist.-->
                </div>
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              v-if="canEdit"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editMenu(val, props.row, headerVal.name)">
                  <q-input v-model="scope.value"
                          outlined
                          label="Beschreibung"
                          type="text"
                          counter
                          maxlength="512"
                          :min="0"/>
                </q-popup-edit>
              </div>
              <div v-if="headerVal.name === 'selling_price'"
                   class="cursor-pointer">
                ${{ parseFloat(props.row[headerVal.name]) }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              v-if="canEdit"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editMenu(val, props.row, headerVal.name)">
                  <q-input v-model.number="scope.value"
                           outlined
                           label="Verkaufspreis in $"
                           type="number"
                           :min="0"/>
                </q-popup-edit>
              </div>
              <div v-if="headerVal.name === 'active'"
                   class="cursor-pointer">
                {{ props.row[headerVal.name] === 1 ? 'Ja' : 'Nein' }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              v-if="canEdit"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editMenu(val, props.row, headerVal.name)">
                  <q-checkbox label="Aktiv in der Kasse?"
                              v-model="scope.value"
                              :true-value="1"
                              :false-value="0"
                              color="accent"/>
                </q-popup-edit>
              </div>
              <div v-if="headerVal.name === 'included_categories'"
                   class="cursor-pointer">
                <div v-for="(itemMenuCategories, n) in props.row.item_menu_categories ?? []"
                     :key="itemMenuCategories.id">
                  <div v-if="canEdit" @click="showMenuCategoriesEditDialog(props.row)">
                    {{ n + 1 }}. {{ itemMenuCategories.item_category?.name }} {{ itemMenuCategories.amount }}x
                  </div>
                  <div v-else>
                    {{ n + 1 }}. {{ itemMenuCategories.item_category?.name }} {{ itemMenuCategories.amount }}x
                  </div>
                </div>
              </div>
              <div v-if="headerVal.name === 'order_number'"
                   class="cursor-pointer">
                {{ props.row[headerVal.name] }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              v-if="canEdit"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editMenu(val, props.row, headerVal.name)">
                  <q-input v-model.number="scope.value"
                           outlined
                           label="Sortierungsnummer"
                           type="number"
                           :min="0"/>
                </q-popup-edit>
              </div>
              <div v-if="headerVal.name === 'discount_available'"
                   class="cursor-pointer">
                {{ props.row[headerVal.name] === 1 ? 'Ja' : 'Nein' }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              v-if="canEdit"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editMenu(val, props.row, headerVal.name)">
                  <q-checkbox label="Rabatt verfügbar?"
                              v-model="scope.value"
                              :true-value="1"
                              :false-value="0"
                              color="accent"/>
                </q-popup-edit>
              </div>
              <div v-if="headerVal.name === 'user_share'"
                   class="cursor-pointer">
                {{ props.row[headerVal.name] === 1 ? 'Ja' : 'Nein' }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              v-if="canEdit"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editMenu(val, props.row, headerVal.name)">
                  <q-checkbox label="MA-Anteil verfügbar?"
                              v-model="scope.value"
                              :true-value="1"
                              :false-value="0"
                              color="accent"/>
                </q-popup-edit>
              </div>
              <div v-if="headerVal.name === 'item_category'"
                   class="cursor-pointer row items-center justify-end"
                   style="height: 100%;">
                <div v-if="props.row.item_category !== undefined" >
                  {{ props.row.item_category?.name }}
                </div>
                <div v-else
                     style="height: 100%;">
                  <!-- Der div existiert nur, dass man auch was auswählen kann, wenn nix vorhanden ist.-->
                </div>
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              v-if="canEdit"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editMenu(val, props.row, 'item_category')">
                  <q-select v-model="scope.value"
                            use-input
                            option-value="id"
                            option-label="name"
                            :options="getAvailableCategoriesForMenu(props.row)"
                            @filter="filterItemCategory"
                            clearable/>
                </q-popup-edit>
              </div>
              <div v-if="headerVal.name === 'updated_at'">
                {{ FormatDateTime(props.row[headerVal.name]) }}
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
  <div class="row"
       v-else>
    <CreateMenuComponent :company-id="companyId" v-if="canCreate"
                         @menu-created="createNewMenu"/>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { companyStore } from 'stores/companyStore'
import { api } from 'src/boot/axios'
import { IItem } from 'src/misc/interfaces/Item/IItem'
import AssignPolicies from 'src/misc/functions/policies/Policies'
import { useQuasar } from 'quasar'
import EditMenuCategoriesDialog from 'components/productManagement/Menus/Dialog/EditMenuCategoriesDialog.vue'
import IItemMenuCategory from 'src/misc/interfaces/Item/IItemMenuCategory'
import IItemCategory from 'src/misc/interfaces/Item/IItemCategory'
import { useUserStore } from 'stores/useUserStore'
import laravelEcho from 'src/boot/laravelecho'
import CreateMenuComponent from 'components/productManagement/Menus/CreateMenuComponent.vue'
import DeleteSomethingButton from 'components/general/buttons/DeleteSomethingButton.vue'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import FormatDateTime from '../../misc/functions/FormatDateTime'

const $q = useQuasar()
const creatingNewMenu = ref<boolean>(false)
const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
const userStore = useUserStore()
const userId = computed(() => userStore.userId)
const availableMenus = ref<IItem[]>([])
const canView = ref<boolean>(false)
const canCreate = ref<boolean>(false)
const canEdit = ref<boolean>(false)
const canDelete = ref<boolean>(false)
const selectedMenusToDelete = ref<IItem[]>()
const menusToChange = ref<IItem[]>()
const availableItemCategories = ref<IItemCategory[]>([])
const availableOptionItemCategories = ref<IItemCategory[]>([])
const columns = [
  { name: 'name', label: 'Name', field: 'name', sortable: true },
  { name: 'description', label: 'Beschreibung', field: 'description' },
  { name: 'selling_price', label: 'VK', field: 'selling_price', sortable: true },
  { name: 'included_categories', label: 'Enthaltene Kategorien', field: 'included_categories', sortable: true },
  { name: 'active', label: 'Aktiv', field: 'active', sortable: true },
  { name: 'order_number', label: 'Sort.', field: 'order_number' },
  { name: 'discount_available', label: 'Rabatt', field: 'discount_available', sortable: true },
  { name: 'user_share', label: 'MA-Anteil', field: 'user_share', sortable: true },
  { name: 'item_category', label: 'Kategorie', field: 'item_category', sortable: true },
  { name: 'updated_at', label: 'Zuletzt bearbeitet', field: 'updated_at' }
]
onMounted(() => {
  getMenus()
  getPermissions()
  subscribeToChangedEvent()
})
watch(() => companyId.value, () => {
  getMenus()
  getPermissions()
})
watch(() => userId.value, () => {
  subscribeToChangedEvent()
})
onUnmounted(() => {
  laravelEcho.leave('user.reload.' + userId.value)
})
function subscribeToChangedEvent () {
  if (userId.value <= 0) { return }
  laravelEcho.private('user.reload.' + userId.value)
    .listen('.user.reload', () => {
      getMenus()
    })
}
function getPermissions () {
  if (companyId.value <= 0) return
  api.get('/api/policies/productManagement/itemMenus/' + companyId.value)
    .then((response) => {
      AssignPolicies([
        { policyName: 'ProductManagement_Menus_View', policyToAssign: canView },
        { policyName: 'ProductManagement_Menus_Create', policyToAssign: canCreate },
        { policyName: 'ProductManagement_Menus_Edit', policyToAssign: canEdit },
        { policyName: 'ProductManagement_Menus_Delete', policyToAssign: canDelete }
      ], response.data.itemMenuPolicies)
    })
    .catch((error) => {
      console.error(error)
    })
}
function getMenus () {
  if (companyId.value <= 0) return
  api.get('/api/items/menus/reduced/' + companyId.value)
    .then((response) => {
      availableMenus.value = response.data.menus
    })
    .catch((error) => {
      console.error(error)
    })
}
function editMenu (newValue: string, menu: IItem, valueChanged: string) {
  if ((newValue === undefined || newValue.length === 0) && valueChanged !== 'description') return
  menu[valueChanged] = newValue
  if (menusToChange.value === undefined) {
    menusToChange.value = []
  }
  if (menusToChange.value?.indexOf(menu) === -1) {
    menusToChange.value?.push(menu)
  }
}
function showMenuCategoriesEditDialog (menuItem: IItem) {
  $q.dialog({
    component: EditMenuCategoriesDialog,
    componentProps: {
      menu: menuItem,
      companyId: companyId.value,
      availableCategories: availableItemCategories.value
    },
    ok: {
      push: true,
      label: 'Speichern'
    }
  })
    .onOk((nowCategories: IItemMenuCategory[]) => {
      menuItem.item_menu_categories = nowCategories
      if (menusToChange.value === undefined) {
        menusToChange.value = []
      }
      if (menusToChange.value?.indexOf(menuItem) === -1) {
        menusToChange.value?.push(menuItem)
      }
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
function commitEditChanges () {
  if (companyId.value <= 0) return
  if (menusToChange.value === undefined || menusToChange.value?.length === 0) return
  api.patch('/api/items/menus/edit/' + companyId.value, {
    menus: menusToChange.value
  })
    .then(() => {
      menusToChange.value = []
      getMenus()
    })
    .catch((error) => {
      console.error(error)
    })
}
function getAvailableCategoriesForMenu (menuItem: IItem) {
  // return only categories that are not included in the itemMenuCategories
  return availableOptionItemCategories.value?.filter((itemCategory) => {
    return menuItem?.item_menu_categories?.find((currentCategory) => {
      return currentCategory.item_category_id === itemCategory.id
    }) === undefined
  })
}
function commitDeleteChanges () {
  if (companyId.value <= 0) return
  if (selectedMenusToDelete.value === undefined || selectedMenusToDelete.value?.length === 0) return
  api.post('/api/items/menus/delete/' + companyId.value, {
    menus: selectedMenusToDelete.value
  })
    .then(() => {
      selectedMenusToDelete.value = []
      getMenus()
    })
    .catch((error) => {
      console.error(error)
    })
}
function createNewMenu (menu: IItem) {
  if (companyId.value <= 0) return
  creatingNewMenu.value = !creatingNewMenu.value
  api.post('/api/items/menus/create/' + companyId.value, {
    name: menu.name,
    description: menu.description,
    selling_price: menu.selling_price,
    active: menu.active,
    order_number: menu.order_number,
    discount: menu.discount_available,
    user_share: menu.user_share,
    item_category_id: menu.item_category_id,
    categories: menu.item_menu_categories
  })
    .then(() => {
      getMenus()
    })
    .catch((err) => {
      console.error(err)
    })
}
</script>

<style scoped>

</style>
