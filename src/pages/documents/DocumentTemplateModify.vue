<template>
  <div class="full-width">
    <div class="row q-gutter-md" v-if="!loading">
      <document-field-button v-for="field in availableDocumentFields"
                             :key="field.id"
                             :label="field.name"
                             :fillable-field="field.has_template"
                             icon="mdi-plus-thick"
                             @execute="addGridItem(field)"/>
      <create-something-new-button icon="mdi-content-save"
                                   text="Speichern"
                                   @create-something-new="doSomethingWithTemplate()"/>
    </div>
    <div class="row q-gutter-md" v-else>
      <q-skeleton type="QBtn" animation="blink" v-for="n in 5" :key="n" width="9rem"/>
    </div>
    <div class="grid-stack">
      <div v-for="w in definedTemplateFields" class="grid-stack-item bg-accent text-white" :gs-x="w.position.x"
           :gs-y="w.position.y" :gs-w="w.position.w" :gs-h="w.position.h" :gs-id="w.id" :id="w.id" :key="w.id">
        <div class="grid-stack-item-content">
          <div class="row items-center justify-center q-ma-sm">
            <div class="col-12">
              <q-input outlined
                       :label="w.document_field?.name"
                       v-model="w.value"/>
            </div>
            <div class="col-12 q-mt-sm">
              <div v-if="w.document_field?.type === 'MITARBEITERSELECT'">
                Hier sind dann alle Mitarbeiter deines Gewerbes in einem Dropdown auswählbar.
              </div>
              <div v-else-if="w.document_field?.type === 'COMPANYNAME'">
                Hier wird dann der Name deines Gewerbes angezeigt.
              </div>
              <div v-else-if="w.document_field?.type === 'DATE'">
                Hier kann dann ein Datum ausgewählt werden.
              </div>
              <div v-else-if="w.document_field?.type === 'DATETIME'">
                Hier kann dann ein Datum und eine Uhrzeit ausgewählt werden.
              </div>
              <div v-else-if="w.document_field?.type === 'TEXTAREA'">
                Hier kann dann viel oder wenig Text rein.
              </div>
              <div v-else-if="w.document_field?.type === 'RADIOGROUP'">
                Hier kann man dann zwischen Ja oder Nein auswählen.
              </div>
              <div v-else-if="w.document_field?.type === 'SIGN'">
                Hier kann eine externe Person dann unterschreiben.
              </div>
              <div v-else-if="w.document_field?.type === 'COMPANYIMAGE'">
                Hier wird dann das Firmenlogo angezeigt.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch, nextTick, computed } from 'vue'
import DocumentFieldButton from 'components/general/buttons/documentManagementButton/DocumentFieldButton.vue'
import { api } from 'src/boot/axios'
import IDocumentField from 'src/misc/interfaces/Document/IDocumentField'
import IDocumentTemplateField from 'src/misc/interfaces/Document/IDocumentTemplateField'
import 'gridstack/dist/gridstack.min.css'
import { GridStack, GridStackNode } from 'gridstack'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import { useRoute, useRouter } from 'vue-router'
import { companyStore } from 'stores/companyStore'
import AssignPolicies from 'src/misc/functions/policies/Policies'

export default defineComponent({
  name: 'DocumentTemplateModify',
  components: { CreateSomethingNewButton, DocumentFieldButton },
  setup () {
    const availableDocumentFields = ref<IDocumentField[]>([])
    const idCounter = ref<number>(0)
    const loading = ref<boolean>(false)
    const definedTemplateFields = ref<IDocumentTemplateField[]>([])
    let grid: GridStack | null = null
    const route = useRoute()
    const router = useRouter()
    const cStore = companyStore()
    const canCreateDocumentTemplate = ref<boolean>(false)
    const canEditDocumentTemplate = ref<boolean>(false)
    const companyId = computed(() => cStore.companyId)
    function addGridItem (field: IDocumentField) {
      // create the new object
      const newTemplateField: IDocumentTemplateField =
        { id: 'itm_' + idCounter.value.toString(), value: '', position: { x: 0, y: 0, h: 2, w: 2 }, document_field: field, document_field_id: field.id }
      definedTemplateFields.value ??= []
      definedTemplateFields.value?.push(newTemplateField)
      nextTick(() => {
        grid?.makeWidget(newTemplateField.id)
      })
      idCounter.value++
    }
    function onChange (event: Event, changeItems: GridStackNode[]) {
      // update item position
      changeItems.forEach((item) => {
        const widget = definedTemplateFields.value?.find(x => x.id === item.id)
        if (!widget) return
        widget.position.x = item.x ?? 0
        widget.position.y = item.y ?? 0
        widget.position.w = item.w ?? 0
        widget.position.h = item.h ?? 0
      })
    }
    function getAllAvailableDocumentFields () {
      if (companyId.value === 0) return
      loading.value = true
      api.get('/api/documentFields/' + companyId.value)
        .then((response) => {
          availableDocumentFields.value = response.data.fields
          loading.value = false
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function doSomethingWithTemplate () {
      if (companyId.value === 0) return
      // do the right thing
      if (+route.params.templateId > 0) {
        updateTemplate()
      } else {
        createNewTemplate()
      }
    }
    function updateTemplate () {
      // if (companyId.value === 0) return
      // update the template
    }
    function createNewTemplate () {
      if (companyId.value === 0) return
      // create a new template
      api.post('/api/documentTemplates/create/' + companyId.value, {
        name: route.params.name,
        fields: definedTemplateFields.value
      })
        .catch((error) => {
          console.error(error)
        })
    }
    watch(() => companyId.value, () => {
      // back to the main overview for the templates
      router.push('/documents/templates/' + companyId.value)
    })
    function initGrid () {
      grid = GridStack.init({
        float: true,
        cellHeight: '70px',
        column: 12,
        minRow: 4,
        resizable: {
          handles: 'e, se, s, sw, w'
        },
        animate: true
      })
      // listen to the change event
      grid.on('change', onChange)
    }
    function permissions () {
      if (companyId.value <= 0) { return }
      // get the permissions
      api.get('/api/policies/generalManagement/documentTemplate/' + companyId.value)
        .then((res) => {
          AssignPolicies([
            { policyName: 'Document_Management_Template_Create', policyToAssign: canCreateDocumentTemplate },
            { policyName: 'Document_Management_Template_Edit', policyToAssign: canEditDocumentTemplate }
          ], res.data.documentTemplatePolicies)
        })
        .catch((err) => {
          console.error(err)
        })
    }
    onMounted(() => {
      permissions()
      getAllAvailableDocumentFields()
      initGrid()
    })
    return {
      addGridItem,
      availableDocumentFields,
      loading,
      definedTemplateFields,
      doSomethingWithTemplate
    }
  }
})
</script>

<style scoped>

</style>
