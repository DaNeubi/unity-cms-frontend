<template>
  <div class="row q-gutter-lg" v-if="!loading && person !== null && person !== undefined">
    <div class="col-4">
      <q-input outlined :disable="!editMode" v-model="person.first_name" label="Vorname"/>
    </div>
    <div class="col-4">
      <q-input outlined :disable="!editMode" v-model="person.last_name" label="Nachname"/>
    </div>
    <div class="col-3">
      <q-input outlined :disable="!editMode" v-model="person.date_of_birth" label="Geburtstag"/>
    </div>
  </div>
  <div class="row q-gutter-lg" v-else>
    <div class="col-4">
      <q-skeleton type="QInput"/>
    </div>
    <div class="col-4">
      <q-skeleton type="QInput"/>
    </div>
    <div class="col-3">
      <q-skeleton type="QInput"/>
    </div>
  </div>
  <div class="row q-gutter-lg q-mt-sm items-center" v-if="!loading && person !== null && person !== undefined">
    <div class="col-2">
      <q-input outlined :disable="!editMode" v-model="person.phone" label="Telefonnummer"/>
    </div>
    <div class="col-2">
      <q-select v-model="person.gender" outlined :disable="!editMode" label="Geschlecht"
                :display-value="getGender(person?.gender ?? 0)" :options="availableGenders"/>
    </div>
    <div class="col-1">
      <q-select v-model="person.person_medical_status.blood_type" outlined :disable="!editMode"
                v-if="medicalFileAccess && person.person_medical_status !== null && person.person_medical_status !== undefined"
                label="Blutgruppe"
                :display-value="getBloodType(person?.person_medical_status?.blood_type ?? 0)"
                :options="availableBloodTypes"/>
    </div>
    <div class="col-1">
      <q-checkbox v-model="person.person_medical_status.dead"
                  :label="person?.person_medical_status?.dead ? 'Hops gegangen' : 'Lebendig'" :true-value="1"
                  :false-value="0" :disable="!editMode"
                  v-if="medicalFileAccess && person.person_medical_status !== null && person.person_medical_status !== undefined"/>
    </div>
    <div class="col-1">
      <q-checkbox v-model="person.person_medical_status.psychological_treatment" :true-value="1" :false-value="0" :disable="!editMode"
                  v-if="canSeePsychological && medicalFileAccess && person.person_medical_status !== null && person.person_medical_status !== undefined"
                  :label="person?.person_medical_status?.psychological_treatment ? 'In Psychologischer Behandlung' : 'Nicht in Psychologischer Behandlung'"/>
    </div>
  </div>
  <div class="row q-gutter-lg q-mt-sm items-center" v-else>
    <div class="col-1">
      <q-skeleton type="QInput"/>
    </div>
    <div class="col-2">
      <q-skeleton type="QInput"/>
    </div>
    <div class="col-1">
      <q-skeleton type="QInput"/>
    </div>
    <div class="col-1">
      <q-skeleton type="QCheckbox"/>
    </div>
    <div class="col-1">
      <q-skeleton type="QCheckbox"/>
    </div>
  </div>
  <div class="row q-mt-lg items-center" v-if="medicalFileAccess">
    <div class="col-7" v-if="!loading">
      <div class="row">
        <div class="col-auto q-mr-sm">
          <prior-medical-illness-icon v-if="hasPriorMedicalIllnesses"/>
        </div>
        <div class="col-auto q-mr-sm">
          <psychological-treatment-icon :show-tool-tip="true"
                                        v-if="person?.person_medical_status?.psychological_treatment"/>
        </div>
        <div class="col-auto q-mr-sm">
          <dead-icon :show-tool-tip="true"
                     v-if="person?.person_medical_status?.dead"/>
        </div>
      </div>
    </div>
    <div class="col-7" v-else>
      <q-skeleton type="QToolbar"/>
    </div>
    <div class="col-4 q-ml-xl">
      <div class="col-auto self-end">
        <q-btn label="Notfallkontakt hinzufügen" icon="mdi-plus" rounded v-if="$props.canEditPerson"
               :disable="!editMode" color="accent"/>
      </div>
    </div>
  </div>
  <div class="row q-mt-lg">
    <div class="col-7 q-mr-xl">
      <q-card flat v-if="$props.canViewDocumentHistory" bordered>
        <q-card-section>
          letzte dokumente
        </q-card-section>
      </q-card>
    </div>
    <div class="col-4">
      <q-card flat v-if="$props.medicalFileAccess" bordered>
        <q-card-section>
          notfallkontakte
        </q-card-section>
      </q-card>
      <div class="row q-mt-sm q-gutter-md items-center justify-between">
        <div class="col-auto">
          <q-btn label="Änderungen speichern" icon="mdi-content-save" rounded color="positive" @click="saveChanges()"
                 v-if="$props.canEditPerson" :disable="!editMode"/>
        </div>
        <div class="col-auto">
          <q-btn label="Bearbeiten starten" icon="mdi-pencil" rounded color="secondary" @click="toggleEditMode()"
                 v-if="$props.canEditPerson"/>
        </div>
        <div class="col-auto">
          <q-btn label="Person löschen" icon="mdi-delete" rounded color="negative" v-if="$props.canDeletePerson"
                 :disable="!editMode"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Gender from 'src/misc/Enums/Gender/Gender'
import BloodType from 'src/misc/Enums/Medical/BloodType'
import { api } from 'boot/axios'
import { companyStore } from 'stores/companyStore'
import IPerson from 'src/misc/interfaces/Person/IPerson'
import PsychologicalTreatmentIcon from 'components/medicalIcons/psychologicalTreatmentIcon.vue'
import DeadIcon from 'components/medicalIcons/deadIcon.vue'
import PriorMedicalIllnessIcon from 'components/medicalIcons/priorMedicalIllnessIcon.vue'

const props = defineProps({
  personId: {
    type: Number,
    required: true
  },
  canEditPerson: {
    type: Boolean,
    required: true,
    default: false
  },
  canDeletePerson: {
    type: Boolean,
    required: true,
    default: false
  },
  canSeePsychological: {
    type: Boolean,
    required: true,
    default: false
  },
  medicalFileAccess: {
    type: Boolean,
    required: true,
    default: false
  },
  canViewDocumentHistory: {
    type: Boolean,
    required: true,
    default: false
  },
  canCreateDocument: {
    type: Boolean,
    required: true,
    default: false
  },
  canEditDocument: {
    type: Boolean,
    required: true,
    default: false
  },
  canDeleteDocument: {
    type: Boolean,
    required: true,
    default: false
  },
  canShareDocument: {
    type: Boolean,
    required: true,
    default: false
  },
  canLockDocumentToRanks: {
    type: Boolean,
    required: true,
    default: false
  }
})
const loading = ref<boolean>(true)
const editMode = ref<boolean>(false)
const person = ref<IPerson|undefined>(undefined)
const availableGenders = Object.values(Gender).filter((v) => typeof v === 'string')
const availableBloodTypes = Object.values(BloodType).filter((v) => typeof v === 'string')
const hasPriorMedicalIllnesses = ref<boolean>(false)
// const isInPsychologicalTreatment = ref<boolean>(false)
const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
// const lastDocumentsColumns = [
//   { name: 'type', label: 'Typ', field: 'type' },
//   { name: 'created_at', label: 'Datum', field: 'created_at' },
//   { name: 'description', label: 'Beschreibung', field: 'description' }
// ]
// const emergencyContactColumns = [
//   { name: 'Name', label: 'name', field: 'Name' },
//   { name: 'Telefonnummer', label: 'phone', field: 'Telefonnummer' }
// ]
watch(companyId, () => {
  getPerson()
})
onMounted(async () => {
  // get the specific person
  getPerson()
})
function getPerson () {
  if (companyId.value === 0) return
  loading.value = true
  api.get('/api/person/getSpecific/' + companyId.value + '/' + props.personId)
    .then((res) => {
      person.value = res.data.person
      loading.value = false
    })
    .catch((error) => {
      console.error(error)
    })
}
function toggleEditMode () {
  editMode.value = !editMode.value
}
function getGender (id: number | string) {
  return Gender[+id]
}
function getBloodType (id: number | string) {
  return BloodType[+id]
}
function saveChanges () {
  if (companyId.value === 0) return
  if (person.value === undefined) {
    return
  }
  api.patch('/api/person/edit/' + companyId.value, {
    id: person.value.id,
    first_name: person.value.first_name,
    last_name: person.value.last_name,
    birth_last_name: person.value.birth_last_name,
    phone: person.value.phone,
    date_of_birth: person.value.date_of_birth,
    gender: typeof person.value.gender === 'string' ? Gender[person.value?.gender] : person.value.gender,
    animal: person.value.animal ?? 0,
    blood_type: typeof person.value.person_medical_status?.blood_type === 'string'
      ? BloodType[person.value?.person_medical_status?.blood_type] : person.value?.person_medical_status?.blood_type,
    psychological_treatment: person.value.person_medical_status?.psychological_treatment ?? 0,
    dead: person.value.person_medical_status?.dead ?? 0
  })
    .then(() => {
      toggleEditMode()
    })
    .catch((error) => {
      console.error(error)
    })
}
</script>

<style scoped>
@media (min-height: 800px) {
  .last-document-table-height {
    height: 16vh;
  }
}
@media (min-height: 900px) {
  .last-document-table-height {
    height: 18vh;
  }
}
@media (min-height: 1000px) {
  .last-document-table-height {
    height: 24vh;
  }
}
@media (min-height: 1100px) {
  .last-document-table-height {
    height: 28vh;
  }
}
@media (min-height: 1200px) {
  .last-document-table-height {
    height: 31vh;
  }
}
@media (min-height: 1300px) {
  .last-document-table-height {
    height: 49vh;
  }
}

</style>
