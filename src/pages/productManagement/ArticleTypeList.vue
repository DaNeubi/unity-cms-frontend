<template>
  <div class="column">
    <div class="row">
      <CreateSomethingNewButton text="Neuer Artikeltyp"
                                icon="mdi-shape-square-plus"
                                @create-something-new="showCreateDialog()"
                                v-if="canCreateItemType"/>
      <CreateSomethingNewButton text="Ausgewählte(n) Artikeltyp(en) löschen"
                                icon="mdi-delete"
                                class="q-ml-md"
                                @create-something-new="deleteItemTypeConfirm()"
                                v-if="canDeleteItemType"/>
    </div>
    <div class="row">
      <q-table
        class="default-table-height q-mt-md full-width cms-sticky-header-table"
        virtual-scroll
        v-model:pagination="pagination"
        title="Alle Artikeltypen"
        :columns="columns"
        no-data-label="Keine Daten vorhanden"
        :loading="loading"
        :rows="rows"
        loading-label="Daten werden abgerufen..."
        row-key="id"
        :selection="canDeleteItemType ? 'multiple' : 'none'"
        v-model:selected="selectedItemTypes"
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
            <q-td v-if="canDeleteItemType"
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
                              @save="(val) => editItemType(val, props.row, headerVal.name)">
                  <q-input v-model="scope.value"
                           outlined
                           label="Name des Artikeltypen"
                           type="text"
                           counter
                           maxlength="128"/>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'description'"
                   class="cursor-pointer" style="height: 100%;">
                {{ props.row[headerVal.name] }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              buttons label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editItemType(val, props.row, headerVal.name)">
                  <q-input v-model="scope.value"
                           outlined
                           label="Beschreibung des Artikeltypen"
                           type="textarea"
                           counter
                           maxlength="255"/>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'color'"
                   class="cursor-pointer" style="height: 100%;">
                <div v-if="props.row[headerVal.name] !== null || props.row[headerVal.name] !== undefined">
                  {{ props.row[headerVal.name] }}
                </div>
                <div v-else style="height: 100%;">
                  <!-- Der div existiert nur, dass man auch was auswählen kann, wenn nix vorhanden ist.-->
                </div>
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              buttons label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editItemType(val, props.row, headerVal.name)">
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
import CreateNewItemTypeDialogComponent
  from 'components/productManagement/ItemTypes/dialogs/CreateNewItemTypeDialogComponent.vue'
import { api } from 'boot/axios'
import { companyStore } from 'stores/companyStore'
import { useUserStore } from 'stores/useUserStore'
import IItemType from 'src/misc/interfaces/Item/IItemType'
import { useQuasar } from 'quasar'
import laravelEcho from 'boot/laravelecho'
import AssignPolicies from 'src/misc/functions/policies/Policies'

export default defineComponent({
  name: 'ArticleTypeList',
  components: { CreateSomethingNewButton },
  setup () {
    const columns = [
      { name: 'name', label: 'Name', field: 'name' },
      { name: 'description', label: 'Beschreibung', field: 'description' },
      { name: 'color', label: 'Farbe', field: 'color' }
    ]
    const $q = useQuasar()
    const rows = ref<IItemType[] | undefined>([])
    const loading = ref(true)
    const cStore = companyStore()
    const userStore = useUserStore()
    const userId = computed(() => userStore.userId)
    const companyId = computed(() => cStore.companyId)
    const canCreateItemType = ref<boolean>(false)
    const canEditItemType = ref<boolean>(false)
    const canDeleteItemType = ref<boolean>(false)
    const selectedItemTypes = ref<IItemType[] | undefined>()
    const deleteButtonDisabled = ref<boolean>(true)
    watch(companyId, () => {
      getPermissions()
      getItemTypes()
    })
    onMounted(() => {
      // get permissions
      getPermissions()
      joinChangeChannel()
      getItemTypes()
    })
    watch(userId, () => {
      joinChangeChannel()
    })
    onUnmounted(() => {
      // stop listening to the change event
      laravelEcho.leave('user.reload.' + userId.value)
    })
    function joinChangeChannel () {
      if (userId.value <= 0) { return }
      // listen to the change event
      laravelEcho.private('user.reload.' + userId.value)
        .listen('.user.reload', () => {
          // just reload the companies
          loading.value = true
          rows.value = undefined
          getItemTypes()
        })
    }
    function getPermissions () {
      if (companyId.value <= 0) { return }
      api.get('/api/policies/productManagement/itemTypes/' + companyId.value)
        .then((res) => {
          AssignPolicies([
            { policyName: 'ProductManagement_ArticleTypes_Create', policyToAssign: canCreateItemType },
            { policyName: 'ProductManagement_ArticleTypes_Delete', policyToAssign: canDeleteItemType },
            { policyName: 'ProductManagement_ArticleTypes_Update', policyToAssign: canEditItemType }
          ], res.data.itemTypePolicies)
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function getItemTypes () {
      if (companyId.value <= 0) { return }
      loading.value = true
      api.get('/api/itemTypes/reduced/' + companyId.value)
        .then((response) => {
          rows.value = response.data.itemTypes
          loading.value = false
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function deleteItemTypeConfirm () {
      $q.dialog({
        title: 'Artikeltyp löschen',
        message: 'Willst du den Artikeltyp wirklich löschen?',
        persistent: true,
        cancel: true
      })
        .onOk(() => {
          deleteItemType()
        })
    }
    function deleteItemType () {
      selectedItemTypes.value?.forEach((itemType: IItemType) => {
        api.post('/api/itemTypes/delete/' + companyId.value, {
          id: itemType.id
        })
          .then(() => {
            const index = rows.value?.indexOf(itemType)
            if (index !== undefined && index !== -1) {
              rows.value?.splice(index, 1)
            }
          })
          .catch((error) => {
            console.error(error)
          })
      })
    }
    function showCreateDialog () {
      $q.dialog({
        component: CreateNewItemTypeDialogComponent,
        ok: {
          push: true,
          label: 'Erstellen'
        }
      })
        .onOk((newItemType: IItemType) => {
          api.post('/api/itemTypes/create/' + companyId.value, {
            name: newItemType.name,
            description: newItemType.description.length === 0 ? null : newItemType.description,
            color: newItemType.color ?? null
          })
            .then((response) => {
              rows.value?.push(response.data)
            })
            .catch((e) => {
              console.error(e)
            })
        })
    }
    function editItemType (newValue: string, itemType: IItemType, valueChanged: string) {
      itemType[valueChanged] = newValue
      api.patch('/api/itemTypes/edit/' + companyId.value, {
        id: itemType.id,
        name: itemType.name,
        description: itemType.description,
        color: itemType.color
      })
        .catch((error) => {
          console.error(error)
        })
    }
    return {
      pagination: ref({
        rowsPerPage: 0
      }),
      columns,
      rows,
      showCreateDialog,
      loading,
      editItemType,
      deleteItemTypeConfirm,
      canCreateItemType,
      canEditItemType,
      canDeleteItemType,
      selectedItemTypes,
      deleteButtonDisabled
    }
  }
})
</script>

<style scoped>

</style>
