<template>
  <div class="row full-width">
    <div class="row q-gutter-sm justify-center">
      <CompanyStatisticsTransactionAmountForDurationComponent class="col-4"
                                                              :company-id="companyId"
                                                              v-if="(canViewAll || canViewSellingHistory) && companySetting !== undefined"
                                                              :start-date="companySetting.balance_view_start_date"
                                                              :time-span="companySetting.balance_view_time_span"/>
      <CompanyStatisticsBestSellingProductsForDurationComponent class="col-7"
                                                                :company-id="companyId"
                                                                v-if="(canViewAll || canViewProductHistory) && companySetting !== undefined"
                                                                :start-date="companySetting.balance_view_start_date"
                                                                :time-span="companySetting.balance_view_time_span"/>
    </div>
    <CompanyStatisticsMonthTable class="q-mt-md full-width"
                                 :can-view-all="canViewAll"
                                 :can-view-month-table="canViewMonthTable"
                                 :can-view-month-revenue="canViewRevenue"
                                 :can-view-month-tax="canViewTax"
                                 :can-view-year-revenue="canViewYearRevenue"
                                 :company-id="companyId"/>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import CompanyStatisticsTransactionAmountForDurationComponent
  from 'components/balanceView/CompanyStatistics/CompanyStatisticsTransactionAmountForDurationComponent.vue'
import CompanyStatisticsBestSellingProductsForDurationComponent
  from 'components/balanceView/CompanyStatistics/CompanyStatisticsBestSellingProductsForDurationComponent.vue'
import CompanyStatisticsMonthTable from 'components/balanceView/CompanyStatistics/CompanyStatisticsMonthTable.vue'
import { companyStore } from 'stores/companyStore'
import { ICompanySetting } from 'src/misc/interfaces/CompanySetting/ICompanySetting'
import { api } from 'boot/axios'
import AssignPolicies from 'src/misc/functions/policies/Policies'

export default defineComponent({
  name: 'BalanceCompanyStatistics',
  components: { CompanyStatisticsMonthTable, CompanyStatisticsBestSellingProductsForDurationComponent, CompanyStatisticsTransactionAmountForDurationComponent },
  setup () {
    const company = companyStore()
    const companyId = computed(() => company.companyId)
    const canViewAll = ref<boolean>(false)
    const canViewSellingHistory = ref<boolean>(false)
    const canViewProductHistory = ref<boolean>(false)
    const canViewMonthTable = ref<boolean>(false)
    const canViewRevenue = ref<boolean>(false)
    const canViewTax = ref<boolean>(false)
    const canViewYearRevenue = ref<boolean>(false)
    const companySetting = ref<ICompanySetting | undefined>()
    onMounted(() => {
      getPolicies()
      getDefaultTime()
    })
    watch(() => companyId.value, () => {
      getPolicies()
      getDefaultTime()
    })
    function getDefaultTime () {
      if (companyId.value <= 0) return
      api.get('/api/companySettings/balance/reduced/' + companyId.value)
        .then((response) => {
          companySetting.value = response.data.companySettings[0]
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function getPolicies () {
      if (companyId.value <= 0) return
      api.get('/api/policies/balanceView/companyStatistics/' + companyId.value)
        .then((response) => {
          AssignPolicies([
            { policyName: 'BalanceView_CompanyStatistics_View_All', policyToAssign: canViewAll },
            { policyName: 'BalanceView_CompanyStatistics_View_Selling_History', policyToAssign: canViewSellingHistory },
            { policyName: 'BalanceView_CompanyStatistics_View_Product_History', policyToAssign: canViewProductHistory },
            { policyName: 'BalanceView_CompanyStatistics_View_MonthTable', policyToAssign: canViewMonthTable },
            { policyName: 'BalanceView_CompanyStatistics_View_Revenue', policyToAssign: canViewRevenue },
            { policyName: 'BalanceView_CompanyStatistics_View_Tax', policyToAssign: canViewTax },
            { policyName: 'BalanceView_CompanyStatistics_View_Year_Revenue', policyToAssign: canViewYearRevenue }
          ], response.data.balanceViewPolicies)
        })
        .catch((error) => {
          console.error(error)
        })
    }
    return {
      companyId,
      canViewAll,
      canViewSellingHistory,
      canViewProductHistory,
      canViewMonthTable,
      canViewRevenue,
      canViewTax,
      companySetting,
      canViewYearRevenue
    }
  }
})
</script>

<style scoped>

</style>
