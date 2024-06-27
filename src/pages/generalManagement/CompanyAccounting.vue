<template>
  <div class="column q-gutter-lg"
       v-if="loadingPermissions">
    <q-skeleton height="5rem"/>
    <q-skeleton height="5rem"/>
    <q-skeleton height="5rem"/>
    <q-skeleton height="5rem"/>
  </div>
  <div class="column q-gutter-lg"
       v-else>
    <AccountingDefaultTaxationComponent
      v-if="canSeeCompanyTax"
      :can-see-company-tax="canSeeCompanyTax"
      :can-edit-company-tax="canEditCompanyTax"
      :company-id="companyId"
      :update-number="updateNumberCompanyTax"/>
    <AccountingEmployeeShareComponent
      v-if="canSeeAllUserShares"
      :company-id="companyId"
      :can-delete-user-shares="canDeleteAllUserShares"
      :can-see-user-shares="canSeeAllUserShares"
      :can-edit-user-shares="canEditAllUserShares"
      :can-create-user-shares="canCreateNewAllUserShares"
      :update-number="updateNumberUserShares"/>
    <AccountingUserAlwaysShareComponent
      v-if="canSeeAllUserAlwaysShares"
      :company-id="companyId"
      :update-number="updateNumberUserAlwaysShares"
      :can-create-user-always-shares="canCreateNewAllUserAlwaysShares"
      :can-delete-user-always-shares="canDeleteAllUserAlwaysShares"
      :can-edit-user-always-shares="canEditAllUserAlwaysShares"
      :can-see-user-always-shares="canSeeAllUserAlwaysShares"/>
    <AccountingBalanceViewTimeSpanComponent
      v-if="canSeeBalanceView"
      :company-id="companyId"
      :update-number="updateNumberBalanceView"
      :can-edit-balance-view-duration="canEditBalanceViewDuration"
      :can-see-balance-view="canSeeBalanceView"
      :can-edit-balance-view-start="canEditBalanceViewStart"/>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import AccountingDefaultTaxationComponent
  from 'components/generalManagement/Accounting/AccountingDefaultTaxationComponent.vue'
import AccountingEmployeeShareComponent
  from 'components/generalManagement/Accounting/AccountingUserShareComponent.vue'
import AccountingUserAlwaysShareComponent
  from 'components/generalManagement/Accounting/AccountingUserAlwaysShareComponent.vue'
import AccountingBalanceViewTimeSpanComponent
  from 'components/generalManagement/Accounting/AccountingBalanceViewTimeSpanComponent.vue'
import { api } from 'src/boot/axios'
import { companyStore } from 'stores/companyStore'
import laravelEcho from 'boot/laravelecho'
import { useUserStore } from 'stores/useUserStore'
import UserAccountingReloadNotification from 'src/misc/classes/User/Notification/UserAccountingReloadNotification'
import AssignPolicies from 'src/misc/functions/policies/Policies'

export default defineComponent({
  name: 'CompanyAccounting',
  components: { AccountingBalanceViewTimeSpanComponent, AccountingUserAlwaysShareComponent, AccountingEmployeeShareComponent, AccountingDefaultTaxationComponent },
  setup () {
    const canSeeCompanyTax = ref<boolean>(false)
    const canEditCompanyTax = ref<boolean>(false)
    const canSeeAllUserShares = ref<boolean>(false)
    const canEditAllUserShares = ref<boolean>(false)
    const canDeleteAllUserShares = ref<boolean>(false)
    const canCreateNewAllUserShares = ref<boolean>(false)
    const canSeeAllUserAlwaysShares = ref<boolean>(false)
    const canEditAllUserAlwaysShares = ref<boolean>(false)
    const canDeleteAllUserAlwaysShares = ref<boolean>(false)
    const canCreateNewAllUserAlwaysShares = ref<boolean>(false)
    const canSeeBalanceView = ref<boolean>(false)
    const canEditBalanceViewStart = ref<boolean>(false)
    const canEditBalanceViewDuration = ref<boolean>(false)
    const cStore = companyStore()
    const companyId = computed(() => cStore.companyId)
    const userStore = useUserStore()
    const userId = computed(() => userStore.userId)
    const updateNumberCompanyTax = ref<number>(0)
    const updateNumberUserShares = ref<number>(0)
    const updateNumberUserAlwaysShares = ref<number>(0)
    const updateNumberBalanceView = ref<number>(0)
    const loadingPermissions = ref<boolean>(true)
    watch(companyId, () => {
      getPermissions()
    })
    onMounted(() => {
      getPermissions()
      joinReloadChannel()
    })
    watch(userId, () => {
      joinReloadChannel()
    })
    onUnmounted(() => {
      // stop listening to the change event
      laravelEcho.leave('user.reload.' + userId.value)
    })
    function joinReloadChannel () {
      if (userId.value <= 0) { return }
      // listen to the change event
      laravelEcho.private('user.reload.' + userId.value)
        .listen('.user.reload', (cb: UserAccountingReloadNotification) => {
          // just reload the discounts
          if (cb.userNotification.isTax) {
            updateNumberCompanyTax.value++
          } else if (cb.userNotification.isUserShare) {
            updateNumberUserShares.value++
          } else if (cb.userNotification.isUserAlwaysShare) {
            updateNumberUserAlwaysShares.value++
          } else if (cb.userNotification.isBalanceViewThing) {
            updateNumberBalanceView.value++
          }
        })
    }
    function getPermissions () {
      if (companyId.value <= 0) { return }
      loadingPermissions.value = true
      api.get('/api/policies/generalManagement/accounting/' + companyId.value)
        .then((res) => {
          AssignPolicies([
            { policyName: 'GeneralManagement_Accounting_DefaultTax_View', policyToAssign: canSeeCompanyTax },
            { policyName: 'GeneralManagement_Accounting_DefaultTax_Edit', policyToAssign: canEditCompanyTax },
            { policyName: 'GeneralManagement_Accounting_UserShare_View_All', policyToAssign: canSeeAllUserShares },
            { policyName: 'GeneralManagement_Accounting_UserShare_Update', policyToAssign: canEditAllUserShares },
            { policyName: 'GeneralManagement_Accounting_UserShare_Delete', policyToAssign: canDeleteAllUserShares },
            { policyName: 'GeneralManagement_Accounting_UserShare_Create', policyToAssign: canCreateNewAllUserShares },
            { policyName: 'GeneralManagement_Accounting_UserAlwaysShare_View_All', policyToAssign: canSeeAllUserAlwaysShares },
            { policyName: 'GeneralManagement_Accounting_UserAlwaysShare_Update', policyToAssign: canEditAllUserAlwaysShares },
            { policyName: 'GeneralManagement_Accounting_UserAlwaysShare_Delete', policyToAssign: canDeleteAllUserAlwaysShares },
            { policyName: 'GeneralManagement_Accounting_UserAlwaysShare_Create', policyToAssign: canCreateNewAllUserAlwaysShares },
            { policyName: 'GeneralManagement_Accounting_BalanceView_View', policyToAssign: canSeeBalanceView },
            { policyName: 'GeneralManagement_Accounting_BalanceView_Update_Start', policyToAssign: canEditBalanceViewStart },
            { policyName: 'GeneralManagement_Accounting_BalanceView_Update_Duration', policyToAssign: canEditBalanceViewDuration }
          ], res.data.accountingPolicies)
          loadingPermissions.value = false
        })
        .catch((err) => {
          console.error(err)
        })
    }
    return {
      canSeeCompanyTax,
      canEditCompanyTax,
      canSeeAllUserShares,
      canEditAllUserShares,
      canDeleteAllUserShares,
      canCreateNewAllUserShares,
      canSeeAllUserAlwaysShares,
      canEditAllUserAlwaysShares,
      canDeleteAllUserAlwaysShares,
      canCreateNewAllUserAlwaysShares,
      canSeeBalanceView,
      canEditBalanceViewStart,
      canEditBalanceViewDuration,
      companyId,
      updateNumberCompanyTax,
      loadingPermissions,
      updateNumberUserShares,
      updateNumberUserAlwaysShares,
      updateNumberBalanceView
    }
  }
})
</script>

<style scoped>

</style>
