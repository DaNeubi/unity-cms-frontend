<template>
  <div class="row">
    <LoadingAndPreparingIndicatorComponent :loading="loading" :preparing-data="preparingData"/>
    <apexchart :series="series" :options="chartOptions" class="col-12" ref="chart"
               width="100%" height="500px" v-if="!loading && !preparingData && series !== undefined"/>
    <ApexChartConfigOptions :chart-options="chartOptions"
                            @update-chart-stroke="(val) => chart.updateOptions(val)"
                            @update-data-label="(val) => chart.updateOptions(val)"
                            @update-chart-palette="(val) => chart.updateOptions(val)"
                            :show="(!loading && !preparingData && chart !== undefined)"/>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, PropType, Ref, ref } from 'vue'
import { api } from 'boot/axios'
import LoadingAndPreparingIndicatorComponent
  from 'components/general/loadingPreparing/LoadingAndPreparingIndicatorComponent.vue'
import { ApexOptions } from 'apexcharts'
import de from 'apexcharts/dist/locales/de.json'
import ApexChartConfigOptions from 'components/general/apexchart/ApexChartConfigOptions.vue'

const loading = ref<boolean>(false)
const preparingData = ref<boolean>(false)
const chart = ref()
const series = ref() as Ref<({ name: string, data: number[] })[]>
const chartOptions = ref<ApexOptions>({
  chart: {
    type: 'line',
    locales: [de],
    defaultLocale: 'de',
    zoom: {
      enabled: false
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 1200,
      dynamicAnimation: {
        enabled: true,
        speed: 675
      }
    }
  },
  stroke: {
    show: true,
    curve: 'smooth'
  },
  xaxis: {
    categories: [],
    type: 'datetime'
  },
  legend: {
    position: 'top',
    fontSize: '25px'
  },
  theme: {
    mode: 'dark',
    palette: 'palette8'
  },
  dataLabels: {
    enabled: true,
    formatter: (value: number) => {
      return value
    }
  }
})

const props = defineProps({
  companyId: {
    type: null as unknown as PropType<number | undefined>,
    required: true
  },
  startDate: {
    type: null as unknown as PropType<string | undefined>,
    required: true
  },
  endDate: {
    type: null as unknown as PropType<string | undefined>,
    required: true
  }
})

onMounted(() => {
  getSalesCountSeries()
})

defineExpose({
  getSalesCountSeries
})

function getSalesCountSeries () {
  if (props.companyId === undefined || props.startDate === undefined || props.endDate === undefined) return
  loading.value = true
  preparingData.value = false
  // clear series
  series.value = []
  api.get('/api/balanceView/all/day/salesCount/' + props.companyId + '?start_date=' + props.startDate + '&end_date=' + props.endDate)
    .then((res) => {
      loading.value = false
      preparingData.value = true
      if (chartOptions.value?.xaxis === undefined || chartOptions.value?.xaxis.categories === undefined) {
        chartOptions.value.xaxis = {
          categories: []
        }
      }
      chartOptions.value.xaxis.categories = res.data.days
      // create series
      const userCashRegisterTransactionsSeries: { name: string, data: number[], type: string } = {
        name: 'Verkäufe',
        data: [],
        type: 'line'
      }
      const userContractTransactionsSeries: { name: string, data: number[], type: string } = {
        name: 'Vertrags Verkäufe',
        data: [],
        type: 'line'
      }
      const userContractOnHoldTransactionsSeries: { name: string, data: number[], type: string } = {
        name: 'Vertrags Verkäufe warten auf Zahlung',
        data: [],
        type: 'line'
      }
      chartOptions.value.xaxis.categories.forEach((day: string) => {
        // get the data for the day
        const cashRegisterTransactionForDay = res.data.user_sales_count.find((userSalesCount: { sales: number, user_id: number, day: string }) => {
          return userSalesCount.day === day
        })
        const contractTransactionForDay = res.data.user_transaction_bookings.find((userContractSalesCount: { sales: number, user_id: number, day: string }) => {
          return userContractSalesCount.day === day
        })
        const userContractOnHoldTransactionForDay = res.data.user_on_hold_transactions.find((userContractSalesCount: { sales: number, user_id: number, day: string }) => {
          return userContractSalesCount.day === day
        })
        // put the data for the day
        if (cashRegisterTransactionForDay !== undefined) {
          userCashRegisterTransactionsSeries.data.push(cashRegisterTransactionForDay.sales === undefined ? 0 : cashRegisterTransactionForDay.sales)
        } else {
          userCashRegisterTransactionsSeries.data.push(0)
        }
        if (contractTransactionForDay !== undefined) {
          userContractTransactionsSeries.data.push(contractTransactionForDay.sales === undefined ? 0 : contractTransactionForDay.sales)
        } else {
          userContractTransactionsSeries.data.push(0)
        }
        if (userContractOnHoldTransactionForDay !== undefined) {
          userContractOnHoldTransactionsSeries.data.push(userContractOnHoldTransactionForDay.sales === undefined ? 0 : userContractOnHoldTransactionForDay.sales)
        } else {
          userContractOnHoldTransactionsSeries.data.push(0)
        }
      })
      if (series.value === undefined || series.value === null) {
        series.value = []
      }
      series.value.push(userCashRegisterTransactionsSeries)
      series.value.push(userContractTransactionsSeries)
      series.value.push(userContractOnHoldTransactionsSeries)
      // check if we need to update the series
      if (chart.value !== undefined && chart.value !== null) {
        chart.value.updateSeries(series.value)
      }
      // check for update options
      if (chart.value !== undefined && chart.value !== null) {
        chart.value.updateOptions(chartOptions.value)
      }
      preparingData.value = false
    })
    .catch((err) => {
      console.error(err)
    })
}

</script>

<style scoped>

</style>
