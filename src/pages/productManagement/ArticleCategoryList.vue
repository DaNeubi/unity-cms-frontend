<template>
  <div class="column">
    <div class="row">
      <CreateSomethingNewButton text="Neue Artikelkategorie"
                                icon="mdi-shape-plus"
                                @create-something-new="showCreateDialog()"
                                v-if="canCreateItemCategory"/>
      <CreateSomethingNewButton text="Ausgewählte(n) Artikelkategorie(n) löschen"
                                icon="mdi-delete"
                                class="q-ml-md"
                                @create-something-new="deleteItemCategoryConfirm()"
                                v-if="CanDeleteItemCategory"/>
    </div>
    <div class="row">
      <q-table
        class="default-table-height q-mt-md full-width cms-sticky-header-table"
        virtual-scroll
        v-model:pagination="pagination"
        title="Alle Artikelkategorien"
        :columns="columns"
        no-data-label="Keine Daten vorhanden"
        :loading="loading"
        :rows="rows"
        loading-label="Daten werden abgerufen..."
        row-key="id"
        :selection="CanDeleteItemCategory ? 'multiple' : 'none'"
        v-model:selected="selectedItemCategories"
        @selection="(state) => state.added? deleteButtonDisabled = false : deleteButtonDisabled = true">
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
            <q-td v-if="CanDeleteItemCategory"
                  :style="(props.row['color'] !== undefined && props.row['color'] !== null) ? 'background-color:' + props.row['color'] + ';' : ''">
              <q-checkbox color="accent"
                          v-model="props.selected"/>
            </q-td>
            <q-td v-for="headerVal in columns"
                  :key="headerVal.name"
                  :props="props"
                  :style="(props.row['color'] !== undefined && props.row['color'] !== null) ? 'background-color:' + props.row['color'] + ';' : ''">
              <div v-if="headerVal.name === 'name'"
                   class="cursor-pointer">
                {{ props.row[headerVal.name] }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              buttons label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editItemCategory(val, props.row, headerVal.name)">
                  <q-input v-model="scope.value"
                           outlined
                           label="Name des Artikeltypen"
                           type="text"
                           counter
                           maxlength="128"/>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'description'"
                   class="cursor-pointer row items-center justify-end full-height">
                {{ props.row[headerVal.name] }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              buttons label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editItemCategory(val, props.row, headerVal.name)">
                  <q-input v-model="scope.value"
                           outlined
                           label="Beschreibung des Artikeltypen"
                           type="textarea"
                           counter
                           maxlength="255"/>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'color'"
                   class="cursor-pointer row items-center justify-end full-height">
                  {{ props.row[headerVal.name] }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              buttons label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editItemCategory(val, props.row, headerVal.name)">
                  <q-input v-model="scope.value"
                           outlined
                           label="Farbe des Artikeltypen"
                           counter
                           maxlength="32"
                           :rules="['anyColor']">
                    <template v-slot:append>
                      <q-icon name="mdi-palette" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-color v-model="scope.value"/>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </q-popup-edit>
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
import CreateNewItemCategoryDialogComponent
  from 'components/productManagement/ItemCategories/dialogs/CreateNewItemCategoryDialogComponent.vue'
import { api } from 'src/boot/axios'
import { companyStore } from 'stores/companyStore'
import { useQuasar } from 'quasar'
import IItemCategory from 'src/misc/interfaces/Item/IItemCategory'
import { useUserStore } from 'stores/useUserStore'
import laravelEcho from 'boot/laravelecho'
import AssignPolicies from 'src/misc/functions/policies/Policies'

export default defineComponent({
  name: 'ArticleCategoryList',
  components: { CreateSomethingNewButton },
  setup () {
    const columns = [
      { name: 'name', label: 'Name', field: 'name' },
      { name: 'description', label: 'Beschreibung', field: 'description' },
      { name: 'color', label: 'Farbe', field: 'color' }
    ]
    const $q = useQuasar()
    const loading = ref(true)
    const rows = ref<IItemCategory[] | undefined>([])
    const cStore = companyStore()
    const userStore = useUserStore()
    const userId = computed(() => userStore.userId)
    const companyId = computed(() => cStore.companyId)
    const canCreateItemCategory = ref<boolean>(false)
    const canEditItemCategory = ref<boolean>(false)
    const CanDeleteItemCategory = ref<boolean>(false)
    const selectedItemCategories = ref<IItemCategory[] | undefined>()
    const deleteButtonDisabled = ref<boolean>(true)
    watch(companyId, () => {
      getPermissions()
      getItemCategories()
    })
    watch(userId, () => {
      joinReloadChannel()
    })
    onMounted(() => {
      // get permissions
      getPermissions()
      joinReloadChannel()
      getItemCategories()
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
          getItemCategories()
        })
    }
    function getPermissions () {
      if (companyId.value <= 0) { return }
      api.get('/api/policies/productManagement/itemCategories/' + companyId.value)
        .then((res) => {
          AssignPolicies([
            { policyName: 'ProductManagement_ArticleCategories_Create', policyToAssign: canCreateItemCategory },
            { policyName: 'ProductManagement_ArticleCategories_Update', policyToAssign: canEditItemCategory },
            { policyName: 'ProductManagement_ArticleCategories_Delete', policyToAssign: CanDeleteItemCategory }
          ], res.data.itemCategoryPolicies)
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function getItemCategories () {
      if (companyId.value <= 0) { return }
      loading.value = true
      api.get('/api/itemCategories/reduced/' + companyId.value)
        .then((res) => {
          rows.value = res.data.itemCategories
          loading.value = false
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function deleteItemCategoryConfirm () {
      $q.dialog({
        title: 'Artikelkategorie löschen',
        message: 'Willst du die Artikelkategorie wirklich löschen?',
        cancel: true,
        persistent: true
      })
        .onOk(() => {
          deleteItemCategory()
        })
    }
    function deleteItemCategory () {
      selectedItemCategories.value?.forEach((itemCategory: IItemCategory) => {
        api.post('/api/itemCategories/delete/' + companyId.value, {
          id: itemCategory.id
        })
          .then(() => {
            const index = rows.value?.indexOf(itemCategory)
            if (index !== undefined && index !== -1) {
              rows.value?.splice(index, 1)
            }
          })
          .catch((err) => {
            console.error(err)
          })
      })
    }
    function showCreateDialog () {
      $q.dialog({
        component: CreateNewItemCategoryDialogComponent,
        ok: {
          push: true,
          label: 'Speichern'
        }
      }).onOk((newCategory: IItemCategory) => {
        api.post('/api/itemCategories/create/' + companyId.value, {
          name: newCategory.name,
          description: newCategory.description.length === 0 ? null : newCategory.description,
          color: newCategory.color
        })
          .then((res) => {
            rows.value?.push(res.data)
          })
          .catch((e) => {
            console.error(e)
          })
      })
    }
    function editItemCategory (newValue: string, itemCategory: IItemCategory, valueChanged: string) {
      itemCategory[valueChanged] = newValue
      api.patch('/api/itemCategories/edit/' + companyId.value, {
        id: itemCategory.id,
        name: itemCategory.name,
        description: itemCategory.description,
        color: itemCategory.color
      })
        .catch((err) => {
          console.error(err)
        })
    }
    return {
      pagination: ref({
        rowsPerPage: 0
      }),
      columns,
      showCreateDialog,
      loading,
      rows,
      canCreateItemCategory,
      canEditItemCategory,
      CanDeleteItemCategory,
      selectedItemCategories,
      deleteButtonDisabled,
      deleteItemCategoryConfirm,
      editItemCategory
    }
  }
})
</script>

<style scoped>

</style>
