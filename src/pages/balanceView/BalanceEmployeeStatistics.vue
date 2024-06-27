<template>
  <div class="row">
    <!-- <BalanceViewDateSpanSelectionComponent class="col-12"
                                           :default-start-date="companySetting?.balance_view_start_date"
                                           :duration="companySetting?.balance_view_time_span"
                                           @update-time-range="(val) => updateDateSpan(val.startingDate, val.endingDate)"
                                           :company-update-indicator="companyUpdateIndicator"
                                           v-if="companySetting !== undefined"/>
    <div class="col-12" v-else>
      <q-skeleton height="4em"/>
    </div>
    <BasicEmployeeStatisticsComponent class="col-12 q-mt-md" :start-date="startDate" ref="employeeStatisticsComponent"
                                      v-if="startDate !== undefined && endDate !== undefined"
                                      :end-date="endDate" :company-id="companyId"/>-->
    Hier gerne noch Feedback was gewünscht ist
  </div>
</template>

<script setup lang="ts">

// import { companyStore } from 'stores/companyStore'
// import { computed, onMounted, ref, watch } from 'vue'
// import { ICompanySetting } from 'src/misc/interfaces/CompanySetting/ICompanySetting'
// import { api } from 'boot/axios'
// import BalanceViewDateSpanSelectionComponent
//   from 'components/balanceView/DateSelection/BalanceViewDateSpanSelectionComponent.vue'
// import BasicEmployeeStatisticsComponent
//   from 'components/balanceView/EmployeeStatistics/BasicEmployeeStatisticsComponent.vue'
//
// const cStore = companyStore()
// const companyId = computed(() => cStore.companyId)
// const startDate = ref<string>()
// const endDate = ref<string>()
// const companySetting = ref<ICompanySetting | undefined>()
// const companyUpdateIndicator = ref<number>(0)
// const employeeStatisticsComponent = ref()
//
// onMounted(() => {
//   getDefaultTime()
// })
//
// watch(companyId, () => {
//   getDefaultTime()
// })
//
// function updateDateSpan (startingDate: string | Date, endingDate: string | Date) {
//   startDate.value = startingDate.toString()
//   endDate.value = endingDate.toString()
//   if (employeeStatisticsComponent.value === undefined) return
//   employeeStatisticsComponent.value.getSalesCountSeries()
// }
//
// function getDefaultTime () {
//   if (companyId.value <= 0) return
//   api.get('/api/companySettings/balance/reduced/' + companyId.value)
//     .then((response) => {
//       companySetting.value = response.data.companySettings[0]
//       companyUpdateIndicator.value++
//     })
//     .catch((error) => {
//       console.error(error)
//     })
// }

</script>

<style scoped>

</style>
