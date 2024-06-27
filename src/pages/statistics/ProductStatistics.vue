<template>
  <BalanceViewDateSpanSelectionComponent class="col-12"
                                         :default-start-date="companySetting?.balance_view_start_date"
                                         :duration="companySetting?.balance_view_time_span"
                                         @update-time-range="(val) => updateDateSpan(val.startingDate, val.endingDate)"
                                         :company-update-indicator="companyUpdateIndicator"
                                         v-if="companySetting !== undefined"/>
  <q-tabs v-model="tab" inline-label active-color="orange-6" align="left" stretch>
    <q-tab name="all" label="Für Alle" icon="mdi-account-group" v-if="canSeeAll"/>
    <q-tab name="self" label="Für Mich" icon="mdi-account" v-if="canSeeSelf"/>
    <q-tab name="loading" label="Lade..." icon="mdi-loading" v-if="loading"/>
  </q-tabs>
  <q-tab-panels v-model="tab">
    <q-tab-panel name="all" style="min-height: 400px; height: 65vh;">
      <product-statistics-component v-if="startDate !== undefined && endDate !== undefined" class="q-mb-sm"
                                    endpoint-url="statistics/product/all"
                              :company-id="companyId" :start-date="startDate" :end-date="endDate"/>
    </q-tab-panel>
    <q-tab-panel name="self" style="min-height: 400px; height: 65vh;">
      <product-statistics-component v-if="startDate !== undefined && endDate !== undefined" class="q-mb-sm"
                                    endpoint-url="statistics/product/self"
                                    :company-id="companyId" :start-date="startDate" :end-date="endDate"/>
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { companyStore } from 'stores/companyStore'
import { api } from 'boot/axios'
import AssignPolicies from 'src/misc/functions/policies/Policies'
import BalanceViewDateSpanSelectionComponent
  from 'components/balanceView/DateSelection/BalanceViewDateSpanSelectionComponent.vue'
import { ICompanySetting } from 'src/misc/interfaces/CompanySetting/ICompanySetting'
import ProductStatisticsComponent from 'components/statistics/product/productStatisticsComponent.vue'

const loading = ref<boolean>(false)
const canSeeSelf = ref<boolean>(false)
const canSeeAll = ref<boolean>(false)
const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
const tab = ref('all')
const companySetting = ref<ICompanySetting | undefined>()
const companyUpdateIndicator = ref<number>(0)
const startDate = ref<string>()
const endDate = ref<string>()

onMounted(() => {
  getPolicies()
  getDefaultTime()
})

watch(() => companyId.value, () => {
  getPolicies()
  getDefaultTime()
})

function getPolicies () {
  loading.value = true
  api.get('/api/policies/statistics/product/' + companyId.value)
    .then((res) => {
      AssignPolicies([
        { policyName: 'Statistics_Products_All', policyToAssign: canSeeAll },
        { policyName: 'Statistics_Products_Self', policyToAssign: canSeeSelf }
      ], res.data)
      loading.value = false
    })
    .catch((err) => {
      console.error(err)
    })
}
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
