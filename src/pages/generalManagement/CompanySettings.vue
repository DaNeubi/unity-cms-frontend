<template>
  <div class="column">
    <div v-if="loadPermissions">
      <q-skeleton height="4em"/>
      <q-skeleton height="4em"
                  class="q-mt-md"/>
      <q-skeleton height="4em"
                  class="q-mt-md"/>
    </div>
    <div v-else>
      <div class="column q-gutter-lg">
        <CompanySettingsItemStockComponent
          :company-id="companyId"
          :can-edit-threshold="canEditItemStockThreshold"/>
        <CompanySettingsColorComponent
          :company-id="companyId"
          v-if="canEditCompanyColor"/>
        <CompanySettingsInspectionComponent
          :company-id="companyId"
          v-if="canEditInspectionRange"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { companyStore } from 'stores/companyStore'
import { api } from 'src/boot/axios'
import CompanySettingsItemStockComponent
  from 'components/generalManagement/CompanySettings/CompanySettingsItemStockComponent.vue'
import AssignPolicies from 'src/misc/functions/policies/Policies'
import CompanySettingsColorComponent
  from 'components/generalManagement/CompanySettings/CompanySettingsColorComponent.vue'
import CompanySettingsInspectionComponent
  from 'components/generalManagement/CompanySettings/CompanySettingsInspectionComponent.vue'

const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
const canEditItemStockThreshold = ref<boolean>(false)
const canEditCompanyColor = ref<boolean>(false)
const canEditInspectionRange = ref<boolean>(false)
const loadPermissions = ref<boolean>(false)
watch(companyId, () => {
  getPermissions()
})
onMounted(async () => {
  getPermissions()
})
function getPermissions () {
  if (companyId.value <= 0) { return }
  loadPermissions.value = true
  api.get('/api/policies/generalManagement/companySettings/' + companyId.value)
    .then((res) => {
      AssignPolicies([
        { policyName: 'GeneralManagement_CompanySettings_ItemStockThreshold', policyToAssign: canEditItemStockThreshold },
        { policyName: 'GeneralManagement_CompanySettings_Colors', policyToAssign: canEditCompanyColor },
        { policyName: 'GeneralManagement_CompanySettings_Inspection_Interval', policyToAssign: canEditInspectionRange }
      ], res.data.companySettingsPolicies)
      loadPermissions.value = false
    })
    .catch((err) => {
      console.error(err)
    })
}
</script>
