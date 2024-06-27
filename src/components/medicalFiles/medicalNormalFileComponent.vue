<template>
  <div class="row items-center">
    <div class="col-12">
      <div class="text-body1">
        Triageeintrag
      </div>
      <q-input type="textarea"
               counter
               v-model="medicalDocument.triage"
               filled
               autogrow
               maxlength="2048"/>
    </div>
    <div class="col-4">
      <q-select filled
                v-model="medicalDocument.document_type_id"
                :options="documentTypes"
                option-value="id"
                option-label="name"
                label="Dokumenttyp"/>
    </div>
    <div class="col-7"></div>
    <div class="col-1">
      <q-checkbox label="Psychologische Akte"
                  v-model="medicalDocument.psychological"
                  v-if="canSeePsychological"/>
    </div>
    <div class="col-12 q-mt-sm">
      <div class="text-body1">
        Symptome
      </div>
      <q-input type="textarea"
               counter
               v-model="medicalDocument.symptoms"
               filled
               autogrow
               maxlength="1000"/>
    </div>

    <div class="col-12">
      <div class="row items-center justify-between">
        <div class="col-7 q-mt-sm">
          <div class="text-body1">
            Untersuchungen
          </div>
          <q-input type="textarea"
                   counter
                   v-model="medicalDocument.examinations"
                   filled
                   autogrow
                   maxlength="1500"/>
        </div>
        <div class="col-4 q-mt-sm">
          <medical-text-template-select options=""
                                        name="Untersuchungs"/>
        </div>
      </div>
    </div>
    <div class="col-12 q-mt-sm">
      <div class="text-body1">
        Diagnose
      </div>
      <q-input type="textarea"
               counter
               v-model="medicalDocument.diagnosis"
               filled
               autogrow
               maxlength="1000"/>
    </div>
    <div class="col-12">
      <div class="row items-center justify-between">
        <div class="col-7 q-mt-sm">
          <div class="text-body1">
            OP Vorbereitung
          </div>
          <q-input type="textarea"
                   counter
                   v-model="medicalDocument.operationPreparation"
                   filled
                   autogrow
                   maxlength="1000"/>
        </div>
        <div class="col-4 q-mt-sm">
          <medical-text-template-select options=""
                                        name="OP Vorbereitungs"
                                        icon="mdi-box-cutter"/>
        </div>
      </div>
    </div>
    <div class="col-12">
      <div class="row items-center justify-between">
        <div class="col-7 q-mt-sm">
          <div class="text-body1">
            Behandlung
          </div>
          <q-input type="textarea"
                   counter
                   v-model="medicalDocument.treatment"
                   filled
                   autogrow
                   maxlength="4000"/>
        </div>
        <div class="col-4 q-mt-sm">
          <medical-text-template-select name="Behandlungs"
                                        options=""
                                        icon="mdi-needle"/>
        </div>
      </div>
    </div>
    <div class="col-12">
      <div class="row items-center justify-between">
        <div class="col-7 q-mt-sm">
          <div class="text-body1">
            Medikamente
          </div>
          <q-input type="textarea"
                   counter
                   v-model="medicalDocument.medication"
                   filled
                   autogrow
                   maxlength="1000"/>
        </div>
        <div class="col-4 q-mt-sm">
          <medical-text-template-select name="Medikamenten"
                                        options=""
                                        icon="mdi-pill"/>
        </div>
      </div>
    </div>
    <div class="col-12">
      <div class="row items-center justify-between">
        <div class="col-7 q-mt-sm">
          <div class="text-body1">
            Entlassung
          </div>
          <q-input type="textarea"
                   counter
                   v-model="medicalDocument.discharge"
                   filled
                   autogrow
                   maxlength="1000"/>
        </div>
        <div class="col-4 q-mt-sm">
          <medical-text-template-select name="Entlassungs"
                                        options=""
                                        icon="mdi-door-open"/>
        </div>
      </div>
    </div>
    <div class="col-12">
      <div class="row items-center justify-between">
        <div class="col-7 q-mt-sm">
          <div class="text-body1">
            Nachuntersuchung
          </div>
          <q-input type="textarea"
                   counter
                   v-model="medicalDocument.followUp"
                   filled
                   autogrow
                   maxlength="1000"/>
        </div>
        <div class="col-4 q-mt-sm">
          <medical-text-template-select name="Nachuntersuchungs"
                                        options=""/>
        </div>
      </div>
    </div>
    <div class="col-12">
      <div class="row items-center justify-between">
        <div class="col-3">
          <q-input filled v-model="medicalDocument.followUpAppointment"
                   mask="date"
                   label="Nachuntersuchungstermin"
                   :rules="['date']">
            <template v-slot:append>
              <q-icon name="mdi-calendar" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="medicalDocument.followUpAppointment">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Schließen" flat color="primary"/>
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>
    </div>
    <div class="col-12 q-mb-md">
      <q-separator/>
    </div>
    <div class="col-12">
      <div class="row items-center">
        <div class="col-2">
          <div class="row items-center">
            <div>
              (Arbeits)Unfähig:
            </div>
            <q-option-group v-model="medicalDocument.unableToWork"
                            inline :options="[{ label: 'Ja', value: true}, { label: 'Nein', value: false}]"/>
          </div>
        </div>
        <div class="col-2">
          <div class="row items-center">
            <div>
              Eingeschränkt (Arbeits)Unfähig:
            </div>
            <q-option-group v-model="medicalDocument.partlyUnableToWork"
                            inline :options="[{ label: 'Ja', value: true}, { label: 'Nein', value: false}]"/>
          </div>
        </div>
        <div class="col-8">
          <div class="row items-center q-gutter-md justify-end">
            <div>
              (Arbeits)Unfähigkeitszeitraum:
            </div>
            <q-input filled v-model="medicalDocument.unableToWorkFrom"
                     mask="date"
                     label="Von"
                     :rules="['date']">
              <template v-slot:append>
                <q-icon name="mdi-calendar" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="medicalDocument.unableToWorkFrom">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Schließen" flat color="primary"/>
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input filled v-model="medicalDocument.unableToWorkTo"
                     mask="date"
                     label="Bis"
                     :rules="['date']">
              <template v-slot:append>
                <q-icon name="mdi-calendar" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="medicalDocument.unableToWorkTo">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Schließen" flat color="primary"/>
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12">
      <div class="row items-center"
           v-if="canSeePsychological">
        <div class="col-2">
          <q-checkbox label="Suizidgefährdet"
                      v-model="medicalDocument.suicidal"/>
        </div>
        <div class="col-2">
          <q-input filled v-model="medicalDocument.psychologicalFollowUp"
                   mask="date"
                   label="Nächster Gesprächstermin"
                   :rules="['date']">
            <template v-slot:append>
              <q-icon name="mdi-calendar" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="medicalDocument.psychologicalFollowUp">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Schließen" flat color="primary"/>
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>
    </div>
    <div class="col-12">
      <div class="row items-center justify-end q-gutter-md">
        <med-general-button label="(Arbeits)Unfähigkeit"
                            icon="mdi-wheelchair-accessibility"/>
        <med-general-button label="Med. Gutachten"
                            icon="mdi-file-sign"/>
        <med-general-button label="Bett zuweisen"
                            icon="mdi-bed"/>
      </div>
    </div>
    <div class="col-12">
      historie
    </div>
    <div class="col-12">
      <div class="row items-center justify-between">
        <med-general-button label="Speichern & Schließen"/>
        <med-save-button label="Speichern"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import IMedicalDocument from 'src/misc/interfaces/Document/Medical/IMedicalDocument'
import MedicalTextTemplateSelect from 'components/general/select/medicalSelect/medicalTextTemplateSelect.vue'
import IMedicalDocumentAutoFill from 'src/misc/interfaces/Document/Medical/IMedicalDocumentAutoFill'
import MedGeneralButton from 'components/general/buttons/medicalButton/MedGeneralButton.vue'
import MedSaveButton from 'components/general/buttons/medicalButton/MedSaveButton.vue'

export default defineComponent({
  name: 'medicalNormalFileComponent',
  components: { MedSaveButton, MedGeneralButton, MedicalTextTemplateSelect },
  props: {
    document: {
      type: Object as () => IMedicalDocument,
      required: true
    },
    canSeePsychological: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  emits: ['update:document'],
  setup (props, { emit }) {
    const medicalDocument = ref<IMedicalDocument>(props.document)
    const medicalAutofills = ref<IMedicalDocumentAutoFill[]>([])
    watch(() => props.document, () => {
      emit('update:document', props.document)
    })
    return {
      medicalDocument,
      medicalAutofills
    }
  }
})
</script>

<style scoped>

</style>
