<template>
  <div class="q-ma-sm calendarEvent" :style="getBackgroundColor() + ';' + getTextColor() + ';'">
    <q-menu context-menu>
      <q-list dense>
        <q-item clickable v-close-popup @click="$emit('event-edit')">
          <q-item-section>
            Ändern...
          </q-item-section>
        </q-item>
        <q-separator/>
        <q-item clickable v-close-popup @click="$emit('event-view-details')">
          <q-item-section>
            Details...
          </q-item-section>
        </q-item>
        <q-separator/>
        <q-item clickable v-close-popup @click="$emit('event-delete')">
          <q-item-section>
            Löschen...
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
    <div class="row items-center justify-center q-ma-sl">
      <div class="text-bold">
        <q-icon name="mdi-calendar-heart"></q-icon>{{ props.event.title }}
      </div>
    </div>
    <q-separator color="dark"/>
    <div class="row q-ma-sm">
      <div class="text-subtitle2 col-12">
        {{ formatDateToGerman(props.event.date) }} - {{ getEndDate(props.event.date, props.event.duration) }}
      </div>
      <p class="with-breaks">
        {{ trimEventDetailsLength(props.event.details) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import ICalendarEvent from 'src/misc/interfaces/Calendar/ICalendarEvent'
import { date } from 'quasar'

const props = defineProps<{
  event: ICalendarEvent
}>()
defineEmits([
  'event-edit',
  'event-delete',
  'event-view-details'
])

function getBackgroundColor () {
  return 'background-color:' + props.event.bgColor ?? 'lightgrey'
}
function getTextColor () {
  return 'color:' + props.event.textColor ?? 'black'
}
function formatDateToGerman (startDate: string) {
  return date.formatDate(startDate, 'DD.MM.YYYY HH:mm')
}
function getEndDate (startDate: string, duration: string) {
  const hours = parseInt(duration.split(':')[0])
  const minutes = parseInt(duration.split(':')[1])
  const endDate = date.addToDate(startDate, { hours, minutes })
  return date.formatDate(endDate, 'DD.MM.YYYY HH:mm')
}
function trimEventDetailsLength (details: string) {
  if (details?.length > 100) {
    return details?.substring(0, 100) + '...'
  }
  return details
}

</script>

<style scoped>
.calendarEvent {
  border-radius: 7px;
}
p.with-breaks {
  white-space: pre-wrap;
}
</style>
