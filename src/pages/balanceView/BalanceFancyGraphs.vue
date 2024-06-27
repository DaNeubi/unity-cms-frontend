<template>
  <div class="row">
    <BalanceViewDateSpanSelectionComponent class="col-12"
                                           :default-start-date="companySetting?.balance_view_start_date"
                                           :duration="companySetting?.balance_view_time_span"
                                           @update-time-range="(val) => updateDateSpan(val.startingDate, val.endingDate)"
                                           :company-update-indicator="companyUpdateIndicator"
                                           v-if="companySetting !== undefined"/>
    <div class="col-12" v-else>
      <q-skeleton height="4em"/>
    </div>
    <MoneyOverTimeChart :company-id="companyId" :start-date="startDate" class="col-12 q-mt-md"
                        v-if="startDate !== undefined && endDate !== undefined"
                        :end-date="endDate"/>
  </div>
</template>

<script setup lang="ts">
import { companyStore } from 'stores/companyStore'
import { computed, onMounted, ref, watch } from 'vue'
import BalanceViewDateSpanSelectionComponent
  from 'components/balanceView/DateSelection/BalanceViewDateSpanSelectionComponent.vue'
import MoneyOverTimeChart from 'components/balanceView/FancyGraph/MoneyOverTimeChart.vue'
import { api } from 'boot/axios'
import { ICompanySetting } from 'src/misc/interfaces/CompanySetting/ICompanySetting'

const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
const startDate = ref<string>()
const endDate = ref<string>()
const companySetting = ref<ICompanySetting | undefined>()
const companyUpdateIndicator = ref<number>(0)

onMounted(() => {
  getDefaultTime()
})

watch(companyId, () => {
  getDefaultTime()
})

function updateDateSpan (startingDate: string | Date, endingDate: string | Date) {
  startDate.value = startingDate.toString()
  endDate.value = endingDate.toString()
}

function getDefaultTime () {
  if (companyId.value <= 0) return
  api.get('/api/companySettings/balance/reduced/' + companyId.value)
    .then((response) => {
      companySetting.value = response.data.companySettings[0]
      companyUpdateIndicator.value++
    })
    .catch((error) => {
      console.error(error)
    })
}

</script>

<style scoped>

</style>
