<template>
  <div class="row items-center justify-center">
    <calendar-view :show-date="currentDate" class="col-12 cal-theme-cms" style="height: 80vh"
                   :starting-day-of-week="1" :items="monthEvents">
      <template #header="{ headerProps }">
        <div class="cv-header q-pt-sm q-pb-sm q-pl-md">
          <div class="scv-header-nav row items-center justify-start q-gutter-sm">
            <edit-something-button icon="mdi-chevron-left" text="" aria-label="Letzter Monat" dense
                                   class="col-auto"
                                   @click.prevent="onInput(headerProps.previousPeriod!)"/>
            <q-btn :label="headerProps.currentPeriodLabel" class="col-auto" color="accent"
                   @click.prevent="onInput(headerProps.currentPeriod)"/>
            <edit-something-button icon="mdi-chevron-right" text="" aria-label="Nächster Monat" dense
                                   class="col-auto"
                                   @click.prevent="onInput(headerProps.nextPeriod!)"/>
            <div class="col-auto text-h4">
              {{ headerProps.periodLabel }}
            </div>
          </div>
        </div>
      </template>
      <template #item="{ value, top }">
        <div :class="`cv-item ` + calculateItemClasses(value.classes)"
             :style="'top: ' + top + ';' + setEventColorClasses(value.id as number) + ';' + value.originalItem.classes">
          <q-icon name="mdi-calendar-outline" class="text-h6"/>
          {{ value.title }} - {{ FormatDateTime(value.startDate) }} - {{ FormatDateTime(value.endDate) }}
          <q-tooltip class="text-body2" style="width: 20vw; height: 20vh;">
            <div>Start: {{ FormatDateTime(value.startDate) }} - Ende: {{ FormatDateTime(value.endDate) }}</div>
            {{ value.tooltip }}
          </q-tooltip>
          <q-menu context-menu anchor="top middle" self="top middle" style="z-index: 10000;">
            <q-list dense>
              <q-item clickable v-close-popup @click="submitForEdit(+value.id)">
                <q-item-section>
                  <q-item-label>Bearbeiten</q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="submitForDelete(+value.id)">
                <q-item-section>
                  <q-item-label>Löschen</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>
      </template>
    </calendar-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { CalendarView } from 'vue-simple-calendar'
import 'vue-simple-calendar/dist/style.css'
import 'src/css/calendar/cms-theme.css'
import ISimpleCalendarEvent from 'src/misc/interfaces/Calendar/ISimpleCalendarEvent'
import FormatDateTime from '../../misc/functions/FormatDateTime'
import { api } from 'boot/axios'
import { date } from 'quasar'
import ICalendarEvent from 'src/misc/interfaces/Calendar/ICalendarEvent'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'
// https://github.com/richardtallent/vue-simple-calendar/tree/v7.0.1

const props = defineProps({
  companyId: {
    type: Number,
    required: true,
    default: -1
  }
})
const currentDate = ref<Date>(new Date())
const monthEvents = ref<ISimpleCalendarEvent[]>([])
const emit = defineEmits(['edit-event', 'delete-event'])

watch(() => props.companyId, () => {
  loadEventsForDuration()
})

onMounted(() => {
  loadEventsForDuration()
})

defineExpose({
  reloadEventsForDuration
})

function calculateItemClasses (classes: string[]): string {
  let finishedClass = ''
  classes.forEach(c => {
    finishedClass += ' ' + c
  })
  return finishedClass
}
function setEventColorClasses (eventId: number): string {
  const event = monthEvents.value?.find(e => e.id === eventId)
  if (event === undefined) return ''
  return 'color: ' + event.textColor + '; background-color: ' + event.bgColor
}
function reloadEventsForDuration () {
  loadEventsForDuration()
}
function loadEventsForDuration () {
  if (props.companyId < 0) return
  const startDate = date.formatDate(date.startOfDate(currentDate.value, 'month'), 'YYYY-MM-DD')
  const endDate = date.formatDate(date.endOfDate(currentDate.value, 'month'), 'YYYY-MM-DD')
  api.get('/api/calendar/duration/' + props.companyId + '?start=' + startDate + '&end=' + endDate)
    .then((res) => {
      monthEvents.value = []
      // format to ISimpleCalendarEvent
      res.data.forEach((e: ICalendarEvent) => {
        const newEvent = {
          id: e.id,
          title: e.title,
          startDate: new Date(e.date),
          endDate: date.addToDate(new Date(e.date),
            { minutes: e.duration ?? 0 }),
          tooltip: e.details,
          bgColor: e.bgColor,
          textColor: e.textColor,
          duration: e.duration,
          location: e.location,
          created_at: e.created_at,
          updated_at: e.updated_at
        } as ISimpleCalendarEvent
        monthEvents.value?.push(newEvent)
      })
    })
    .catch((err) => {
      console.error(err)
    })
}
function onInput (date: Date) {
  currentDate.value = date
  reloadEventsForDuration()
}
function submitForEdit (eventId: number) {
  const event = monthEvents.value?.find(e => e.id === eventId)
  emit('edit-event', event)
}
function submitForDelete (eventId: number) {
  const event = monthEvents.value?.find(e => e.id === eventId)
  emit('delete-event', event)
}
</script>

<style scoped>

</style>
