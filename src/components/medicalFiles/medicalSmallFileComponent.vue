<template>
  <div class="row">
    <div class="col-12">
      <div class="text-body1">
        Triageeintrag
      </div>
      <q-input type="textarea"
               counter
               v-model="medicalDocument.triage"
               filled
               autogrow
               maxlength="1000"/>
    </div>
    <div class="col-4">
      <q-select filled
                v-model="medicalDocument.document_type_id"
                :options="documentTypes"
                option-value="id"
                option-label="name"
                label="Dokumenttyp"/>
    </div>
    <div class="col-8"></div>
    <div class="col-12 q-mt-sm">
      <div class="text-body1">
        Behandlung/Notizfeld
      </div>
      <q-input type="textarea"
               counter
               v-model="medicalDocument.treatment"
               filled
               autogrow
               maxlength="6000"/>
    </div>
    <div class="col-12 q-mt-md">
      <div class="row justify-end">
        <med-general-button label="Medizinisches Gutachten" icon="mdi-file-document-outline"/>
      </div>
    </div>
    <div class="col-12 q-mt-sm q-mb-sm">
      hier kommt ne historie
    </div>
    <div class="col-12 q-mt-md">
      <div class="row justify-between">
        <med-general-button label="Speichern & Schließen"/>
        <med-save-button />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import IDocumentType from 'src/misc/interfaces/Document/IDocumentType'
import IMedicalDocument from 'src/misc/interfaces/Document/Medical/IMedicalDocument'
import { defineComponent, onMounted, ref, watch } from 'vue'
import MedGeneralButton from 'components/general/buttons/medicalButton/MedGeneralButton.vue'
import MedSaveButton from 'components/general/buttons/medicalButton/MedSaveButton.vue'

export default defineComponent({
  name: 'medicalSmallFileComponent',
  components: { MedSaveButton, MedGeneralButton },
  props: {
    document: {
      type: Object as () => IMedicalDocument,
      required: true
    },
    documentTypes: {
      type: Array as () => IDocumentType[] | undefined,
      required: true
    }
  },
  emits: ['update:document'],
  setup (props, { emit }) {
    const medicalDocument = ref<IMedicalDocument>(props.document)
    watch(() => props.document, () => {
      emit('update:document', props.document)
    })
    onMounted(() => {
      // TODO: listen to each field for changes and emit update:document
    })
    return {
      medicalDocument
    }
  }
})
</script>

<style scoped>

</style>
