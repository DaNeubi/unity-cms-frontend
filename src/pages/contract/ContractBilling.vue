<template>
  <div class="row full-width">
    <ContractBillingComponent class="col-12" :company-id="companyId" ref="billingComponent"
                              :can-create="canCreate" :can-delete="canDelete" :has-tip-module="hasTipModule"/>
  </div>
</template>

<script setup lang="ts">
import ContractBillingComponent from 'components/contracts/ContractBillingComponent.vue'
import { companyStore } from 'stores/companyStore'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { api } from 'boot/axios'
import AssignPolicies from 'src/misc/functions/policies/Policies'
import laravelEcho from 'boot/laravelecho'
import { useUserStore } from 'stores/useUserStore'

const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
const canCreate = ref<boolean>(false)
const canDelete = ref<boolean>(false)
const hasTipModule = ref<boolean>(false)
const userStore = useUserStore()
const userId = computed(() => userStore.userId)
const billingComponent = ref()
// TODO: check for tip module

onMounted(() => {
  getPermissions()
  joinReloadChannel()
})

watch(companyId, () => {
  getPermissions()
})

onUnmounted(() => {
  laravelEcho.leave('user.reload.' + userId.value)
})

function joinReloadChannel () {
  laravelEcho.private('user.reload.' + userId.value)
    .listen('.user.reload', () => {
      billingComponent.value?.resetTransactions()
    })
}

function getPermissions () {
  if (companyId.value <= 0) return
  api.get('/api/policies/contract/contractList/' + companyId.value)
    .then((res) => {
      AssignPolicies([
        { policyName: 'Contracts_Billing_Delete', policyToAssign: canDelete },
        { policyName: 'Contracts_Billing_Bill', policyToAssign: canCreate }
      ], res.data.contractPolicies)
    })
    .catch((error) => {
      console.error(error)
    })
}

</script>

<style scoped>

</style>
