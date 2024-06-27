<template>
  <div class="row items-center justify-center">
    <div class="col-12 q-mb-md">
      <div class="row q-gutter-md">
        <create-something-new-button v-if="canCreateDocumentTemplate"
                                     text="Neue Vorlage erstellen"
                                     @create-something-new="showNewTemplateNameDialog()"/>
        <edit-something-button v-if="canEditDocumentTemplate"
                               @create-something-new="updateDocumentTemplate()"
                               :disable="changedDocumentTemplates?.length !== 1"
                               text="Ausgewählte Vorlage bearbeiten"/>
        <delete-something-button v-if="canDeleteDocumentTemplate"
                                 :disable="selectedDocumentTemplates?.length !== 1"
                                 text="Ausgewählte Vorlage löschen"/>
      </div>
    </div>
    <div class="col-12">
      <q-table class="full-width cms-sticky-header-table"
               title="Alle Dokumenten Vorlagen"
               no-data-label="Keine Dokumenten Vorlagen vorhanden"
               :columns="columns"
               :loading="loading"
               :rows="availableDocumentTemplates"
               :selection="canEditDocumentTemplate || canCreateDocumentTemplate || canDeleteDocumentTemplate ? 'single': 'none'"
               :selected-rows-label="(rows) => rows + ' ausgewählt'"
               v-model:selected="selectedDocumentTemplates">
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td v-if="canDeleteDocumentTemplate">
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
                              @save="(val) => editDocumentTemplate(val, props.row, headerVal.name)"
                              v-if="canEditDocumentTemplate">
                  <q-input v-model="scope.value"
                           outlined
                           autofocus
                           counter
                           maxlength="128"/>
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
import { computed, defineComponent, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { companyStore } from 'stores/companyStore'
import { api } from 'src/boot/axios'
import AssignPolicies from 'src/misc/functions/policies/Policies'
import IDocumentTemplate from 'src/misc/interfaces/Document/IDocumentTemplate'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'
import DeleteSomethingButton from 'components/general/buttons/DeleteSomethingButton.vue'
import CreateNewDocumentTemplateDialog from 'components/documentManagement/dialogs/CreateNewDocumentTemplateDialog.vue'
import { useRouter } from 'vue-router'
import FormatDateTime from 'src/misc/functions/FormatDateTime'

export default defineComponent({
  name: 'DocumentTemplate',
  components: { DeleteSomethingButton, EditSomethingButton, CreateSomethingNewButton },
  methods: {
    FormatDateTime (date: string) {
      return FormatDateTime(date)
    }
  },
  setup () {
    const $q = useQuasar()
    const cStore = companyStore()
    const companyId = computed(() => cStore.companyId)
    const canCreateDocumentTemplate = ref<boolean>(false)
    const canEditDocumentTemplate = ref<boolean>(false)
    const canDeleteDocumentTemplate = ref<boolean>(false)
    const availableDocumentTemplates = ref<IDocumentTemplate[]>([])
    const selectedDocumentTemplates = ref<IDocumentTemplate[]>([])
    const changedDocumentTemplates = ref<IDocumentTemplate[]>([])
    const loading = ref<boolean>(false)
    const router = useRouter()
    const columns = [
      { name: 'name', label: 'Name', field: 'name' },
      { name: 'document_template_fields_count', label: 'Anzahl der Felder', field: 'document_template_fields_count' },
      { name: 'updated_at', label: 'Zuletzt bearbeitet', field: 'updated_at' }
    ]
    function getTemplates () {
      if (companyId.value <= 0) { return }
      loading.value = true
      api.get('/api/documentTemplates/' + companyId.value)
        .then((res) => {
          availableDocumentTemplates.value = res.data.documentTemplates
          loading.value = false
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function showNewTemplateNameDialog () {
      $q.dialog({
        component: CreateNewDocumentTemplateDialog,
        componentProps: {
          companyId: companyId.value
        }
      }).onOk((name: string) => {
        // navigate to the edit/creation page
        router.push('/documents/templates/' + companyId.value + '/modify/' + 0 + '/' + name)
      })
    }
    function permissions () {
      if (companyId.value <= 0) { return }
      // get the permissions
      api.get('/api/policies/generalManagement/documentTemplate/' + companyId.value)
        .then((res) => {
          AssignPolicies([
            { policyName: 'Document_Management_Template_Create', policyToAssign: canCreateDocumentTemplate },
            { policyName: 'Document_Management_Template_Edit', policyToAssign: canEditDocumentTemplate },
            { policyName: 'Document_Management_Template_Delete', policyToAssign: canDeleteDocumentTemplate }
          ], res.data.documentTemplatePolicies)
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function editDocumentTemplate (newValue: string, documentTemplate: IDocumentTemplate, valueChanged: string) {
      documentTemplate[valueChanged] = newValue
      if (changedDocumentTemplates.value === undefined) {
        changedDocumentTemplates.value = []
      }
      if (!changedDocumentTemplates.value.includes(documentTemplate)) {
        changedDocumentTemplates.value.push(documentTemplate)
      }
    }
    function updateDocumentTemplate () {
      if (companyId.value <= 0) { return }
      if (changedDocumentTemplates.value === undefined || changedDocumentTemplates.value?.length < 1) { return }
      api.patch('/api/documentTemplates/edit/' + companyId.value, {
        document_templates: changedDocumentTemplates.value
      })
        .catch((error) => {
          console.error(error)
        })
    }
    onMounted(async () => {
      permissions()
      getTemplates()
    })
    return {
      companyId,
      canCreateDocumentTemplate,
      canEditDocumentTemplate,
      canDeleteDocumentTemplate,
      availableDocumentTemplates,
      loading,
      selectedDocumentTemplates,
      columns,
      showNewTemplateNameDialog,
      editDocumentTemplate,
      updateDocumentTemplate,
      changedDocumentTemplates
    }
  }
})
</script>

<style scoped>

</style>
