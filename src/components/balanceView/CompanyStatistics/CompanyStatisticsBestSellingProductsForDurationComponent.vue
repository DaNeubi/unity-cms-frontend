<template>
  <q-card>
    <q-card-section>
      <div class="row q-gutter-sm">
        <div class="col-5">
          <h6 class="q-mt-none q-mb-sm">Meist verkaufte Produkte in den letzten {{ isNaN(duration) ? 'X' : duration }} Tagen</h6>
          <span v-if="startingDate !== undefined && endDate !== undefined">{{ startingDate }} - {{ endDate }}</span>
          <q-skeleton v-else type="text"/>
          <q-separator class="q-mt-md q-mb-md"/>
          <q-skeleton type="QRange" v-if="loadingCurrentCount"/>
          <q-scroll-area class="full-height" v-else>
            <div v-for="statItem in currentCount"
                 :key="statItem.item_id">
              {{ statItem.item?.name + ' (' + statItem.total_amount + ')' }}
            </div>
          </q-scroll-area>
        </div>
        <div class="col-6">
          <h6 class="q-mt-none q-mb-sm">Im Vergleich zu den vorherigen {{ isNaN(duration) ? 'X' : duration }} Tagen </h6>
          <span v-if="offsetStartDate !== undefined && offsetEndDate !== undefined">{{ offsetStartDate }} - {{ offsetEndDate }}</span>
          <q-skeleton v-else type="text"/>
          <q-separator class="q-mt-md q-mb-md"/>
          <q-skeleton type="QRange" v-if="loadingLastCount"/>
          <q-scroll-area class="full-height q-mt-md" v-else>
            <div v-for="statItem in lastCount"
                 :key="statItem.item_id">
              {{ statItem.item?.name + ' (' + statItem.total_amount + ')' }}
            </div>
          </q-scroll-area>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onMounted, Ref, ref, watch } from 'vue'
import { api } from 'boot/axios'
import { date } from 'quasar'
import { GetCurrentEndDate, GetCurrentStartDate } from 'src/misc/functions/time/CalculateCurrentViewTime'
import ICompanyStatisticsItemAmount from 'src/misc/interfaces/CompanyStatistics/ICompanyStatisticsItemAmount'

const props = defineProps({
  companyId: {
    type: Number,
    required: true,
    default: 0
  },
  updateInt: {
    type: Number,
    required: false,
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
const currentCount = ref<ICompanyStatisticsItemAmount>()
const lastCount = ref<ICompanyStatisticsItemAmount>()
const loadingCurrentCount = ref<boolean>(true)
const loadingLastCount = ref<boolean>(true)
watch(() => startingDate.value, () => {
  if (startingDate.value !== undefined && endDate.value !== undefined) {
    getItemCount(startingDate.value, endDate.value, currentCount, loadingCurrentCount)
  }
})
watch(() => offsetStartDate.value, () => {
  if (offsetStartDate.value !== undefined && offsetEndDate.value !== undefined) {
    getItemCount(offsetStartDate.value, offsetEndDate.value, lastCount, loadingLastCount)
  }
})
onMounted(() => {
  getItemCount(startingDate.value, endDate.value, currentCount, loadingCurrentCount)
  getItemCount(offsetStartDate.value, offsetEndDate.value, lastCount, loadingLastCount)
})
function getItemCount (startingDate: string, endingDate: string, arrayToFill: Ref<ICompanyStatisticsItemAmount | undefined>, loadingIndicator: Ref<boolean>) {
  if (props.companyId <= 0) return
  // check for valid dates
  if (startingDate === undefined || endingDate === undefined) return
  loadingIndicator.value = true
  api.get('/api/transaction/itemCount/' + props.companyId + '?start_date=' + startingDate + '&end_date=' + endingDate)
    .then((response) => {
      arrayToFill.value = response.data.transaction_items
      loadingIndicator.value = false
    })
    .catch((error) => {
      console.error(error)
    })
}
</script>

<style scoped>

</style>
