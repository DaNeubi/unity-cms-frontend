<template>
  <div class="row">
    <LoadingAndPreparingIndicatorComponent :loading="loading" :preparing-data="preparingData"/>
    <apexchart :series="series" :options="chartOptions" class="col-12" ref="chart"
               width="100%" height="500px" v-if="!loading && !preparingData && series !== undefined"/>
    <ApexChartConfigOptions :chart-options="chartOptions"
                            @update-chart-stroke="(val) => chart.updateOptions(val)"
                            @update-data-label="(val) => chart.updateOptions(val)"
                            @update-chart-palette="(val) => chart.updateOptions(val)"
                            :show="(!loading && !preparingData && chart !== null && chart !== undefined)"/>
  </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, defineProps, watch } from 'vue'
import { api } from 'boot/axios'
import { ApexOptions } from 'apexcharts'
import de from 'apexcharts/dist/locales/de.json'
import LoadingAndPreparingIndicatorComponent
  from 'components/general/loadingPreparing/LoadingAndPreparingIndicatorComponent.vue'
import ApexChartConfigOptions from 'components/general/apexchart/ApexChartConfigOptions.vue'

const loading = ref<boolean>(false)
const preparingData = ref<boolean>(false)
const chart = ref()
const chartOptions = ref<ApexOptions>({
  chart: {
    type: 'area',
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
    },
    toolbar: {
      show: true,
      tools: {
        download: false,
        selection: false,
        zoom: false,
        zoomin: false,
        zoomout: false,
        pan: false,
        reset: false
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
  yaxis: {
    labels: {
      formatter: (value: number) => {
        return '$' + value.toFixed(2)
      }
    }
  },
  theme: {
    mode: 'dark',
    palette: 'palette8'
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.25,
      stops: [0, 90, 100]
    }
  },
  dataLabels: {
    enabled: true,
    formatter (val: string | number | number[]): string | number {
      return '$' + val
    }
  }
})
const series = ref() as Ref<({ name: string, data: number[] })[]>

const props = defineProps({
  companyId: {
    type: Number,
    required: true,
    default: undefined
  },
  startDate: {
    type: String,
    required: true,
    default: undefined
  },
  endDate: {
    type: String,
    required: true,
    default: undefined
  }
})
const currentStartDate = ref<string|undefined>(props.startDate)
const currentEndDate = ref<string|undefined>(props.endDate)

onMounted(() => {
  getSeries()
})

watch(() => props.startDate, (newVal) => {
  currentStartDate.value = newVal
  getSeries()
})

watch(() => props.endDate, (newVal) => {
  currentEndDate.value = newVal
  getSeries()
})

function getSeries () {
  if (props.companyId === undefined || currentStartDate.value === undefined || currentEndDate.value === undefined) return
  loading.value = true
  preparingData.value = false
  // clear series
  series.value = []
  api.get('/api/balanceView/self/day/duration/' + props.companyId + '?start_date=' + currentStartDate.value + '&end_date=' + currentEndDate.value)
    .then((response) => {
      loading.value = false
      preparingData.value = true
      if (chartOptions.value?.xaxis === undefined || chartOptions.value?.xaxis.categories === undefined) {
        chartOptions.value.xaxis = {
          categories: []
        }
      }
      chartOptions.value.xaxis.categories = response.data.days
      // create series
      const userShareSeries: { name: string, data: number[], type: string } = {
        name: 'Mitarbeiter Anteil',
        data: [],
        type: 'area'
      }
      const tipSeries: { name: string, data: number[], type: string } = {
        name: 'Trinkgeld',
        data: [],
        type: 'area'
      }
      const totalSeries: { name: string, data: number[], type: string } = {
        name: 'Gesamt an Verkäufen',
        data: [],
        type: 'area'
      }
      chartOptions.value.xaxis.categories.forEach((day: string) => {
        const incomeForDay = response.data.money_per_day.find((
          moneyPerDayTransaction: { day: string, total: number, type: number, user_id: number, user_share_amount: number, tip: number }) => {
          return moneyPerDayTransaction.day === day
        })
        if (incomeForDay !== undefined) {
          // insert the current income for the day
          userShareSeries.data.push(incomeForDay.user_share_amount === undefined ? 0 : incomeForDay.user_share_amount)
          tipSeries.data.push(incomeForDay.tip === undefined ? 0 : incomeForDay.tip)
          totalSeries.data.push(incomeForDay.total === undefined ? 0 : incomeForDay.total)
        } else {
          // insert 0 for the day
          userShareSeries.data.push(0)
          tipSeries.data.push(0)
          totalSeries.data.push(0)
        }
      })
      if (series.value === undefined || series.value === null) {
        series.value = []
      }
      series.value.push(userShareSeries)
      series.value.push(tipSeries)
      series.value.push(totalSeries)
      // check if we need to update the series
      if (chart.value !== null && chart.value !== undefined) {
        chart.value.updateSeries(series.value)
      }
      // check for update options
      if (chart.value !== null && chart.value !== undefined) {
        chart.value.updateOptions(chartOptions.value)
      }
      preparingData.value = false
    })
    .catch((error) => {
      console.error(error)
    })
}

</script>

<style scoped>

</style>
