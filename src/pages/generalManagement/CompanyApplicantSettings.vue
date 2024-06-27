<template>
  <div class="column">
    <h4 class="q-mt-sm q-mb-sm">Bewerber Zusatz-Felder einstellen</h4>
    <span class="hint-text q-mb-md">
      Hier können die Zusatz-Felder Namen Bewerberliste angelegt werden.<br/>
      Der Name der in den Zusatzfeldern eingetragen wird, wird später auch in der Tabelle der Bewerber angezeigt.<br/>
      Wenn ein Feld nicht verwendet werden soll, einfach leer lassen.
    </span>
    <div>
      <CreateSomethingNewButton text="Zusatzfelder aktualisieren"
                                class="q-mb-md"
                                @create-something-new="updateApplicationSettings()"/>
    </div>
    <div v-if="companyCustomFields === undefined || loading"
         class="row q-gutter-md">
      <q-skeleton v-for="i in 6"
                  width="20%"
                  :key="i"/>
    </div>
    <div class="row q-gutter-lg"
         v-else>
      <q-input v-model="companyCustomFields.custom_field_1"
               outlined
               label="Zusatzfeld 1"
               counter
               :maxlength="100"
               :max="100"/>
      <q-input v-model="companyCustomFields.custom_field_2"
               outlined
               label="Zusatzfeld 2"
               counter
               :maxlength="100"
               :max="100"/>
      <q-input v-model="companyCustomFields.custom_field_3"
               outlined
               label="Zusatzfeld 3"
               counter
               :maxlength="100"
               :max="100"/>
      <q-input v-model="companyCustomFields.custom_field_4"
               outlined
               label="Zusatzfeld 4"
               counter
               :maxlength="100"
               :max="100"/>
      <q-input v-model="companyCustomFields.custom_field_5"
               outlined
               label="Zusatzfeld 5"
               counter
               :maxlength="100"
               :max="100"/>
      <q-input v-model="companyCustomFields.custom_field_6"
               outlined
               label="Zusatzfeld 6"
               counter
               :maxlength="100"
               :max="100"/>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import { api } from 'src/boot/axios'
import { companyStore } from 'stores/companyStore'
import IApplicantCustomFields from 'src/misc/interfaces/Applicant/IApplicantCustomFields'
import AssignPolicies from 'src/misc/functions/policies/Policies'

export default defineComponent({
  name: 'CompanyApplicantSettings',
  components: { CreateSomethingNewButton },
  setup () {
    const companyCustomFields = ref<IApplicantCustomFields>()
    const canEdit = ref<boolean>(false)
    const cStore = companyStore()
    const companyId = computed(() => cStore.companyId)
    const loading = ref<boolean>(true)
    watch(companyId, () => {
      getPolicies()
      getCompanyApplicantSetting()
    })
    onMounted(async () => {
      // get permissions
      getPolicies()
      getCompanyApplicantSetting()
    })
    function getPolicies () {
      if (companyId.value <= 0) { return }
      api.get('/api/policies/generalManagement/applicantSettings/' + companyId.value)
        .then((res) => {
          AssignPolicies([
            { policyName: 'GeneralManagement_ApplicantsAdditionalFields_Edit', policyToAssign: canEdit }
          ], res.data.applicantSettingsPolicies)
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function getCompanyApplicantSetting () {
      if (companyId.value <= 0) { return }
      loading.value = true
      api.get('/api/companyApplicantSettings/showReduced/' + companyId.value)
        .then((res) => {
          companyCustomFields.value = res.data.applicantSettings[0]
          loading.value = false
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function updateApplicationSettings () {
      api.patch('/api/companyApplicantSettings/update/' + companyId.value, {
        custom_fields_id: companyCustomFields.value?.id,
        custom_field_1: companyCustomFields.value?.custom_field_1,
        custom_field_2: companyCustomFields.value?.custom_field_2,
        custom_field_3: companyCustomFields.value?.custom_field_3,
        custom_field_4: companyCustomFields.value?.custom_field_4,
        custom_field_5: companyCustomFields.value?.custom_field_5,
        custom_field_6: companyCustomFields.value?.custom_field_6
      })
        .catch((err) => {
          console.error(err)
        })
    }
    return {
      canEdit,
      companyCustomFields,
      loading,
      updateApplicationSettings
    }
  }
})
</script>

<style scoped>

</style>
