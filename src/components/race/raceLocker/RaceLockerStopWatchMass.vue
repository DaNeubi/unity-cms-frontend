<template>
  <q-card>
    <q-card-section>
      <div class="row items-center justify-between">
        <div class="text-body1 col-auto">
          Massen-Start Stoppuhr
        </div>
        <div class="col-3">
          <div class="row items-center justify-end cursor-pointer">
            <q-icon name="mdi-window-maximize" size="md" class="col-auto" @click="maximizeWindow" color="secondary">
              <q-tooltip class="text-body2">
                Fenster anzeigen
              </q-tooltip>
            </q-icon>
            <q-icon name="mdi-window-minimize" size="md" class="col-auto" @click="minimizeWindow" color="secondary">
              <q-tooltip class="text-body2">
                Fenster verstecken
              </q-tooltip>
            </q-icon>
          </div>
        </div>
        <div class="text-body1 col-12">
          Ausgewählte Teilnehmer:
        </div>
      </div>
    </q-card-section>
    <q-slide-transition>
      <q-card-section>
        <div class="col-auto q-mt-sm">
          <div class="row items-center justify-center q-gutter-md">
            <q-btn push icon="mdi-play" label="Massenstart" class="col-auto" color="accent"
                   :disable="selectedParticipants === undefined || selectedParticipants.length < 1"
                   v-if="canCreateLaps" size="lg" @click="startAllTimers"/>
            <q-btn push icon="mdi-stop" label="Massenstop" class="col-auto" color="accent"
                   :disable="selectedParticipants === undefined || selectedParticipants.length < 1"
                   v-if="canCreateLaps && massStarted" size="lg" @click="stopAllTimers"/>
            <q-btn push icon="mdi-refresh" label="Massenreset" class="col-auto" color="accent"
                   :disable="selectedParticipants === undefined || selectedParticipants.length < 1"
                   v-else-if="canCreateLaps && !massStarted" size="lg" @click="resetAllTimers"/>
          </div>
        </div>
        <q-separator class="q-mt-sm q-mb-sm"/>
        <div class="row items-center justify-start q-gutter-sm" v-for="participant in selectedParticipants"
             :key="participant.id">
          {{ getParticipantFormat(participant) }} - {{ participantStates.find(ps => ps.participantId === participant.id)?.currentTime }}
          <q-btn push icon="mdi-play" label="Start" class="col-auto" :disable="participant.vehicle === null" size="md"
                 @click="startSingleTimer(participant)" color="accent" v-if="getIfStartButtonAvailable(participant)"/>
          <q-btn push icon="mdi-refresh" label="Reset" class="col-auto" v-else-if="!getIfStartButtonAvailable(participant)"
                 :disable="participant.vehicle === null || getIfStartButtonAvailable(participant)" size="md"
                 @click="resetSingleTimer(participant)" color="accent"/>
          <q-btn push icon="mdi-stop" label="Stop" class="col-auto"
                 :disable="participant.vehicle === null || getIfStartButtonAvailable(participant)" size="md"
                 @click="stopSingleTimer(participant)" color="accent"/>
          <q-btn push icon="mdi-car-cruise-control" label="Runde" size="md"
                 :disable="participant.vehicle === null || getIfStartButtonAvailable(participant)"
                 class="col-auto" color="primary" @click="createLap(participant)"/>
        </div>
        <div class="col-12 q-mt-md">
          <div class="row items-center justify-center">
            <q-select outlined label="Aktualisierungsintervall" class="col-4" :option-label="label => label + 'ms'"
                      v-model="selectedInterval" :options="refreshIntervals">
              <q-tooltip class="text-body2">
                OOC info:Je niedriger das Intervall, desto flüssiger werden die Millisekunden aktualisiert, dafür KANN die Belastung für deinen Rechner größer sein.
              </q-tooltip>
            </q-select>
          </div>
        </div>
      </q-card-section>
    </q-slide-transition>
  </q-card>
  {{ participantStates }}
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api } from 'boot/axios'
import IRaceParticipant from 'src/misc/interfaces/Race/IRaceParticipant'

const participantStates = ref<{ timerStart: number|undefined, currentTime: string|undefined, timerId: object|undefined, participantId: number }[]>([])
const selectedInterval = ref<number>(100)
const refreshIntervals = ref<number[]>([50, 100, 200, 250, 300, 400, 500, 750])
const runningParticipantLaps = ref<{ participantId: number }[]>([])
const massStarted = ref<boolean>(false)

const props = defineProps({
  companyId: {
    type: Number,
    required: true
  },
  raceId: {
    type: Number,
    required: true
  },
  canCreateLaps: {
    type: Boolean,
    required: true,
    default: false
  },
  selectedParticipants: {
    type: Array as () => IRaceParticipant[],
    required: true,
    default: [] as IRaceParticipant[]
  }
})

onMounted(() => {
  buildParticipantStates()
})

function buildParticipantStates () {
  if (props.selectedParticipants.length === 0) return
  props.selectedParticipants?.forEach((participant: IRaceParticipant) => {
    participantStates.value?.push({
      timerStart: undefined,
      currentTime: '00:00:00.000',
      timerId: undefined,
      participantId: participant.id
    })
  })
}
function getParticipantFormat (participant: IRaceParticipant | undefined): string {
  if (participant === undefined) return 'kein Teilnehmer gefunden...'
  let returnName = ''
  // user or person
  if (participant.user !== null && participant.user !== undefined) {
    returnName += participant.user?.first_name + ' ' + participant.user?.last_name
  }
  if (participant.person !== null && participant.person !== undefined) {
    returnName += participant.person?.first_name + ' ' + participant.person?.last_name
  }
  if (participant.vehicle !== null && participant.vehicle !== undefined) {
    returnName += ' ('
    if (participant.vehicle?.details !== undefined) {
      returnName += participant.vehicle?.details + ' '
    }
    if (participant.vehicle?.company_car !== null && participant.vehicle?.company_car !== undefined) {
      returnName += participant.vehicle?.company_car?.vehicle?.vehicle?.name
      returnName += ' ' + participant.vehicle?.company_car?.license_plate
    }
    returnName += ')'
  }
  return returnName
}
function startAllTimers () {
  // start all timers for all users
  const start = Date.now()
  participantStates.value?.forEach((participantState) => {
    participantState.timerStart = start
    runningParticipantLaps.value.push({ participantId: participantState.participantId })
    participantState.timerId = setInterval(() => {
      participantState.currentTime = new Date(Date.now() - (participantState.timerStart ??= 0)).toISOString().substring(11, 23)
    }, selectedInterval.value)
  })
  massStarted.value = true
}
function startSingleTimer (participant: IRaceParticipant) {
  // get the participantState
  const participantState = participantStates.value?.find((ps) => ps.participantId === participant.id)
  if (participantState === undefined) return
  runningParticipantLaps.value.push({ participantId: participant.id })
  participantState.timerStart = Date.now()
  participantState.timerId = setInterval(() => {
    participantState.currentTime = new Date(Date.now() - (participantState.timerStart ??= 0)).toISOString().substring(11, 23)
  }, selectedInterval.value)
}
function stopSingleTimer (participant: IRaceParticipant) {
  // get the participantState
  const participantState = participantStates.value?.find((ps) => ps.participantId === participant.id)
  if (participantState === undefined) return
  clearInterval(participantState.timerId as string | number | undefined)
  runningParticipantLaps.value = runningParticipantLaps.value.filter((rpl) => rpl.participantId !== participant.id)
}
function stopAllTimers () {
  participantStates.value?.forEach((participantState) => {
    clearInterval(participantState.timerId as string | number | undefined)
  })
  runningParticipantLaps.value = []
  massStarted.value = false
}
function resetSingleTimer (participant: IRaceParticipant) {
  // get the participantState
  const participantState = participantStates.value?.find((ps) => ps.participantId === participant.id)
  if (participantState === undefined) return
  clearInterval(participantState.timerId as string | number | undefined)
  participantState.timerStart = undefined
  participantState.currentTime = '00:00:00.000'
}
function resetAllTimers () {
  participantStates.value?.forEach((participantState) => {
    clearInterval(participantState.timerId as string | number | undefined)
    participantState.timerStart = undefined
    participantState.currentTime = '00:00:00.000'
  })
}
function getIfStartButtonAvailable (participant: IRaceParticipant) {
  return participantStates.value?.find((ps) => ps.participantId === participant.id)?.timerStart === undefined
}
function createLap (participant: IRaceParticipant) {
  // get the participantState
  const participantState = participantStates.value?.find((ps) => ps.participantId === participant.id)
  if (participantState === undefined) return
  const lapTime = participantState.currentTime
  clearInterval(participantState.timerId as string | number | undefined)
  // start the timer again for the participant
  startSingleTimer(participant)
  if (props.companyId === undefined || props.companyId <= 0) return
  if (props.raceId === undefined || props.raceId <= 0) return
  if (!props.canCreateLaps) return
  if (participant.vehicle === undefined) return
  api.post('/api/race/raceLocker/createLap/' + props.companyId, {
    race_id: props.raceId,
    race_vehicle_id: participant.vehicle?.id,
    lap_time: lapTime
  })
    .catch((err) => {
      console.error(err)
    })
}
</script>

<style scoped>

</style>
