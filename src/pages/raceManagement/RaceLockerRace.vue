<template>
  <div class="row q-gutter-md">
    <div class="col-7 self-start">
      <RaceLockerOverview :company-id="companyId" :race-id="raceId" :race-participants="raceParticipants"
                          :can-manage-race-participants="canManageRaceParticipants"
                          class="" @delete-lap="args => deleteSelectedLap(args)"
                          @participant-updated="(participant) => selectedParticipant = participant"
                          @disqualify-toggle-participant="(args)=> toggleParticipantDisqualified(args.disqualified, args.participant)"
                          @back-to-race-selection1="$emit('backToRaceSelection')"
                          @mass-select-add="(participant) => addParticipantToMassStart(participant)"
                          @mass-select-remove="(participant) => removeParticipantFromMassStart(participant)"
                          @mass-state-changed="(state) => massStart = state"/>
    </div>
    <div class="col-auto">
      <div class="column q-gutter-md">
        <RaceLockerStopwatch :company-id="companyId" :race-id="raceId" v-if="!massStart"
                             :can-create-laps="canCreateLaps" :selected-participant="selectedParticipant"/>
        <RaceLockerStopWatchMass :company-id="companyId" :race-id="raceId" v-if="massStart"
                                 :can-create-laps="canCreateLaps" :selected-participants="selectedParticipants"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RaceLockerStopwatch from 'components/race/raceLocker/RaceLockerStopwatch.vue'
import RaceLockerOverview from 'components/race/raceLocker/RaceLockerOverview.vue'
import { defineProps, defineEmits, ref, onMounted, watch, onUnmounted } from 'vue'
import IRaceParticipant from 'src/misc/interfaces/Race/IRaceParticipant'
import { api } from 'boot/axios'
import IRaceVehicleLap from 'src/misc/interfaces/Race/IRaceVehicleLap'
import laravelEcho from 'boot/laravelecho'
import IRaceLockerGeneralEvent from 'src/misc/interfaces/Race/IRaceLockerGeneralEvent'
import RaceLockerStopWatchMass from 'components/race/raceLocker/RaceLockerStopWatchMass.vue'

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
  canManageRaceParticipants: {
    type: Boolean,
    required: true,
    default: false
  }
})

defineEmits(['backToRaceSelection'])

const raceParticipants = ref<IRaceParticipant[]>()
const selectedParticipant = ref<IRaceParticipant>()
const selectedParticipants = ref<IRaceParticipant[]>([])
const massStart = ref<boolean>(false)

onMounted(() => {
  joinRaceLockerEventChannel()
  getAvailableRaceParticipants()
})

onUnmounted(() => {
  leaveRaceLockerEventChannel()
})

watch(() => props.companyId, () => {
  getAvailableRaceParticipants()
  leaveRaceLockerEventChannel()
  joinRaceLockerEventChannel()
})

function getAvailableRaceParticipants () {
  if (props.companyId === undefined || props.companyId <= 0) return
  if (props.raceId === undefined || props.raceId <= 0) return
  api.get('/api/race/raceLocker/all/' + props.companyId + '?race_id=' + props.raceId)
    .then((res) => {
      raceParticipants.value = res.data
    })
    .catch((err) => {
      console.error(err)
    })
}
function joinRaceLockerEventChannel () {
  if (props.companyId === undefined || props.companyId <= 0) return
  laravelEcho.join('race.raceLocker.general.' + props.companyId)
    .listen('.race.raceLocker.general', (cb: IRaceLockerGeneralEvent) => {
      handleRaceLockerEvent(cb)
    })
}
function leaveRaceLockerEventChannel () {
  if (props.companyId === undefined || props.companyId <= 0) return
  laravelEcho.leave('raceLocker.general.' + props.companyId)
}
function deleteSelectedLap (lapToDelete: IRaceVehicleLap | undefined) {
  if (lapToDelete === undefined) return
  api.delete('/api/race/raceLocker/deleteLap/' + props.companyId + '?lap_id=' + lapToDelete.id + '&race_id=' + props.raceId)
    .catch((err) => {
      console.error(err)
    })
}
function toggleParticipantDisqualified (disq: boolean | number, participant?: IRaceParticipant) {
  if (participant === undefined) return
  if (props.companyId === undefined || props.companyId <= 0) return
  api.patch('/api/race/raceLocker/updateParticipantDisqualified/' + props.companyId, {
    participant_id: participant.id,
    disqualified: disq,
    race_id: props.raceId
  })
}
function handleRaceLockerEvent (cb: IRaceLockerGeneralEvent|undefined) {
  if (cb === undefined) return
  if (cb.raceLockerGeneralInformation.creation) {
    addRaceLap(cb)
  } else if (cb.raceLockerGeneralInformation.delete) {
    removeRaceLap(cb)
  } else if (cb.raceLockerGeneralInformation.update) {
    updateRaceLaps(cb)
  }
}
function addRaceLap (cb: IRaceLockerGeneralEvent) {
  // add the lap to the raceParticipant
  if (cb.raceLockerGeneralInformation.intermediateRaceVehicleLap === undefined || cb.raceLockerGeneralInformation.intermediateRaceVehicleLap === null) return
  if (cb.raceLockerGeneralInformation.intermediateRaceParticipant === undefined || cb.raceLockerGeneralInformation.intermediateRaceParticipant === null) return
  const participant = raceParticipants.value?.find((rp: IRaceParticipant) => rp.id === cb.raceLockerGeneralInformation.intermediateRaceParticipant?.id)
  if (participant === undefined) return
  if (participant.vehicle === null || participant.vehicle === undefined) return
  if (participant.vehicle.laps === undefined || participant.vehicle.laps === null) {
    participant.vehicle.laps = [] as IRaceVehicleLap[]
  }
  participant.vehicle?.laps?.push(cb.raceLockerGeneralInformation.intermediateRaceVehicleLap)
  if (participant.vehicle.laps === undefined || participant.vehicle.laps === null) return
  participant.lap = cb.raceLockerGeneralInformation.intermediateRaceParticipant.lap
}
function removeRaceLap (cb: IRaceLockerGeneralEvent) {
  // remove the lap from the raceParticipant
  if (cb.raceLockerGeneralInformation.intermediateRaceVehicleLap === undefined || cb.raceLockerGeneralInformation.intermediateRaceVehicleLap === null) return
  if (cb.raceLockerGeneralInformation.intermediateRaceParticipant === undefined || cb.raceLockerGeneralInformation.intermediateRaceParticipant === null) return
  const participant = raceParticipants.value?.find((rp: IRaceParticipant) => rp.id === cb.raceLockerGeneralInformation.intermediateRaceParticipant?.id)
  if (participant === undefined) return
  participant.lap = cb.raceLockerGeneralInformation.intermediateRaceParticipant.lap
  if (participant.vehicle === null || participant.vehicle === undefined) return
  if (participant.vehicle.laps === undefined || participant.vehicle.laps === null) return
  const lapIndex = participant.vehicle.laps.findIndex((lap: IRaceVehicleLap) => lap.id === cb.raceLockerGeneralInformation.intermediateRaceVehicleLap?.id)
  if (lapIndex < 0) return
  participant.vehicle.laps.splice(lapIndex, 1)
}
function updateRaceLaps (cb: IRaceLockerGeneralEvent) {
  // update all laps of the raceParticipant
  if (cb.raceLockerGeneralInformation.intermediateRaceParticipant === undefined || cb.raceLockerGeneralInformation.intermediateRaceParticipant === null) return
  const participant = raceParticipants.value?.find((rp: IRaceParticipant) => rp.id === cb.raceLockerGeneralInformation.intermediateRaceParticipant?.id)
  if (participant === undefined) return
  // update the participants status
  participant.disqualified = cb.raceLockerGeneralInformation.intermediateRaceParticipant.disqualified ? 1 : 0
  if (cb.raceLockerGeneralInformation.intermediateRaceVehicleLaps === undefined || cb.raceLockerGeneralInformation.intermediateRaceVehicleLaps === null) return
  participant.lap = cb.raceLockerGeneralInformation.intermediateRaceParticipant.lap
  if (participant.vehicle === null || participant.vehicle === undefined) return
  // reset the laps
  participant.vehicle.laps = [] as IRaceVehicleLap[]
  participant.vehicle.laps = cb.raceLockerGeneralInformation.intermediateRaceVehicleLaps as IRaceVehicleLap[]
}
function addParticipantToMassStart (participant: IRaceParticipant) {
  // check if the participant is already in the list
  const currentParticipant = raceParticipants.value?.find((rp: IRaceParticipant) => rp.id === participant.id)
  if (currentParticipant === undefined) return
  if (selectedParticipants.value.find((p: IRaceParticipant) => p.id === participant.id) !== undefined) return
  selectedParticipants.value.push(currentParticipant)
}
function removeParticipantFromMassStart (participant: IRaceParticipant) {
  const index = selectedParticipants.value?.findIndex((p: IRaceParticipant) => p.id === participant.id)
  if (index === undefined || index < 0) return
  selectedParticipants.value.splice(index, 1)
}
</script>

<style scoped>

</style>
