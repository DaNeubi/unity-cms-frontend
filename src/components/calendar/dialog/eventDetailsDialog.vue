<template>
  <q-dialog ref="dialogRef"
            transition-show="scale"
            transition-hide="scale"
            :persistent="false">
    <q-card>
      <q-card-section>
        <div class="row full-width">
          <span class="text-italic col-12">
            Start: {{ formatDateToGerman(props.event.date) }}
          </span>
          <span class="text-italic col-12">
            Ende: {{ getEndDate(props.event.date, props.event.duration) }}
          </span>
          <p class="with-breaks col-12 q-mt-sm">
            {{ props.event.details }}
          </p>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { date, useDialogPluginComponent } from 'quasar'
import ICalendarEvent from 'src/misc/interfaces/Calendar/ICalendarEvent'

defineEmits([
  ...useDialogPluginComponent.emits
])
const props = defineProps({
  event: Object as () => ICalendarEvent
})

const { dialogRef } = useDialogPluginComponent()

function formatDateToGerman (startDate: string) {
  return date.formatDate(startDate, 'DD.MM.YYYY HH:mm')
}
function getEndDate (startDate: string, duration: string) {
  const hours = parseInt(duration.split(':')[0])
  const minutes = parseInt(duration.split(':')[1])
  const endDate = date.addToDate(startDate, { hours, minutes })
  return date.formatDate(endDate, 'DD.MM.YYYY HH:mm')
}
</script>

<style scoped>
p.with-breaks {
  white-space: pre-wrap;
}
</style>
