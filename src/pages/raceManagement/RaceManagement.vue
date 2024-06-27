<template>
  <div class="row">
    <RaceListComponent class="col-12" :company-id="companyId" :can-delete-race="canDeleteRace"
                       :can-create-race="canCreateRace" :can-edit-race="canEditRace"
                       ref="raceListComponent"
                       :can-make-race-public="canMakeRacePublic" :can-manage-race-vehicles="canManageRaceVehicles"
                       :can-manage-race-participants="canManageRaceParticipants"/>
  </div>
</template>

<script setup lang="ts">

import { computed, onMounted, ref, watch } from 'vue'
import { companyStore } from 'stores/companyStore'
import { api } from 'boot/axios'
import AssignPolicies from 'src/misc/functions/policies/Policies'
import RaceListComponent from 'components/race/RaceListComponent.vue'
import laravelEcho from 'boot/laravelecho'
import { useUserStore } from 'stores/useUserStore'

const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
const userStore = useUserStore()
const userId = computed(() => userStore.userId)
const canCreateRace = ref<boolean>(false)
const canEditRace = ref<boolean>(false)
const canDeleteRace = ref<boolean>(false)
const canMakeRacePublic = ref<boolean>(false)
const canManageRaceParticipants = ref<boolean>(false)
const canManageRaceVehicles = ref<boolean>(false)
const raceListComponent = ref()

onMounted(() => {
  getPolicies()
  joinReloadChannel()
})

watch(companyId, () => {
  getPolicies()
})

function getPolicies () {
  if (companyId.value <= 0) return
  api.get('/api/policies/race/raceManagement/' + +companyId.value)
    .then((res) => {
      AssignPolicies([
        { policyName: 'RaceManagement_Race_Create', policyToAssign: canCreateRace },
        { policyName: 'RaceManagement_Race_Edit', policyToAssign: canEditRace },
        { policyName: 'RaceManagement_Race_Delete', policyToAssign: canDeleteRace },
        { policyName: 'RaceManagement_Race_Make_Public', policyToAssign: canMakeRacePublic },
        { policyName: 'RaceManagement_Race_Manage_Participant', policyToAssign: canManageRaceParticipants },
        { policyName: 'RaceManagement_Race_Manage_Vehicles', policyToAssign: canManageRaceVehicles }
      ], res.data.racePolicies)
    })
    .catch((err) => {
      console.error(err)
    })
}

function joinReloadChannel () {
  if (userId.value <= 0) return
  laravelEcho.private('user.reload.' + userId.value)
    .listen('.user.reload', (userNotification: { userNotification: { type: number } }) => {
      if (userNotification.userNotification.type === 3) {
        raceListComponent.value?.handleReloadEvent()
      }
    })
}

</script>

<style scoped>

</style>
