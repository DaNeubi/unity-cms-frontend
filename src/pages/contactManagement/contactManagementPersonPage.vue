<template>
  <q-card class="absolute-center main-card">
    <q-card-section>
      <q-tabs align="left" v-model="selectedTab">
        <q-tab name="Person" icon="mdi-account-outline" label="Person"/>
        <q-tab name="Akten" icon="mdi-file-multiple-outline" label="Akten" v-if="canAccessMedicalFiles"/>
        <q-tab name="PsyAkten" icon="mdi-file-multiple-outline" label="PsyAkten" v-if="canSeePsychological && canAccessMedicalFiles"/>
        <q-tab name="Dokumente" icon="mdi-file-sign" label="Dokumente"/>
        <q-tab name="Rennen" icon="mdi-flag-checkered" label="Rennen" v-if="canSeeRace"/>
      </q-tabs>
    </q-card-section>
    <q-separator class="full-width"/>
    <q-card-section>
      <q-tab-panels v-model="selectedTab">
        <q-tab-panel name="Person">
          <ContactPersonComponent :personId="+$route.params.userId"
                                  :can-delete-person="canDeletePerson"
                                  :can-edit-person="canEditPerson"
                                  :can-view-document-history="canViewDocumentHistory"
                                  :can-share-document="canShareDocument"
                                  :can-lock-document-to-ranks="canLockDocumentToRanks"
                                  :can-create-document="canCreateDocument"
                                  :can-edit-document="canEditDocument"
                                  :can-delete-document="canDeleteDocument"
                                  :medical-file-access="canAccessMedicalFiles"
                                  :can-see-psychological="canSeePsychological"/>
        </q-tab-panel>
        <q-tab-panel name="Akten">
          <ContactMedicalFilesComponent :personId="+$route.params.userId"/>
        </q-tab-panel>
        <q-tab-panel name="PsyAkten" v-if="canSeePsychological">
          psy
        </q-tab-panel>
        <q-tab-panel name="Dokumente">
          dokumente
        </q-tab-panel>
        <q-tab-panel name="Rennen" v-if="canSeeRace">
          rennen
        </q-tab-panel>
      </q-tab-panels>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { companyStore } from 'stores/companyStore'
import ContactPersonComponent from 'components/contactManagement/ContactPersonComponent.vue'
import { api } from 'boot/axios'
import ContactMedicalFilesComponent from 'components/contactManagement/ContactMedicalFilesComponent.vue'
import AssignPolicies from 'src/misc/functions/policies/Policies'

const selectedTab = ref<string>('Person')
const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
const canDeletePerson = ref<boolean>(false)
const canEditPerson = ref<boolean>(false)
const canSeePsychological = ref<boolean>(false)
const canAccessMedicalFiles = ref<boolean>(false)
const canEditMedicalFiles = ref<boolean>(false)
const canDeleteMedicalFiles = ref<boolean>(false)
const canSeeRace = ref<boolean>(false)
const canCreateDocument = ref<boolean>(false)
const canEditDocument = ref<boolean>(false)
const canDeleteDocument = ref<boolean>(false)
const canViewDocumentHistory = ref<boolean>(false)
const canShareDocument = ref<boolean>(false)
const canLockDocumentToRanks = ref<boolean>(false)
watch(companyId, () => {
  getPermissions()
})
onMounted(() => {
  // get the permissions for all tabs
  getPermissions()
})
function getPermissions () {
  if (companyId.value <= 0) return
  api.get('/api/policies/contactManagement/base/' + companyId.value)
    .then((res) => {
      AssignPolicies([
        { policyName: 'ContactManagement_Delete', policyToAssign: canDeletePerson },
        { policyName: 'ContactManagement_Edit', policyToAssign: canEditPerson },
        { policyName: 'ContactManagement_Medical_Psychological', policyToAssign: canSeePsychological },
        { policyName: 'ContactManagement_Race', policyToAssign: canSeeRace },
        { policyName: 'ContactManagement_Medical_MedicalFiles', policyToAssign: canAccessMedicalFiles },
        { policyName: 'ContactManagement_Medical_MedicalFiles_Edit', policyToAssign: canEditMedicalFiles },
        { policyName: 'ContactManagement_Medical_MedicalFiles_Delete', policyToAssign: canDeleteMedicalFiles }
      ], res.data.contactManagementPolicies)
    })
    .catch((error) => {
      console.error(error)
    })
  api.get('/api/policies/document/' + companyId.value)
    .then((res) => {
      AssignPolicies([
        { policyName: 'Document_Management_Document_Create', policyToAssign: canCreateDocument },
        { policyName: 'Document_Management_Document_Edit', policyToAssign: canEditDocument },
        { policyName: 'Document_Management_Document_Delete', policyToAssign: canDeleteDocument },
        { policyName: 'Document_Management_Document_View_History', policyToAssign: canViewDocumentHistory },
        { policyName: 'Document_Management_Document_Lock_To_Ranks', policyToAssign: canLockDocumentToRanks },
        { policyName: 'Document_Management_Document_Share', policyToAssign: canShareDocument }
      ], res.data.documentPolicies)
    })
    .catch((error) => {
      console.error(error)
    })
}
</script>

<style scoped>
@media (min-width: 1000px) {
  .main-card {
    width: 70vw;
    height: 73vh;
  }
}
@media (min-width: 1900px) {
  .main-card {
    width: 83vw;
    height: 80vh;
  }
}
@media (min-width: 2500px) {
  .main-card {
    width: 86vw;
    height: 82vh;
  }
}
</style>
