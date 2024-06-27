<template>
  <div class="row" v-if="!loading">
    <div class="col-12 text-h3">
      {{ race?.name }} - {{ race?.location }}
    </div>
    <RaceLockerPublicOverview :race="race"  class="col-12" :reload="reloading"
                              v-if="race !== undefined"/>
  </div>
  <div v-else-if="loading && !raceDeleted">
    <q-spinner-clock size="15rem" color="primary" class="absolute-center"/>
  </div>
  <div v-else-if="loading && raceDeleted">
    <div class="column items-center absolute-center">
      <div class="text-h4 text-orange-7">
        Dieses Rennen wurde leider nicht gefunden
      </div>
      <q-img loading="lazy" src="images/racenotfound.webp"/>
      <div class="text-h6">
        Am bestenn einmal auf Home und die Seite aktualisieren
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted, onUnmounted, ref } from 'vue'
import { api } from 'boot/axios'
import IRace from 'src/misc/interfaces/Race/IRace'
import RaceLockerPublicOverview from 'components/race/raceLocker/RaceLockerPublicOverview.vue'
import laravelEcho from 'boot/laravelecho'
import IRaceLockerGeneralEvent from 'src/misc/interfaces/Race/IRaceLockerGeneralEvent'
import IRaceParticipant from 'src/misc/interfaces/Race/IRaceParticipant'
import IRaceVehicle from 'src/misc/interfaces/Race/IRaceVehicle'
import IRaceVehicleLap from 'src/misc/interfaces/Race/IRaceVehicleLap'

const router = useRouter()
const raceId = ref<number|string>(+router.currentRoute.value.params.raceId)
const race = ref<IRace|undefined>()
const loading = ref<boolean>(false)
const reloading = ref<boolean>(false)
const raceDeleted = ref<boolean>(false)

onMounted(() => {
  loadRaceInformation()
  joinUpdateChannel()
})

onUnmounted(() => {
  leaveUpdateChannel()
})

function joinUpdateChannel () {
  laravelEcho.join('race.public.general').listen('.race.public.general', (cb: IRaceLockerGeneralEvent) => {
    handleRaceLockerPublicEvent(cb)
  })
}

function leaveUpdateChannel () {
  laravelEcho.leave('race.public.general')
}

function loadRaceInformation () {
  if (typeof raceId.value !== 'number' || raceId.value <= 0) return
  if (!reloading.value) {
    loading.value = true
  }
  api.get('/api/publicRace/details?raceId=' + raceId.value)
    .then((response) => {
      if (Object.keys(response.data).length === 0) {
        raceDeleted.value = true
        loading.value = true
        return
      }
      race.value = response.data
      loading.value = false
      reloading.value = false
    })
    .catch((error) => {
      console.log(error)
    })
}

function handleRaceLockerPublicEvent (cb: IRaceLockerGeneralEvent|undefined) {
  if (cb === undefined) return
  if (cb.raceLockerGeneralInformation.creation) {
    addRaceLap(cb)
  } else if (cb.raceLockerGeneralInformation.delete && cb.raceLockerGeneralInformation.reload) {
    // race got deleted 😬
    raceDeleted.value = true
    loading.value = true
  } else if (cb.raceLockerGeneralInformation.delete) {
    removeRaceLap(cb)
  } else if (cb.raceLockerGeneralInformation.update) {
    updateRaceLaps(cb)
  } else if (cb.raceLockerGeneralInformation.reload) {
    reloading.value = true
    loadRaceInformation()
  }
}
function addRaceLap (cb: IRaceLockerGeneralEvent) {
  // add a race lap to a race participant
  if (cb.raceLockerGeneralInformation.intermediateRaceVehicleLap === undefined || cb.raceLockerGeneralInformation.intermediateRaceVehicleLap === null) return
  if (cb.raceLockerGeneralInformation.intermediateRaceParticipant === undefined || cb.raceLockerGeneralInformation.intermediateRaceParticipant === null) return
  const raceVehicle = race.value?.race_vehicles?.find((rv: IRaceVehicle) => rv.race_participant_id === cb.raceLockerGeneralInformation.intermediateRaceParticipant?.id)
  if (raceVehicle === undefined) return
  if (raceVehicle.laps === undefined) {
    raceVehicle.laps = [] as IRaceVehicleLap[]
  }
  raceVehicle.laps.push(cb.raceLockerGeneralInformation.intermediateRaceVehicleLap)
  const participant = race.value?.race_participants?.find((rp: IRaceParticipant) => rp.id === cb.raceLockerGeneralInformation.intermediateRaceParticipant?.id)
  if (participant === undefined) return
  participant.lap = cb.raceLockerGeneralInformation.intermediateRaceParticipant.lap
}
function removeRaceLap (cb: IRaceLockerGeneralEvent) {
  // remove a lap from a race participant
  if (cb.raceLockerGeneralInformation.intermediateRaceVehicleLap === undefined || cb.raceLockerGeneralInformation.intermediateRaceVehicleLap === null) return
  const raceVehicle = race.value?.race_vehicles?.find((rv: IRaceVehicle) => rv.race_participant_id === cb.raceLockerGeneralInformation.intermediateRaceParticipant?.id)
  if (raceVehicle === undefined) return
  if (raceVehicle.laps !== undefined) {
    const lapToRemoveIndex = raceVehicle.laps.findIndex((lap: IRaceVehicleLap) => lap.id === cb.raceLockerGeneralInformation.intermediateRaceVehicleLap?.id)
    if (lapToRemoveIndex >= 0) {
      raceVehicle.laps.splice(lapToRemoveIndex, 1)
    }
  }
  // update the participant lap
  if (cb.raceLockerGeneralInformation.intermediateRaceParticipant === undefined || cb.raceLockerGeneralInformation.intermediateRaceParticipant === null) return
  const participant = race.value?.race_participants?.find((rp: IRaceParticipant) => rp.id === cb.raceLockerGeneralInformation.intermediateRaceParticipant?.id)
  if (participant === undefined) return
  participant.lap = cb.raceLockerGeneralInformation.intermediateRaceParticipant.lap
}
function updateRaceLaps (cb: IRaceLockerGeneralEvent) {
  // update all laps of a race participant
  if (cb.raceLockerGeneralInformation.intermediateRaceParticipant === undefined || cb.raceLockerGeneralInformation.intermediateRaceParticipant === null) return
  const participant = race.value?.race_participants?.find((rp: IRaceParticipant) => rp.id === cb.raceLockerGeneralInformation.intermediateRaceParticipant?.id)
  if (participant === undefined) return
  participant.lap = cb.raceLockerGeneralInformation.intermediateRaceParticipant.lap
  if (cb.raceLockerGeneralInformation.intermediateRaceVehicleLaps === undefined || cb.raceLockerGeneralInformation.intermediateRaceVehicleLaps === null) return
  const raceVehicle = race.value?.race_vehicles?.find((rv: IRaceVehicle) => rv.race_participant_id === cb.raceLockerGeneralInformation.intermediateRaceParticipant?.id)
  if (raceVehicle === undefined) return
  raceVehicle.laps = [] as IRaceVehicleLap[]
  raceVehicle.laps = cb.raceLockerGeneralInformation.intermediateRaceVehicleLaps as IRaceVehicleLap[]
}

</script>

<style scoped>

</style>
