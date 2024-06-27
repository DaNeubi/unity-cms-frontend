<template>
  <div class="row q-gutter-md">
    <div class="col-12 row items-baseline">
      <tax-max-radio-component class="col-auto" :company-id="companyId" ref="taxMaxRadioComponentRef"
                               :can-change-radio="canChangeRadio"/>
    </div>
    <tax-max-driver-overview-component class="col-11" :company-id="companyId" :can-join-car-self="canJoinCarSelf"
                                       :user-id="userId" ref="taxMaxDriverOverviewComponentRef"
                                       :can-join-car-all="canJoinCarAll" :company-members="allAvailableCompanyMembers"/>
    <tax-max-drive-log-book-component  :can-claim-ride="canClaimRide" :can-delete-ride="canDeleteRide" class="col-11"
                                       :can-add-ride="canAddRide" :user-id="userId" :company-id="companyId"
                                       ref="taxMaxDriveLogBookComponentRef"/>
  </div>
</template>

<script setup lang="ts">
import { api } from 'boot/axios'
import { companyStore } from 'stores/companyStore'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import AssignPolicies from 'src/misc/functions/policies/Policies'
import TaxMaxRadioComponent from 'components/taxmax/taxMaxRadioComponent.vue'
import TaxMaxDriverOverviewComponent from 'components/taxmax/taxMaxDriverOverviewComponent.vue'
import User from 'src/misc/classes/User/User'
import { useUserStore } from 'stores/useUserStore'
import TaxMaxDriveLogBookComponent from 'components/taxmax/taxMaxDriveLogBookComponent.vue'
import laravelEcho from 'boot/laravelecho'
import ITaxMaxChangedEvent from 'src/misc/interfaces/TaxMax/ITaxMaxChangedEvent'

const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
const userStore = useUserStore()
const userId = computed(() => userStore.userId)
const loading = ref<boolean>(false)
const canChangeRadio = ref<boolean>(false)
const canJoinCarSelf = ref<boolean>(false)
const canJoinCarAll = ref<boolean>(false)
const canChangeCarStatusSelf = ref<boolean>(false)
const canChangeCarStatusAll = ref<boolean>(false)
const canAddRide = ref<boolean>(false)
const canClaimRide = ref<boolean>(false)
const canDeleteRide = ref<boolean>(false)
const allAvailableCompanyMembers = ref<User[]>()
const taxMaxDriverOverviewComponentRef = ref()
const taxMaxRadioComponentRef = ref()
const taxMaxDriveLogBookComponentRef = ref()

onMounted(() => {
  getPolicies()
  joinTaxMaxChannel()
})

onUnmounted(() => {
  laravelEcho.leave('taxmax.update.' + companyId.value)
})

watch(() => companyId.value, () => {
  getPolicies()
  joinTaxMaxChannel()
})

function getPolicies () {
  api.get('/api/policies/taxmax/' + companyId.value)
    .then((res) => {
      AssignPolicies([
        { policyName: 'TaxMax_Change_Radio', policyToAssign: canChangeRadio },
        { policyName: 'TaxMax_Join_Self_Car', policyToAssign: canJoinCarSelf },
        { policyName: 'TaxMax_Join_All_Car', policyToAssign: canJoinCarAll },
        { policyName: 'TaxMax_Change_Self_Car_Status', policyToAssign: canChangeCarStatusSelf },
        { policyName: 'TaxMax_Change_All_Car_Status', policyToAssign: canChangeCarStatusAll },
        { policyName: 'TaxMax_Add_Ride', policyToAssign: canAddRide },
        { policyName: 'TaxMax_Claim_Ride', policyToAssign: canClaimRide },
        { policyName: 'TaxMax_Delete_Ride', policyToAssign: canDeleteRide }
      ], res.data)
      loading.value = false
      getAllCompanyMembers()
    })
    .catch((err) => {
      console.error(err)
    })
}
function joinTaxMaxChannel () {
  if (companyId.value <= 0) return
  laravelEcho.join('taxmax.update.' + companyId.value)
    .listen('.taxmax.update', (cb: { taxMaxChangedEvent: ITaxMaxChangedEvent }) => {
      // check if the radio has been changed
      if (cb.taxMaxChangedEvent?.changedRadio !== null && cb.taxMaxChangedEvent?.changedRadio !== undefined) {
        // update the radio
        taxMaxRadioComponentRef.value?.updateRadioFromEvent(cb.taxMaxChangedEvent.changedRadio)
      }
      // check if the car has been changed
      if (cb.taxMaxChangedEvent?.changedCar !== null && cb.taxMaxChangedEvent?.changedCar !== undefined) {
        // update or insert the car
        taxMaxDriverOverviewComponentRef.value?.eventUpdateCompanyCar(cb.taxMaxChangedEvent.changedCar)
      }
      // check if a driver has been removed from a car
      if (cb.taxMaxChangedEvent?.removedDriver !== null && cb.taxMaxChangedEvent?.removedDriver !== undefined) {
        // remove the driver from the car
        taxMaxDriverOverviewComponentRef.value?.eventRemoveDriver(cb.taxMaxChangedEvent.removedDriver)
      }
      // check if a drive log has been changed
      if (cb.taxMaxChangedEvent?.updatedDriveLogBook !== null &&
        cb.taxMaxChangedEvent?.updatedDriveLogBook !== undefined) {
        // update or insert the drive log
        taxMaxDriveLogBookComponentRef.value?.eventUpdateDriveLog(cb.taxMaxChangedEvent.updatedDriveLogBook)
      }
      // check if a drive log has been removed
      if (cb.taxMaxChangedEvent?.deletedDriveLogBook !== null &&
        cb.taxMaxChangedEvent?.deletedDriveLogBook !== undefined) {
        // remove the drive log
        taxMaxDriveLogBookComponentRef.value?.eventRemoveDriveLog(cb.taxMaxChangedEvent.deletedDriveLogBook)
      }
      // check if car has been removed
      if (cb.taxMaxChangedEvent?.removedCar !== null && cb.taxMaxChangedEvent?.removedCar !== undefined) {
        // remove the car
        taxMaxDriverOverviewComponentRef.value?.eventRemoveCar(cb.taxMaxChangedEvent.removedCar)
        taxMaxDriveLogBookComponentRef.value?.eventRemoveCar(cb.taxMaxChangedEvent.removedCar)
      }
    })
}
function getAllCompanyMembers () {
  if (companyId.value <= 0) return
  // only call if the user has canJoinCarSelf or canJoinCarAll
  if (!canJoinCarSelf.value && !canJoinCarAll.value) return
  taxMaxDriverOverviewComponentRef.value?.updateLoadingAvailableMembers(true)
  api.get('/api/taxmax/companyMembers/' + companyId.value)
    .then((res) => {
      allAvailableCompanyMembers.value = res.data
      taxMaxDriverOverviewComponentRef.value?.updateAllAvailableCompanyMembers(allAvailableCompanyMembers.value)
      taxMaxDriverOverviewComponentRef.value?.updateLoadingAvailableMembers(false)
    })
    .catch((err) => {
      console.error(err)
    })
}
</script>

<style scoped>

</style>
