<template>
  <CompanyCarStatusSettingsComponent :company-id="companyId" :can-create="canCreateTaxMaxCarDriverStatus"
                              :can-edit="canEditTaxMaxCarDriverStatus" :can-delete="canDeleteTaxMaxCarDriverStatus"/>
</template>

<script setup lang="ts">
import { companyStore } from 'stores/companyStore'
import { computed, onMounted, ref, watch } from 'vue'
import { api } from 'boot/axios'
import AssignPolicies from 'src/misc/functions/policies/Policies'
import CompanyCarStatusSettingsComponent
  from 'components/generalManagement/TaxMax/CompanyCarStatusSettingsComponent.vue'

const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
const canCreateTaxMaxCarDriverStatus = ref<boolean>(false)
const canEditTaxMaxCarDriverStatus = ref<boolean>(false)
const canDeleteTaxMaxCarDriverStatus = ref<boolean>(false)

onMounted(() => {
  getPolicies()
})

watch(() => companyId.value, () => {
  getPolicies()
})

function getPolicies () {
  if (companyId.value <= 0) return
  api.get('/api/policies/generalManagement/companyCarStatus/' + companyId.value)
    .then((res) => {
      AssignPolicies([
        { policyName: 'GeneralManagement_Taxmax_Status_Create', policyToAssign: canCreateTaxMaxCarDriverStatus },
        { policyName: 'GeneralManagement_Taxmax_Status_Edit', policyToAssign: canEditTaxMaxCarDriverStatus },
        { policyName: 'GeneralManagement_Taxmax_Status_Delete', policyToAssign: canDeleteTaxMaxCarDriverStatus }
      ], res.data)
    })
    .catch((err) => {
      console.error(err)
    })
}
</script>

<style scoped>

</style>
