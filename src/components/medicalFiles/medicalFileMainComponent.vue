<template>
  <q-card>
    <q-card-section>
      <div class="row items-center q-gutter-sm">
        <div class="col-auto">
          <q-icon name="mdi-circle"
                  size="lg"/>
        </div>
        <div class="col-4">
          <div class="text-h5">
            vorname nachname
          </div>
        </div>
        <div class="col-1">
          <q-toggle v-model="typeToggle"
                    color="pink-5"
                    keep-color
                    unchecked-icon="mdi-file-document-outline"
                    size="xl"
                    :label="typeToggle ? 'Normale Akte' : 'Kleine Akte'"
                    checked-icon="mdi-file-document-multiple-outline"/>
        </div>
        <div class="col-4">
          <div class="row">
            <div class="col-auto">
              <prior-medical-illness-icon />
            </div>
            <div class="col-auto">
              <psychological-treatment-icon :show-tool-tip="true"
                                            v-if="canSeePsychological"/>
            </div>
            <div class="col-auto">
              <dead-icon :show-tool-tip="true"
                         v-if="person?.person_medical_status?.dead"/>
            </div>
          </div>
        </div>
        <div class="col-auto">
          blutgruppe
        </div>
        <div class="col-1">
        </div>
        <div class="col-1">
          <med-save-button />
        </div>
      </div>
    </q-card-section>
    <q-card-section>
      <q-separator/>
    </q-card-section>
    <q-card-section v-if="!typeToggle">
      <medical-small-file-component :document="document"
                                    :document-types="availableDocumentTypes"/>
    </q-card-section>
    <q-card-section v-else>
      <medical-normal-file-component :document="document"/>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import IPerson from 'src/misc/interfaces/Person/IPerson'
import { defineComponent, onMounted, Ref, ref } from 'vue'
import PriorMedicalIllnessIcon from 'components/medicalIcons/priorMedicalIllnessIcon.vue'
import PsychologicalTreatmentIcon from 'components/medicalIcons/psychologicalTreatmentIcon.vue'
import DeadIcon from 'components/medicalIcons/deadIcon.vue'
import MedSaveButton from 'components/general/buttons/medicalButton/MedSaveButton.vue'
import MedicalSmallFileComponent from 'components/medicalFiles/medicalSmallFileComponent.vue'
import MedicalNormalFileComponent from 'components/medicalFiles/medicalNormalFileComponent.vue'
import IDocumentType from 'src/misc/interfaces/Document/IDocumentType'
import IMedicalDocument from 'src/misc/interfaces/Document/Medical/IMedicalDocument'

export default defineComponent({
  name: 'medicalFileMainComponent',
  components: { MedicalNormalFileComponent, MedicalSmallFileComponent, MedSaveButton, DeadIcon, PsychologicalTreatmentIcon, PriorMedicalIllnessIcon },
  props: {
    userId: {
      type: Number,
      required: true
    },
    canSeePsychological: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  setup () {
    const person = ref<IPerson>()
    const typeToggle = ref<boolean>(true)
    const availableDocumentTypes = ref<IDocumentType[]>() as Ref<IDocumentType[]>
    const document = ref<IMedicalDocument>({} as IMedicalDocument) as Ref<IMedicalDocument>
    onMounted(async () => {
      // get the info for the user
      getUserInfo()
      // listen to the event for document changes history
    })
    function getUserInfo () {
      // api request
    }
    return {
      person,
      typeToggle,
      availableDocumentTypes,
      document
    }
  }
})
</script>

<style scoped>

</style>
