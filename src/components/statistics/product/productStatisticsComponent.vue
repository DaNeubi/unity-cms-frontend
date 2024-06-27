<template>
  <LoadingAndPreparingIndicatorComponent :preparing-data="preparingData" :loading="loading"/>
  <div class="text-h4">Anzahl der verkauften Artikel im Angegebenen Zeitraum</div>
  <apexchart :series="series" :options="chartOptions" ref="chart" width="100%"
             v-if="!loading && !preparingData && series !== undefined" type="bar"/>
  <ApexChartConfigOptions :chart-options="chartOptions" :show-stroke-options="false"
                          @update-chart-stroke="(val) => chart.updateOptions(val)"
                          @update-data-label="(val) => chart.updateOptions(val)"
                          @update-chart-palette="(val) => chart.updateOptions(val)"
                          marker-label="Anzahl anzeigen"
                          :show="(!loading && !preparingData && chart !== null && chart !== undefined)"/>
</template>

<script setup lang="ts">
import LoadingAndPreparingIndicatorComponent
  from 'components/general/loadingPreparing/LoadingAndPreparingIndicatorComponent.vue'
import { onMounted, ref, watch } from 'vue'
import { api } from 'boot/axios'
import { ApexOptions } from 'apexcharts'
import de from 'apexcharts/dist/locales/de.json'
import ApexChartConfigOptions from 'components/general/apexchart/ApexChartConfigOptions.vue'

const props = defineProps({
  companyId: {
    type: Number,
    required: true
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
  },
  endpointUrl: {
    type: String,
    required: true
  }
})

const loading = ref<boolean>(false)
const preparingData = ref<boolean>(false)
const currentStartDate = ref<string|undefined>(props.startDate)
const currentEndDate = ref<string|undefined>(props.endDate)
const chart = ref()
const chartOptions = ref<ApexOptions>({
  chart: {
    type: 'bar',
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
  xaxis: {
    categories: []
  },
  plotOptions: {
    bar: {
      horizontal: true
    }
  },
  dataLabels: {
    enabled: true,
    offsetX: -6,
    style: {
      fontSize: '12px',
      colors: ['#fff']
    }
  },
  stroke: {
    show: true,
    width: 1,
    colors: ['#fff']
  },
  theme: {
    mode: 'dark',
    palette: 'palette7'
  }
})
const series = ref()

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
  if (props.companyId === undefined || currentStartDate.value === undefined || currentEndDate.value === undefined || props.endpointUrl === undefined) return
  loading.value = true
  preparingData.value = false
  // clear series
  api.get('/api/' + props.endpointUrl + '/' + props.companyId + '?from=' + currentStartDate.value + '&to=' + currentEndDate.value)
    .then((res) => {
      loading.value = false
      preparingData.value = true
      if (chartOptions.value?.xaxis === undefined || chartOptions.value?.xaxis.categories === undefined) {
        chartOptions.value.xaxis = {
          categories: []
        }
      }
      chartOptions.value.xaxis.categories = res.data.companyItems?.map((item: { id: number, name: string }) => item.name)
      const productSeries: { name: string, data: number[] } = {
        name: 'Anzahl verkauft',
        data: []
      }
      res.data.companyItems?.forEach((item: { id: number, name: string }) => {
        // get the matching item from the res.data.productStatistics
        const product = res.data.productStatistics?.find((stat: { item_id: number, amount: number }) => stat.item_id === item.id)
        if (product !== undefined) {
          productSeries.data.push(+product.amount)
        } else {
          productSeries.data.push(0)
        }
      })
      series.value = []
      series.value.push(productSeries)
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
    .catch((err) => {
      console.error(err)
    })
}

</script>

<style scoped>

</style>
