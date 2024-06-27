<template>
  <radio-settings-component :company-id="companyId" :can-create-radio="canCreateRadio" :can-edit-radio="canEditRadio"
                            :can-delete-radio="canDeleteRadio"/>
</template>

<script setup lang="ts">
import RadioSettingsComponent from 'components/generalManagement/Radio/RadioSettingsComponent.vue'
import { companyStore } from 'stores/companyStore'
import { computed, onMounted, ref, watch } from 'vue'
import { api } from 'boot/axios'
import AssignPolicies from 'src/misc/functions/policies/Policies'

const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
const canCreateRadio = ref<boolean>(false)
const canEditRadio = ref<boolean>(false)
const canDeleteRadio = ref<boolean>(false)

onMounted(() => {
  getPolicies()
})

watch(() => companyId.value, () => {
  getPolicies()
})

function getPolicies () {
  if (companyId.value <= 0) return
  api.get('/api/policies/generalManagement/radio/' + companyId.value)
    .then((res) => {
      AssignPolicies([
        { policyName: 'GeneralManagement_Radio_Create', policyToAssign: canCreateRadio },
        { policyName: 'GeneralManagement_Radio_Edit', policyToAssign: canEditRadio },
        { policyName: 'GeneralManagement_Radio_Delete', policyToAssign: canDeleteRadio }
      ], res.data)
    })
    .catch((err) => {
      console.error(err)
    })
}
</script>

<style scoped>

</style>
