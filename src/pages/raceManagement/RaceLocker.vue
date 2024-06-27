<template>
  <div class="row items-center justify-center" v-if="selectedRace === null || selectedRace === undefined">
    <q-select v-model="selectedRace" :options="availableOptionRaces" class="col-8"
              @filter="filterRaces" use-input clearable
              :option-label="opt => opt.name + ' (' + FormatDateTime(opt.date, true) + ')'"
              outlined label="Rennen auswählen"/>
  </div>
  <RaceLockerRace v-else :company-id="companyId" :race-id="selectedRace.id" :can-manage-race-participants="canManageRaceParticipants"
                  @back-to-race-selection="resetSelectedRace" :can-create-laps="canCreateLaps"/>
</template>

<script setup lang="ts">
import RaceLockerRace from 'pages/raceManagement/RaceLockerRace.vue'
import { computed, onMounted, ref, watch } from 'vue'
import IRace from 'src/misc/interfaces/Race/IRace'
import { companyStore } from 'stores/companyStore'
import { api } from 'boot/axios'
import FormatDateTime from 'src/misc/functions/FormatDateTime'
import AssignPolicies from 'src/misc/functions/policies/Policies'

const availableRaces = ref<IRace[]>()
const availableOptionRaces = ref<IRace[]>()
const selectedRace = ref<IRace>()
const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
const canCreateLaps = ref<boolean>(false)
const canManageRaceParticipants = ref<boolean>(false)

onMounted(() => {
  getPolicies()
  getAvailableRaces()
})

watch(() => companyId.value, () => {
  getPolicies()
  getAvailableRaces()
})

function getAvailableRaces (needle?: string) {
  if (companyId.value <= 0) return
  api.get('/api/race/raceLocker/selection/' + companyId.value)
    .then((res) => {
      availableRaces.value = res.data
      if (needle !== undefined) {
        const needleLower = needle.toLowerCase()
        availableOptionRaces.value = availableRaces.value?.filter((v) => v.name.toLowerCase().indexOf(needleLower) > -1)
      }
    })
    .catch((err) => {
      console.error(err)
    })
}
function getPolicies () {
  if (companyId.value <= 0) return
  api.get('/api/policies/race/raceLocker/' + companyId.value)
    .then((res) => {
      AssignPolicies([
        { policyName: 'RaceManagement_Racelocker_CreateLap', policyToAssign: canCreateLaps },
        { policyName: 'RaceManagement_Racelocker_Participant_Status', policyToAssign: canManageRaceParticipants }
      ], res.data.raceLockerPolicies)
    })
    .catch((err) => {
      console.error(err)
    })
}
function filterRaces (val: string, update: (val: () => void) => void) {
  if (availableRaces.value !== undefined) {
    update(() => {
      const needle = val.toLowerCase()
      availableOptionRaces.value = availableRaces.value?.filter((v) => v.name.toLowerCase().indexOf(needle) > -1)
    })
  }
  getAvailableRaces(val)
}
function resetSelectedRace () {
  selectedRace.value = undefined
  // reload the races from the server
  getAvailableRaces()
}
</script>

<style scoped>

</style>
