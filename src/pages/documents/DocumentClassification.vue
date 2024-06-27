<template>
  <div class="row">
    <div class="col-12 q-mb-md">
      <create-something-new-button v-if="canCreateDocumentClassification"
                                   @click="showCreateNewClassificationDialog()"
                                   text="Dokumenten Klassifizierung erstellen"/>
      <edit-something-button v-if="canEditDocumentClassification"
                             @click="updateChangedDocumentClassifications()"
                             :disable="changedDocumentClassifications?.length !== 1"
                             class="q-ml-md"
                             text="Ausgewählte Bearbeiten"/>
      <delete-something-button v-if="canDeleteDocumentClassification"
                               @click="deleteDocumentClassifications()"
                               class="q-ml-md"
                               :disable="deleteButtonDisabled"
                               text="Ausgewählte Löschen"/>
    </div>
    <div class="col-12">
      <q-table class="full-width cms-sticky-header-table"
               title="Alle Dokumenten Klassifizierungen"
               no-data-label="Keine Dokumenten Klassifizierungen vorhanden"
               :columns="columns"
               :rows="availableDocumentClassifications"
               :loading="loading"
               :selection="canDeleteDocumentClassification ? 'multiple' : 'none'"
               v-model:selected="selectedDocumentClassifications"
               @selection="(state) => state.added ? deleteButtonDisabled = false : deleteButtonDisabled = true">
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td v-if="canDeleteDocumentClassification">
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
                              @save="(val) => editDocumentClassification(val, props.row, headerVal.name)"
                              v-if="canEditDocumentClassification">
                  <q-input v-model="scope.value"
                           outlined
                           dense
                           autofocus
                           counter
                           maxlength="64"
                           type="text"/>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'color'"
                   class="cursor-pointer row items-center justify-end" style="height: 100%">
                <div v-if="props.row.color.length > 0">
                  {{ props.row[headerVal.name] }}
                </div>
                <div v-else style="height: 100%">
                  <!-- Der div existiert nur, dass man auch was auswählen kann, wenn nix vorhanden ist.-->
                </div>
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              v-if="canEditDocumentClassification"
                              buttons label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editDocumentClassification(val, props.row, headerVal.name)">
                  <q-color v-model="scope.value"
                           class="q-mt-md color-picker"
                           :model-value="scope.value"
                           no-header-tabs
                           default-view="spectrum"
                           format-model="hex"
                           label="Farbe"/>
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
import DeleteSomethingButton from 'components/general/buttons/DeleteSomethingButton.vue'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'
import { useQuasar } from 'quasar'
import { companyStore } from 'stores/companyStore'
import IDocumentClassification from 'src/misc/interfaces/Document/IDocumentClassification'
import { useUserStore } from 'stores/useUserStore'
import laravelEcho from 'boot/laravelecho'
import { api } from 'boot/axios'
import AssignPolicies from 'src/misc/functions/policies/Policies'
import CreateNewDocumentClassificationTypeDialog from 'components/generalManagement/DocumentClassification/CreateNewDocumentClassificationTypeDialog.vue'
import FormatDateTime from '../../misc/functions/FormatDateTime'

export default defineComponent({
  name: 'DocumentClassification',
  methods: { FormatDateTime },
  components: {
    EditSomethingButton,
    CreateSomethingNewButton,
    DeleteSomethingButton
  },
  setup () {
    const $q = useQuasar()
    const cStore = companyStore()
    const companyId = computed(() => cStore.companyId)
    const canCreateDocumentClassification = ref<boolean>(false)
    const canEditDocumentClassification = ref<boolean>(false)
    const canDeleteDocumentClassification = ref<boolean>(false)
    const availableDocumentClassifications = ref<IDocumentClassification[]>([])
    const selectedDocumentClassifications = ref<IDocumentClassification[]>([])
    const deleteButtonDisabled = ref<boolean>(true)
    const changedDocumentClassifications = ref<IDocumentClassification[]>([])
    const userStore = useUserStore()
    const userId = computed(() => userStore.userId)
    const loading = ref<boolean>(false)
    const columns = [
      { name: 'name', label: 'Name', field: 'name' },
      { name: 'color', label: 'Farbe', field: 'color' },
      { name: 'updated_at', label: 'Zuletzt bearbeitet', field: 'updated_at' }
    ]
    watch(companyId, () => {
      getPermissions()
      getDocumentClassifications()
    })
    watch(userId, () => {
      // listen to the change event
      joinReloadChannel()
    })
    onMounted(() => {
      // get the permissions
      getPermissions()
      getDocumentClassifications()
      // listen to the change event
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
          changedDocumentClassifications.value = []
          selectedDocumentClassifications.value = []
          getDocumentClassifications()
        })
    }
    function getPermissions () {
      if (companyId.value <= 0) { return }
      // get the permissions
      api.get('/api/policies/generalManagement/documentClassification/' + companyId.value)
        .then((res) => {
          AssignPolicies([
            { policyName: 'Document_Management_DocumentClassification_Create', policyToAssign: canCreateDocumentClassification },
            { policyName: 'Document_Management_DocumentClassification_Edit', policyToAssign: canEditDocumentClassification },
            { policyName: 'Document_Management_DocumentClassification_Delete', policyToAssign: canDeleteDocumentClassification }
          ], res.data.documentClassificationPolicies)
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function getDocumentClassifications () {
      if (companyId.value <= 0) { return }
      loading.value = true
      api.get('/api/documentClassifications/' + companyId.value)
        .then((res) => {
          availableDocumentClassifications.value = res.data.documentClassifications
          loading.value = false
        })
        .catch((err) => {
          console.error(err)
          loading.value = false
        })
    }
    function showCreateNewClassificationDialog () {
      $q.dialog({
        component: CreateNewDocumentClassificationTypeDialog,
        componentProps: {
          companyId: companyId.value
        }
      })
    }
    function editDocumentClassification (newValue: string, document: IDocumentClassification, valueChanged: string) {
      document[valueChanged] = newValue
      if (changedDocumentClassifications.value === undefined) {
        changedDocumentClassifications.value = []
      }
      if (!changedDocumentClassifications.value.includes(document)) {
        changedDocumentClassifications.value.push(document)
      }
    }
    function updateChangedDocumentClassifications () {
      api.patch('/api/documentClassifications/edit/' + companyId.value, {
        document_classifications: changedDocumentClassifications.value
      }).catch((err) => {
        console.error(err)
      })
    }
    function deleteDocumentClassifications () {
      api.post('/api/documentClassifications/delete/' + companyId.value, {
        document_classifications: selectedDocumentClassifications.value
      }).catch((err) => {
        console.error(err)
      })
    }
    return {
      canCreateDocumentClassification,
      canEditDocumentClassification,
      canDeleteDocumentClassification,
      availableDocumentClassifications,
      selectedDocumentClassifications,
      deleteButtonDisabled,
      changedDocumentClassifications,
      editDocumentClassification,
      updateChangedDocumentClassifications,
      deleteDocumentClassifications,
      showCreateNewClassificationDialog,
      columns,
      loading
    }
  }
})
</script>

<style scoped>

</style>
