<template>
  <div class="row full-width">
    <UserPaymentComponent :can-see-all="canSeeAll"
                          :can-see-salaries="canSeeSalaries"
                          :can-see-manual-add-remove="canSeeManualAddRemove"
                          :can-see-payout-history="canSeePayoutHistory"
                          :can-see-manual-added-history="canSeeManualAddedHistory"
                          :can-make-payout-default="canMakePayoutDefault"
                          :can-make-payout-custom="canMakePayoutCustom"
                          :can-revert-payout="canRevertPayout"
                          :can-add-everything="canAddEverything"
                          :can-add-tip="canAddTip"
                          :can-remove-tip="canRemoveTip"
                          :can-add-share="canAddShare"
                          :can-remove-share="canRemoveShare"
                          :can-reset-note="canResetNote"
                          :company-id="companyId"
                          :loading-perms="loading"
                          :user-id="userId"/>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import UserPaymentComponent from 'components/balanceView/Payment/UserPaymentComponent.vue'
import { companyStore } from 'stores/companyStore'
import { api } from 'src/boot/axios'
import AssignPolicies from 'src/misc/functions/policies/Policies'
import { useUserStore } from 'stores/useUserStore'

export default defineComponent({
  name: 'BalancePayment',
  components: { UserPaymentComponent },
  setup () {
    const company = companyStore()
    const companyId = computed(() => company.companyId)
    const userStore = useUserStore()
    const userId = computed(() => userStore.userId)
    const canSeeAll = ref<boolean>(false)
    const canSeeSalaries = ref<boolean>(false)
    const canSeeManualAddRemove = ref<boolean>(false)
    const canSeePayoutHistory = ref<boolean>(false)
    const canSeeManualAddedHistory = ref<boolean>(false)
    const canMakePayoutDefault = ref<boolean>(false)
    const canMakePayoutCustom = ref<boolean>(false)
    const canRevertPayout = ref<boolean>(false)
    const canAddEverything = ref<boolean>(false)
    const canAddTip = ref<boolean>(false)
    const canRemoveTip = ref<boolean>(false)
    const canAddShare = ref<boolean>(false)
    const canRemoveShare = ref<boolean>(false)
    const canResetNote = ref<boolean>(false)
    const loading = ref<boolean>(true)
    onMounted(() => {
      getPermissions()
    })
    watch(companyId, () => {
      getPermissions()
    })
    function getPermissions () {
      if (companyId.value <= 0) return
      loading.value = true
      api.get('/api/policies/balanceView/payout/' + companyId.value)
        .then((response) => {
          AssignPolicies([
            { policyName: 'BalanceView_PayOut_View_All', policyToAssign: canSeeAll },
            { policyName: 'BalanceView_PayOut_View_Salaries', policyToAssign: canSeeSalaries },
            { policyName: 'BalanceView_PayOut_View_ManualAddRemove', policyToAssign: canSeeManualAddRemove },
            { policyName: 'BalanceView_PayOut_View_PayOut_History', policyToAssign: canSeePayoutHistory },
            { policyName: 'BalanceView_PayOut_View_ManualAddRemove_History', policyToAssign: canSeeManualAddedHistory },
            { policyName: 'BalanceView_PayOut_Make_PayOut_Default', policyToAssign: canMakePayoutDefault },
            { policyName: 'BalanceView_PayOut_Make_PayOut_Custom', policyToAssign: canMakePayoutCustom },
            { policyName: 'BalanceView_PayOut_Revert_PayOut', policyToAssign: canRevertPayout },
            { policyName: 'BalanceView_PayOut_Add_Everything', policyToAssign: canAddEverything },
            { policyName: 'BalanceView_PayOut_Add_Tip', policyToAssign: canAddTip },
            { policyName: 'BalanceView_PayOut_Remove_Tip', policyToAssign: canRemoveTip },
            { policyName: 'BalanceView_PayOut_Add_Share', policyToAssign: canAddShare },
            { policyName: 'BalanceView_PayOut_Remove_Share', policyToAssign: canRemoveShare },
            { policyName: 'BalanceView_PayOut_Reset_Note', policyToAssign: canResetNote }
          ], response.data.balanceViewPolicies)
          loading.value = false
        })
        .catch((error) => {
          console.error(error)
        })
    }
    return {
      canSeeAll,
      canSeeSalaries,
      canSeeManualAddRemove,
      canSeePayoutHistory,
      canSeeManualAddedHistory,
      canMakePayoutDefault,
      canMakePayoutCustom,
      canRevertPayout,
      canAddEverything,
      canAddTip,
      canRemoveTip,
      canAddShare,
      canRemoveShare,
      canResetNote,
      companyId,
      loading,
      userId
    }
  }
})
</script>

<style scoped>

</style>
