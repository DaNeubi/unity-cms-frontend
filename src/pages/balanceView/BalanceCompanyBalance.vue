<template>
  <div class="row q-gutter-sm" v-if="!loadingPolicies">
    <CompanyBalanceCurrentBalanceComponent class="col-12"
                                           :company-id="companyId"
                                           v-if="canSeeAll || canSeeCurrenBalance"
                                           :reload-int="updateInt"/>
    <CompanyBalanceUpdateComponent class="col-12"
                                   :company-id="companyId"
                                   :can-add="canAdd"
                                   :update-int="updateInt"
                                   v-if="canSeeAll || canAdd || canRemove"
                                   :can-remove="canRemove"/>
    <CompanyBalanceManualTransactionHistoryComponent class="col-12"
                                                     :company-id="companyId"
                                                     :reload-int="updateInt"
                                                     v-if="canSeeAll || canSeeHistory"/>
  </div>
  <div class="row q-gutter-md" v-else>
    <q-skeleton class="col-12" height="4rem" v-for="n in 4" :key="n"/>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import CompanyBalanceCurrentBalanceComponent
  from 'components/balanceView/CompanyBalance/CompanyBalanceCurrentBalanceComponent.vue'
import CompanyBalanceUpdateComponent from 'components/balanceView/CompanyBalance/CompanyBalanceUpdateComponent.vue'
import CompanyBalanceManualTransactionHistoryComponent
  from 'components/balanceView/CompanyBalance/CompanyBalanceManualTransactionHistoryComponent.vue'
import { companyStore } from 'stores/companyStore'
import { useUserStore } from 'stores/useUserStore'
import { api } from 'src/boot/axios'
import AssignPolicies from 'src/misc/functions/policies/Policies'
import laravelEcho from 'src/boot/laravelecho'

const canSeeAll = ref<boolean>(false)
const canSeeCurrenBalance = ref<boolean>(false)
const canSeeHistory = ref<boolean>(false)
const canAdd = ref<boolean>(false)
const canRemove = ref<boolean>(false)
const cStore = companyStore()
const userStore = useUserStore()
const userId = computed(() => userStore.userId)
const companyId = computed(() => cStore.companyId)
const loadingPolicies = ref<boolean>(true)
const updateInt = ref<number>(0)
onMounted(() => {
  subscribeChangedEvent()
  getPolicies()
})
onUnmounted(() => {
  laravelEcho.leave('user.reload.' + userId.value)
})
watch(() => companyId.value, () => {
  subscribeChangedEvent()
  getPolicies()
})
function subscribeChangedEvent () {
  if (userId.value <= 0) return
  if (companyId.value <= 0) return
  laravelEcho.private('user.reload.' + userId.value)
    .listen('.user.reload', () => {
      updateInt.value++
    })
}
function getPolicies () {
  if (companyId.value <= 0) return
  loadingPolicies.value = true
  api.get('/api/policies/balanceView/companyBalance/' + companyId.value)
    .then((response) => {
      AssignPolicies([
        { policyName: 'BalanceView_CompanyBalance_View_All', policyToAssign: canSeeAll },
        { policyName: 'BalanceView_CompanyBalance_View_Current', policyToAssign: canSeeCurrenBalance },
        { policyName: 'BalanceView_CompanyBalance_View_History', policyToAssign: canSeeHistory },
        { policyName: 'BalanceView_CompanyBalance_Add', policyToAssign: canAdd },
        { policyName: 'BalanceView_CompanyBalance_Remove', policyToAssign: canRemove }
      ], response.data.companyBalancePolicies)
      loadingPolicies.value = false
    })
    .catch((error) => {
      console.error(error)
    })
}
</script>

<style scoped>

</style>
