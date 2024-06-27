<template>
  <div class="row">
    <ContractModificationComponent class="col-12" :can-create-b2-b="true"
                               v-if="showCreating" :company-id="companyId" :contract="contractToEdit"
                               @contract-creation-cancel="showCreating = false"/>
    <ContractListComponent class="col-12" v-else :company-id="companyId" :can-delete="canDelete"
                           :can-edit="canEdit" @contract-create-new="createContract" :can-create="canCreate"
                           @contract-modify-existing="val => editContract(val)"/>
  </div>
</template>

<script setup lang="ts">
import ContractListComponent from 'components/contracts/ContractListComponent.vue'
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { companyStore } from 'stores/companyStore'
import { api } from 'boot/axios'
import AssignPolicies from 'src/misc/functions/policies/Policies'
import ContractModificationComponent from 'components/contracts/ContractModificationComponent.vue'
import IContract from 'src/misc/interfaces/Contract/IContract'
import laravelEcho from 'boot/laravelecho'
import { useUserStore } from 'stores/useUserStore'

const showCreating = ref<boolean>(false)
const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
const canViewAll = ref<boolean>(false)
const canEdit = ref<boolean>(false)
const canDelete = ref<boolean>(false)
const canCreate = ref<boolean>(false)
const canCreateB2B = ref<boolean>(false)
const contractToEdit = ref<IContract>()
const userStore = useUserStore()
const userId = computed(() => userStore.userId)

onMounted(() => {
  joinReloadChannel()
  getPermissions()
})

watch(companyId, () => {
  getPermissions()
  showCreating.value = false
})

onUnmounted(() => {
  laravelEcho.leave('user.reload.' + userId.value)
})

function getPermissions () {
  if (companyId.value <= 0) return
  api.get('/api/policies/contract/contractList/' + companyId.value)
    .then((res) => {
      AssignPolicies([
        { policyName: 'Contracts_ContractList_View_All', policyToAssign: canViewAll },
        { policyName: 'Contracts_ContractList_Update', policyToAssign: canEdit },
        { policyName: 'Contracts_ContractList_Delete', policyToAssign: canDelete },
        { policyName: 'Contracts_ContractList_Create', policyToAssign: canCreate },
        { policyName: 'Contracts_ContractList_SendB2BRequest', policyToAssign: canCreateB2B }
      ], res.data.contractPolicies)
    })
    .catch((error) => {
      console.error(error)
    })
}

function joinReloadChannel () {
  if (userId.value <= 0) return
  laravelEcho.private('user.reload.' + userId.value)
    .listen('.user.reload', () => {
      if (showCreating.value) showCreating.value = false
    })
}

function editContract (contract: IContract) {
  contractToEdit.value = contract
  showCreating.value = true
}

function createContract () {
  contractToEdit.value = undefined
  showCreating.value = true
}

</script>

<style scoped>

</style>
