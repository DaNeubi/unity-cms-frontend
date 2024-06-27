<template>
  <div class="row q-gutter-md">
    <div class="col-3 self-start">
      <q-card>
        <q-card-section v-if="!reload">
          <div class="column">
            <div class="col-auto text-h4 self-center">
              Allgemeine Event Infos:
            </div>
            <div class="col-auto text-h6">
              Teilnehmer: {{ localRace?.race_participants?.length }} / {{ localRace?.participants }}
            </div>
            <div class="col-auto text-h6">
              Runden: {{ localRace?.laps }}
            </div>
            <div class="col-auto text-h6">
              Fahrzeuge:
            </div>
            <div class="col-12" v-if="localRace?.race_vehicles !== undefined">
              <div class="row items-center" v-for="vehicle in availableVehicles" :key="vehicle.id">
                <q-icon name="mdi-car-sports" size="md" class="q-mr-sm"/>
                {{ vehicle.company_car?.vehicle?.vehicle?.name }}
                {{ vehicle.details ? ' - ' +  vehicle.details : '' }}
                <q-icon name="mdi-car-emergency" size="md" color="accent" v-if="vehicle.safety_car">
                  <q-tooltip anchor="center end" self="center start" class="text-body2">
                    Safety Car
                  </q-tooltip>
                </q-icon>
                - {{ getParticipantByVehicle(vehicle) }}
              </div>
            </div>
          </div>
        </q-card-section>
        <q-card-section v-else>
          <div class="column q-gutter-md">
            <q-skeleton />
            <q-skeleton />
            <div class="row items-center" v-for="n in 3" :key="n">
              <q-skeleton type="circle"/>
              <q-skeleton class="col-lg q-ml-md"/>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-8 self-start">
      <q-card v-if="!reload">
        <q-card-section v-if="sortedRaceParticipants !== undefined">
          <div class="row items-center justify-center">
            <div class="col-12">
              <div class="row justify-center">
                <span class="text-h5">Aktuelle Platzierungen:</span>
              </div>
            </div>
            <div class="row col-12 justify-center items-center" :key="participant.id"
                 v-for="(participant, counter) in sortedRaceParticipants">
              <div class="col-auto text-body1">
                <q-icon name="mdi-trophy" :color="getTrophyColors(+counter)" size="md"
                        v-if="!participant.disqualified"/>
                <span v-if="!participant.disqualified">{{ counter + 1 }}.</span>
                <span :class="`${ participant.disqualified ? 'text-strike' : '' }`">
                  {{ getParticipantName(participant) }}
                </span>
                <span v-if="!participant.disqualified">
                  ({{ participant.lap }} / {{ race.laps }}) Runden
                </span>
                <q-icon name="mdi-flag-checkered" size="md" v-if="participant.finished"/>
                <q-icon name="mdi-trophy-broken" size="md" v-if="participant.disqualified"/>
                <q-tooltip anchor="center start" self="center end" class="text-body2" v-if="participant.disqualified">
                  Wurde disqualifiert.
                </q-tooltip>
                <q-tooltip anchor="center start" self="center end" class="text-body2" v-if="participant.finished">
                  Rennen abgeschlossen.
                </q-tooltip>
              </div>
            </div>
          </div>
        </q-card-section>
        <q-card-section v-if="fastestLaps !== undefined">
          <div class="column">
            <div class="col-auto self-center text-h5">
              Schnellste Runde:
            </div>
            <div class="col-auto self-center text-body1" v-for="fastLap in fastestLaps" :key="fastLap.id">
              <q-icon name="mdi-timer" size="md"/>
              {{ getParticipantName(fastLap.participant) }} - {{ GetDurationFromMilliseconds(fastLap.lap?.duration) }} - Runde {{ fastLap.lap?.lap }}
            </div>
          </div>
        </q-card-section>

      </q-card>
      <q-card v-else>
        <q-card-section>
          <div class="column q-gutter-md">
            <q-skeleton/>
            <q-skeleton/>
            <q-skeleton/>
            <q-skeleton/>
            <q-skeleton/>
            <q-skeleton/>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import IRaceParticipant from 'src/misc/interfaces/Race/IRaceParticipant'
import { computed, ref, watch } from 'vue'
import IRace from 'src/misc/interfaces/Race/IRace'
import IRaceVehicle from 'src/misc/interfaces/Race/IRaceVehicle'
import IRaceVehicleLap from 'src/misc/interfaces/Race/IRaceVehicleLap'
import GetDurationFromMilliseconds from 'src/misc/functions/race/CalculateTime'

const props = defineProps({
  race: {
    type: Object as () => IRace | undefined,
    required: true,
    default: undefined
  },
  reload: {
    type: Boolean,
    required: true,
    default: false
  }
})

watch(() => props.race, () => {
  localRace.value = props.race
})

const localRace = ref<IRace|undefined>(props.race)

const sortedRaceParticipants = computed(() => {
  const tempRace = localRace.value
  return tempRace?.race_participants?.sort((a, b) => {
    if (a.finished && !b.finished) {
      return -1
    } else if (!a.finished && b.finished) {
      return 1
    } else if (a.finished && b.finished) {
      if (a.vehicle?.laps !== undefined && b.vehicle?.laps !== undefined) {
        if (a.vehicle.laps.length > b.vehicle.laps.length) {
          return -1
        } else if (a.vehicle.laps.length < b.vehicle.laps.length) {
          return 1
        } else if (a.vehicle.laps[a.vehicle.laps.length - 1].duration < b.vehicle.laps[b.vehicle.laps.length - 1].duration) {
          return -1
        } else {
          return 0
        }
      } else {
        return 0
      }
    } else {
      return 0
    }
  })
})
const fastestLaps = computed(() => {
  // return the lap with the lowest duration
  const fastestLaps: IRaceVehicleLap[] = []
  let fastestLapsTime = 0
  localRace.value?.race_vehicles?.forEach((vehicle: IRaceVehicle) => {
    vehicle.laps?.forEach((lap: IRaceVehicleLap) => {
      if (fastestLaps.length === 0) {
        fastestLaps.push(lap)
        fastestLapsTime = lap.duration
      }
      if (lap.duration < fastestLapsTime) {
        // remove all other laps
        fastestLaps.splice(0, fastestLaps.length)
        // push the new lap
        fastestLapsTime = lap.duration
        fastestLaps.push(lap)
      } else if (lap.duration === fastestLapsTime) {
        // append the lap
        fastestLaps.push(lap)
      }
    })
  })
  // get the participant and the vehicle to the lap
  const dataObj: { participant: IRaceParticipant | undefined, vehicle: IRaceVehicle | undefined, lap: IRaceVehicleLap | undefined, fastestLap: number }[] = []
  fastestLaps.forEach((currLap: IRaceVehicleLap) => {
    const currVehicle = localRace.value?.race_vehicles?.find((veh: IRaceVehicle) => veh.id === currLap.race_vehicle_id)
    const particip = localRace.value?.race_participants?.find((p: IRaceParticipant) => p.id === currVehicle?.race_participant_id)
    dataObj.push({
      participant: particip,
      vehicle: currVehicle,
      lap: currLap,
      fastestLap: currLap.id
    })
  })
  return dataObj
})
const availableVehicles = computed(() => {
  return localRace.value?.race_vehicles?.filter((rv: IRaceVehicle) => rv.race_participant_id !== null || rv.safety_car)
})

function getParticipantName (participant: IRaceParticipant | undefined): string {
  if (participant === undefined) return 'Nicht gefunden'
  if (participant.user !== null && participant.user !== undefined) {
    return participant.user.first_name + ' ' + participant.user.last_name
  } else if (participant.person !== null && participant.person !== undefined) {
    return participant.person.first_name + ' ' + participant.person.last_name
  } else {
    return 'Unbekannt'
  }
}
function getParticipantByVehicle (vehicle: IRaceVehicle | undefined): string {
  if (vehicle === undefined) return 'Nicht gefunden'
  const participant = localRace.value?.race_participants?.find((rp: IRaceParticipant) => rp.id === vehicle.race_participant_id)
  if (participant === undefined) return 'Nicht gefunden'
  return getParticipantName(participant)
}
function getTrophyColors (counter: number): string {
  switch (counter) {
    case 0:
      return 'yellow-7'
    case 1:
      return 'grey-6'
    case 2:
      return 'amber-9'
    case 3:
      return 'text-grey-8'
    default:
      return 'text-grey-8'
  }
}
</script>

<style scoped>

</style>
