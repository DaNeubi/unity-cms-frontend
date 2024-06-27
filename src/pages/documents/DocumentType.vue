<template>
  <div class="row">
    <div class="col-12 q-mb-md">
      <create-something-new-button v-if="canCreateDocumentType"
                                   @click="showCreateNewTypeDialog()"
                                   text="Dokumenten Typ erstellen"/>
      <edit-something-button v-if="canEditDocumentType"
                             @click="updateChangedDocumentTypes()"
                             :disable="changedDocumentTypes?.length !== 1"
                             class="q-ml-md"
                             text="Ausgewählte Bearbeiten"/>
      <delete-something-button v-if="canDeleteDocumentType"
                               @click="deleteDocumentType()"
                               class="q-ml-md"
                               :disable="deleteButtonDisabled"
                               text="Ausgewählte Löschen"/>
    </div>
    <div class="col-12">
      <q-table class="full-width cms-sticky-header-table"
               title="Alle Dokumenten Typen"
               no-data-label="Keine Dokumenten Typen vorhanden"
               :columns="columns"
               :rows="availableDocumentTypes"
               :loading="loading"
               loading-label="Daten werden abgerufen..."
               :selection="canDeleteDocumentType ? 'multiple' : 'none'"
               v-model:selected="selectedDocumentTypes"
               @selection="(state) => state.added ? deleteButtonDisabled = false : deleteButtonDisabled = true">
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td v-if="canDeleteDocumentType">
              <q-checkbox color="accent" v-model="props.selected"/>
            </q-td>
            <q-td v-for="headerVal in columns"
                  :key="headerVal.name"
                  :props="props">
              <div v-if="headerVal.name === 'name'"
                   class="cursor-pointer">
                {{ props.row[headerVal.name] }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editDocumentType(val, props.row, headerVal.name)"
                              v-if="canEditDocumentType">
                  <q-input v-model="scope.value"
                           outlined
                           dense
                           autofocus
                           counter
                           maxlength="64"
                           type="text"/>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'updated_at'">
                {{ FormatDateTime(props.row[headerVal.name]) }}
              </div>
              <div v-else>
                {{ props.row[headerVal.name] }}
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
import { useQuasar } from 'quasar'
import { companyStore } from 'stores/companyStore'
import IDocumentType from 'src/misc/interfaces/Document/IDocumentType'
import { api } from 'boot/axios'
import AssignPolicies from 'src/misc/functions/policies/Policies'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'
import DeleteSomethingButton from 'components/general/buttons/DeleteSomethingButton.vue'
import CreateNewDocumentTypeDialog from 'components/generalManagement/DocumentType/CreateNewDocumentTypeDialog.vue'
import FormatDateTime from '../../misc/functions/FormatDateTime'
import laravelEcho from 'boot/laravelecho'
import { useUserStore } from 'stores/useUserStore'

export default defineComponent({
  name: 'DocumentType',
  methods: { FormatDateTime },
  components: { DeleteSomethingButton, EditSomethingButton, CreateSomethingNewButton },
  setup () {
    const $q = useQuasar()
    const cStore = companyStore()
    const companyId = computed(() => cStore.companyId)
    const canCreateDocumentType = ref<boolean>(false)
    const canEditDocumentType = ref<boolean>(false)
    const canDeleteDocumentType = ref<boolean>(false)
    const availableDocumentTypes = ref<IDocumentType[]>([])
    const selectedDocumentTypes = ref<IDocumentType[]>([])
    const deleteButtonDisabled = ref<boolean>(true)
    const changedDocumentTypes = ref<IDocumentType[]>([])
    const userStore = useUserStore()
    const userId = computed(() => userStore.userId)
    const loading = ref<boolean>(false)
    const columns = [
      { name: 'name', label: 'Name', field: 'name' },
      { name: 'updated_at', label: 'Zuletzt bearbeitet', field: 'updated_at' }
    ]
    watch(companyId, () => {
      getPermissions()
      getDocumentTypes()
    })
    watch(userId, () => {
      joinReloadChannel()
    })
    onMounted(() => {
      // get the permissions
      getPermissions()
      getDocumentTypes()
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
          // just reload the types
          changedDocumentTypes.value = []
          selectedDocumentTypes.value = []
          getDocumentTypes()
        })
    }
    function showCreateNewTypeDialog () {
      $q.dialog({
        component: CreateNewDocumentTypeDialog,
        componentProps: {
          companyId: companyId.value
        }
      })
    }
    function getPermissions () {
      if (companyId.value <= 0) { return }
      // get the permissions
      api.get('/api/policies/generalManagement/documentTypes/' + companyId.value)
        .then((res) => {
          AssignPolicies([
            { policyName: 'Document_Management_DocumentType_Create', policyToAssign: canCreateDocumentType },
            { policyName: 'Document_Management_DocumentType_Edit', policyToAssign: canEditDocumentType },
            { policyName: 'Document_Management_DocumentType_Delete', policyToAssign: canDeleteDocumentType }
          ], res.data.documentTypePolicies)
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function getDocumentTypes () {
      if (companyId.value <= 0) { return }
      loading.value = true
      api.get('/api/documentTypes/' + companyId.value)
        .then((res) => {
          availableDocumentTypes.value = res.data.documentTypes
          loading.value = false
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function editDocumentType (newValue: string, document: IDocumentType, valueThatChanged: string) {
      document[valueThatChanged] = newValue
      if (changedDocumentTypes.value === undefined) {
        changedDocumentTypes.value = []
      }
      if (!changedDocumentTypes.value.includes(document)) {
        changedDocumentTypes.value.push(document)
      }
    }
    function updateChangedDocumentTypes () {
      api.patch('/api/documentTypes/edit/' + companyId.value, {
        document_types: changedDocumentTypes.value
      })
        .catch((err) => {
          console.error(err)
        })
    }
    function deleteDocumentType () {
      api.post('/api/documentTypes/delete/' + companyId.value, {
        document_types: selectedDocumentTypes.value
      })
        .catch((err) => {
          console.error(err)
        })
    }
    return {
      canCreateDocumentType,
      canEditDocumentType,
      canDeleteDocumentType,
      availableDocumentTypes,
      columns,
      loading,
      selectedDocumentTypes,
      deleteButtonDisabled,
      showCreateNewTypeDialog,
      editDocumentType,
      changedDocumentTypes,
      updateChangedDocumentTypes,
      deleteDocumentType
    }
  }
})
</script>

<style scoped>

</style>
