<template>
<div class="row">
  <q-card class="full-width">
    <q-tabs v-model="tab" align="justify">
      <q-tab name="list" label="B2B Vertrags Liste" icon="mdi-file-document-multiple" v-if="canViewCurrent"/>
      <q-tab name="requestsAndHistory" label="B2B Anfragen/Historie" icon="mdi-file-sign" v-if="canViewHistory"/>
      <ShoppingListLoadingItemStockTabComponent v-if="loading"/>
    </q-tabs>
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="list" v-if="canViewCurrent">
        <ContractB2BListComponent :company-id="companyId"/>
      </q-tab-panel>
      <q-tab-panel name="requestsAndHistory" v-if="canViewHistory">
        <ContractB2BRequestsComponent :company-id="companyId"/>
      </q-tab-panel>
      <ShoppingListLoadingItemStockTabContentComponent v-if="loading"/>
    </q-tab-panels>
  </q-card>
</div>
</template>

<script setup lang="ts">

import { companyStore } from 'stores/companyStore'
import { computed, onMounted, ref, watch } from 'vue'
import ContractB2BListComponent from 'components/contracts/ContractB2BListComponent.vue'
import ContractB2BRequestsComponent from 'components/contracts/ContractB2BRequestsComponent.vue'
import { api } from 'boot/axios'
import AssignPolicies from 'src/misc/functions/policies/Policies'
import ShoppingListLoadingItemStockTabContentComponent
  from 'components/shoppingList/ShoppingListLoadingItemStockTabContentComponent.vue'
import ShoppingListLoadingItemStockTabComponent
  from 'components/shoppingList/ShoppingListLoadingItemStockTabComponent.vue'

const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
const tab = ref('loadingtab')
const canViewHistory = ref<boolean>(false)
const canViewCurrent = ref<boolean>(false)
const loading = ref<boolean>(false)

onMounted(() => {
  loadPolicies()
})

watch(() => companyId.value, () => {
  loadPolicies()
})

function loadPolicies () {
  if (companyId.value <= 0) return
  loading.value = true
  api.get('/api/policies/contract/contractList/' + companyId.value)
    .then((res) => {
      AssignPolicies([
        { policyName: 'Contracts_B2B_View_History', policyToAssign: canViewHistory },
        { policyName: 'Contracts_B2B_View_Current', policyToAssign: canViewCurrent }
      ], res.data.contractPolicies)
      loading.value = false
      tab.value = 'list'
    })
    .catch((error) => {
      console.log(error)
    })
}

</script>

<style scoped>

</style>
