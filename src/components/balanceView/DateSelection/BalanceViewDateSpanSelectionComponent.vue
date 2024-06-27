<template>
  <div class="row q-gutter-md items-baseline">
    <q-btn label="Zeitraum aktualisieren"
           color="positive"
           outline
           icon="mdi-calendar-clock"
           class="col"
           @click="$emit('update-time-range', {startingDate: startDate, endingDate: endDate})"/>
    <q-input filled v-model="startDate" class="col-5">
      <template v-slot:append>
        <q-icon name="mdi-calendar" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date v-model="startDate" mask="DD.MM.YYYY">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Schließen" color="accent" flat/>
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
    <q-input filled v-model="endDate" class="col-5">
      <template v-slot:append>
        <q-icon name="mdi-calendar" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date v-model="endDate" mask="DD.MM.YYYY">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Schließen" color="accent" flat/>
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'
import { date } from 'quasar'
import { GetCurrentEndDate, GetCurrentStartDate } from 'src/misc/functions/time/CalculateCurrentViewTime'

export default defineComponent({
  name: 'BalanceViewDateSpanSelectionComponent',
  props: {
    defaultStartDate: String,
    duration: {
      type: Number,
      default: 2880
    },
    companyUpdateIndicator: {
      type: Number,
      default: 0
    }
  },
  emits: [
    'update-time-range'
  ],
  setup (props, { emit }) {
    const startDate = ref(date.formatDate(GetCurrentStartDate(props.defaultStartDate, (props.duration ?? 0) / 1440), 'DD.MM.YYYY'))
    const endDate = ref(date.formatDate(GetCurrentEndDate(props.defaultStartDate, (props.duration ?? 0) / 1440), 'DD.MM.YYYY'))
    onMounted(() => {
      if (startDate.value !== undefined && endDate.value !== undefined) {
        emit('update-time-range', { startingDate: startDate.value, endingDate: endDate.value })
      }
    })
    watch(() => props.companyUpdateIndicator, () => {
      if (startDate.value !== undefined && endDate.value !== undefined) {
        emit('update-time-range', { startingDate: startDate.value, endingDate: endDate.value })
      }
    })
    return {
      startDate,
      endDate
    }
  }
})
</script>

<style scoped>

</style>
