<template>
  <div class="full-width full-height">
    <div class="row full-height">
      <create-something-new-button text="Neues Event erstellen"
                                   @create-something-new="createNewEvent()"
                                   class="q-mt-sm q-mb-md"/>
      <calendar-view-component class="col-12 full-height" :company-id="companyId" @delete-event="val => deleteEvent(val)"
                               @edit-event="val => modifyEvent(val, false)" ref="calendarView"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import ICalendarEvent from 'src/misc/interfaces/Calendar/ICalendarEvent'
import { api } from 'boot/axios'
import { companyStore } from 'stores/companyStore'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import modifyCalendarEventDialog from 'components/calendar/dialog/modifyCalendarEventDialog.vue'
import { date, useQuasar } from 'quasar'
import CalendarViewComponent from 'components/calendar/calendarViewComponent.vue'
import laravelEcho from 'boot/laravelecho'
import { useUserStore } from 'stores/useUserStore'

const $q = useQuasar()
const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
const userStore = useUserStore()
const userId = computed(() => userStore.userId)
const calendarView = ref()

onMounted(() => {
  joinReloadChannel()
})

onUnmounted(() => {
  leaveReloadChannel()
})

function joinReloadChannel () {
  if (userId.value < 0) return
  // listen to the change event
  laravelEcho.private('user.reload.' + userId.value)
    .listen('.user.reload', () => {
      // reload the events
      calendarView.value.reloadEventsForDuration()
    })
}
function leaveReloadChannel () {
  // stop listening to the change event
  laravelEcho.leave('user.reload.' + userId.value)
}
function saveNewEvent (event?: ICalendarEvent) {
  if (event === undefined || companyId.value < 0) return
  api.post('/api/calendar/create/' + companyId.value, event)
    .then(() => {
      calendarView.value.reloadEventsForDuration()
    })
    .catch((err) => {
      console.error(err)
    })
}
function editEvent (event?: ICalendarEvent) {
  if (event === undefined || companyId.value < 0) return
  api.patch('/api/calendar/edit/' + companyId.value, event)
    .then(() => {
      calendarView.value.reloadEventsForDuration()
    })
    .catch((err) => {
      console.error(err)
    })
}
function deleteEvent (event?: ICalendarEvent) {
  if (event === undefined || companyId.value < 0) return
  api.post('/api/calendar/delete/' + companyId.value, event)
    .then(() => {
      calendarView.value.reloadEventsForDuration()
    })
    .catch((err) => {
      console.error(err)
    })
}
function createNewEvent () {
  const blankEvent = {
    id: Math.random(),
    title: '',
    details: '',
    date: date.formatDate(new Date(), 'YYYY-MM-DD HH:mm'),
    duration: 0,
    bgColor: '',
    textColor: '',
    location: '',
    shortDetails: '',
    shortDetailsDetails: false
  } as ICalendarEvent
  modifyEvent(blankEvent, true)
}
function modifyEvent (currentEvent: ICalendarEvent, creatingStatus: boolean) {
  $q.dialog({
    component: modifyCalendarEventDialog,
    componentProps: {
      calendarEvent: currentEvent,
      creating: creatingStatus
    }
  }).onOk((cbEvent?: ICalendarEvent) => {
    if (cbEvent === undefined) return
    if (creatingStatus) {
      saveNewEvent(cbEvent)
    } else {
      editEvent(cbEvent)
    }
  })
}
</script>

<style scoped>

</style>
