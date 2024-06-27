<template>
  <q-card>
    <q-card-section>
      <div class="column">
        <h5 class="q-mt-none q-mb-sm">Anzahl der Verkäufe in den letzten {{ isNaN(duration) ? 'X' : duration }} Tagen</h5>
        <span v-if="startingDate !== undefined && endDate !== undefined">{{ startingDate }} - {{ endDate }}</span>
        <q-skeleton v-else type="text"/>
        <h3 class="q-mt-sm q-mb-none" v-if="!loadingCurrentCount">{{ currentCount }}</h3>
        <q-skeleton v-else type="text"/>
        <h5 class="q-mt-sm q-mb-sm">Im Vergleich zu den vorherigen {{ isNaN(duration) ? 'X' : duration }} Tagen</h5>
        <span v-if="offsetStartDate !== undefined && offsetEndDate !== undefined">{{ offsetStartDate }} - {{ offsetEndDate }}</span>
        <q-skeleton v-else type="text"/>
        <h4 class="q-mt-sm q-mb-none" v-if="!loadingLastCount">{{ lastCount }}</h4>
        <q-skeleton v-else type="text"/>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onMounted, Ref, ref, watch } from 'vue'
import { api } from 'boot/axios'
import { date } from 'quasar'
import { GetCurrentEndDate, GetCurrentStartDate } from 'src/misc/functions/time/CalculateCurrentViewTime'

const props = defineProps({
  companyId: {
    type: Number,
    required: true,
    default: 0
  },
  startDate: {
    type: String,
    required: true,
    default: ''
  },
  timeSpan: {
    type: Number,
    required: true,
    default: 0
  }
})

const duration = ref<number>(props.timeSpan / 1440)
const startingDate = computed(() => {
  return date.formatDate(GetCurrentStartDate(props.startDate, duration.value), 'DD.MM.YYYY')
})
const offsetStartDate = computed(() => {
  return date.formatDate(GetCurrentStartDate(props.startDate, duration.value, duration.value + 1), 'DD.MM.YYYY')
})
const endDate = computed(() => {
  return date.formatDate(GetCurrentEndDate(props.startDate, duration.value), 'DD.MM.YYYY')
})
const offsetEndDate = computed(() => {
  return date.formatDate(GetCurrentEndDate(props.startDate, duration.value, duration.value + 1), 'DD.MM.YYYY')
})
const currentCount = ref<number>(0)
const lastCount = ref<number>(0)
const loadingCurrentCount = ref<boolean>(true)
const loadingLastCount = ref<boolean>(true)
watch(() => startingDate.value, () => {
  if (startingDate.value !== undefined && endDate.value !== undefined) {
    getTransactionCount(startingDate.value, endDate.value, loadingCurrentCount, currentCount)
  }
})
watch(() => offsetStartDate.value, () => {
  if (offsetStartDate.value !== undefined && offsetEndDate.value !== undefined) {
    getTransactionCount(offsetStartDate.value, offsetEndDate.value, loadingLastCount, lastCount)
  }
})
onMounted(() => {
  getTransactionCount(startingDate.value, endDate.value, loadingCurrentCount, currentCount)
  getTransactionCount(offsetStartDate.value, offsetEndDate.value, loadingLastCount, lastCount)
})
function getTransactionCount (startingDate: string | undefined, endingDate: string | undefined, loading: Ref<boolean>, count: Ref<number>) {
  if (props.companyId <= 0) return
  if (startingDate === undefined || endingDate === undefined) return
  loading.value = true
  api.get('/api/transaction/count/' + props.companyId + '?start_date=' + startingDate + '&end_date=' + endingDate)
    .then((response) => {
      count.value = response.data.transaction_count
      loading.value = false
    })
    .catch((error) => {
      console.error(error)
    })
}
</script>

<style scoped>

</style>
