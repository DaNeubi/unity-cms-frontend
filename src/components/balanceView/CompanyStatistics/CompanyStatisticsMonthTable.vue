<template>
  <q-card>
    <q-card-section>
      <div class="row q-gutter-md" v-if="loadingTable">
        <q-skeleton type="rect"
                    v-for="n in 5"
                    :key="n"
                    class="col-12"/>
      </div>
      <div class="row" v-else>
        <q-select v-model="selectedYear"
                  outlined
                  :options="years"
                  label="Jahr"
                  class="col-12"/>
        <q-tabs v-model="tab"
                inline-label
                align="center"
                class="q-mt-sm col-12">
          <CompanyStatisticsTabComponent v-for="month in months"
                                         :key="month"
                                         :name="month"
                                         :label="month"/>
        </q-tabs>
        <q-tab-panels v-model="tab"
                      v-if="(yearStatistics !== undefined) && (canViewAll || canViewMonthTable)"
                      class="col-12">
          <CompanyStatisticsTabContentComponent v-for="(month, n) in months"
                                                :key="month"
                                                :name="month"
                                                :can-view-month-revenue="canViewMonthRevenue"
                                                :can-view-month-tax="canViewMonthTax"
                                                :can-view-month-table="canViewMonthTable"
                                                :values="yearStatistics.months[n]"/>
        </q-tab-panels>
      </div>
    </q-card-section>
    <q-card-section v-if="!loadingTable">
      <div class="row" v-if="canViewAll || canViewYearRevenue">
        <div class="col-12">
          <div class="text-h4">
            Aktueller Jahresumsatz: ${{ yearStatistics?.months.reduce((partialSum, singleMonth) => partialSum + singleMonth.weeks.reduce((partialSum2, singleWeek) => partialSum2 + singleWeek.total, 0), 0) ?? 0 }}
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'
import CompanyStatisticsTabComponent
  from 'components/balanceView/CompanyStatistics/Tabs/CompanyStatisticsTabComponent.vue'
import CompanyStatisticsTabContentComponent
  from 'components/balanceView/CompanyStatistics/Tabs/CompanyStatisticsTabContentComponent.vue'
import { api } from 'src/boot/axios'
import ICompanyStatisticsYearTable from 'src/misc/interfaces/CompanyStatistics/ICompanyStatisticsYearTable'

export default defineComponent({
  name: 'CompanyStatisticsMonthTable',
  components: { CompanyStatisticsTabContentComponent, CompanyStatisticsTabComponent },
  props: {
    companyId: {
      type: Number,
      required: true,
      default: 0
    },
    canViewAll: {
      type: Boolean,
      required: true,
      default: false
    },
    canViewMonthTable: {
      type: Boolean,
      required: true,
      default: false
    },
    canViewMonthRevenue: {
      type: Boolean,
      required: true,
      default: false
    },
    canViewMonthTax: {
      type: Boolean,
      required: true,
      default: false
    },
    canViewYearRevenue: {
      type: Boolean,
      required: true,
      default: false
    },
    fromExternal: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  setup (props) {
    const years = ref<number[]>([])
    const selectedYear = ref()
    const tab = ref()
    const months = ref<string[]>([])
    const yearStatistics = ref<ICompanyStatisticsYearTable>()
    const loadingTable = ref<boolean>(true)
    onMounted(() => {
      calculateYears()
      calculateMonths()
      setDefaultTab()
      getYearStatistics()
    })
    watch(() => props.companyId, () => {
      calculateYears()
      calculateMonths()
      setDefaultTab()
      getYearStatistics()
    })

    watch(() => selectedYear.value, () => {
      getYearStatistics()
    })
    /**
     * Calculates the available years
     */
    function calculateYears () {
      const startYear = 2023
      const currentYear = new Date().getFullYear()
      const yearDiff = currentYear - startYear
      for (let i = 0; i <= yearDiff; i++) {
        years.value.push(startYear + i)
        if (startYear + i === currentYear) {
          selectedYear.value = startYear + i
        }
      }
    }
    /**
     * Calculates the months and adds them to the array
     */
    function calculateMonths () {
      const currentYear = new Date().getFullYear()
      for (let i = 0; i <= 11; i++) {
        months.value.push(
          new Intl.DateTimeFormat('de-DE', { month: 'long' })
            .format(new Date(currentYear, i)))
      }
    }
    /**
     * Sets the default selected tab
     */
    function setDefaultTab () {
      const currentMonth = new Date().getMonth()
      if (months.value.length > 0) {
        tab.value = months.value[currentMonth]
      }
    }
    function getYearStatistics () {
      if (props.companyId <= 0) return
      if (selectedYear.value === undefined || selectedYear.value < 2022) return
      loadingTable.value = true
      if (!props.fromExternal) {
        api.get('/api/balanceView/year/' + props.companyId + '?year=' + selectedYear.value)
          .then((response) => {
            yearStatistics.value = response.data.year_statistics
            loadingTable.value = false
          })
          .catch((error) => {
            console.error(error)
          })
      } else {
        api.get('/api/government/companyBalanceView?company_id=' + props.companyId + '&year=' + selectedYear.value)
          .then((response) => {
            yearStatistics.value = response.data
            loadingTable.value = false
          })
          .catch((error) => {
            console.error(error)
          })
      }
    }
    return {
      years,
      selectedYear,
      tab,
      months,
      yearStatistics,
      loadingTable
    }
  }
})
</script>

<style scoped>

</style>
