<template>
  <q-card>
    <q-card-section>
      <div class="row items-center justify-between">
        <div class="text-body1 col-auto">
          Stoppuhr
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
          Ausgewählter Teilnehmer: {{ getParticipantFormat(selectedParticipant) }}
        </div>
      </div>
    </q-card-section>
    <q-slide-transition>
      <q-card-section v-show="visible">
        <div class="row items-center justify-center">
          <div class="col-12">
            <div class="row items-center justify-center">
              <div class="text-h2">
                {{ currentTime }}
              </div>
            </div>
          </div>
          <div class="col-auto q-mt-sm">
            <div class="row items-center justify-center q-gutter-md">
              <q-btn push icon="mdi-play" label="Start" class="col-auto" :disable="selectedParticipant === undefined || selectedParticipant?.vehicle === null"
                     color="accent" v-if="timerStart === undefined && canCreateLaps" @click="startTimer" size="lg"/>
              <q-btn push icon="mdi-refresh" label="Reset" class="col-auto" :disable="selectedParticipant === undefined || selectedParticipant?.vehicle === null"
                     color="accent" v-else-if="timerStart !== undefined && canCreateLaps" @click="resetTimer" size="lg"/>
              <q-btn push icon="mdi-stop" label="Stop" class="col-auto" :disable="selectedParticipant === undefined || selectedParticipant?.vehicle === null"
                     color="accent" @click="stopTimer" v-if="canCreateLaps" size="lg"/>
              <q-btn push icon="mdi-car-cruise-control" label="Runde" size="lg"
                     v-if="canCreateLaps"
                     :disable="selectedParticipant === undefined || timerStart === undefined"
                     class="col-auto" color="primary" @click="createLap"/>
            </div>
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
        </div>
      </q-card-section>
    </q-slide-transition>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api } from 'boot/axios'
import IRaceParticipant from 'src/misc/interfaces/Race/IRaceParticipant'

const timerStart = ref<number|undefined>(undefined)
const currentTime = ref<string|undefined>('00:00:00.000')
const timerId = ref()
const selectedInterval = ref<number>(100)
const refreshIntervals = ref<number[]>([10, 25, 50, 100, 200, 250, 300, 400, 500, 750])
const visible = ref<boolean>(true)

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
  selectedParticipant: {
    type: Object as () => IRaceParticipant,
    required: false,
    default: undefined
  }
})

function startTimer () {
  timerStart.value = Date.now()
  timerId.value = setInterval(() => {
    currentTime.value = new Date(Date.now() - (timerStart.value ??= 0)).toISOString().substring(11, 23)
  }, selectedInterval.value)
}
function stopTimer () {
  clearInterval(timerId.value)
}
function resetTimer () {
  clearInterval(timerId.value)
  timerStart.value = undefined
  currentTime.value = '00:00:00.000'
}
function createLap () {
  // get the timers time
  const lapTime = currentTime.value
  clearInterval(timerId.value)
  // start the timer again
  startTimer()
  if (props.companyId === undefined || props.companyId <= 0) return
  if (props.raceId === undefined || props.raceId <= 0) return
  if (props.selectedParticipant === undefined) return
  if (props.selectedParticipant.vehicle === undefined) return
  // send the lap time to the server
  api.post('/api/race/raceLocker/createLap/' + props.companyId, {
    race_id: props.raceId,
    race_vehicle_id: props.selectedParticipant?.vehicle?.id,
    lap_time: lapTime
  })
    .catch((err) => {
      console.error(err)
    })
}
function minimizeWindow () {
  visible.value = false
}
function maximizeWindow () {
  visible.value = true
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
</script>

<style scoped>

</style>
