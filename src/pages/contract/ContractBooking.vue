<template>
  <div class="row">
    <ContractBookingComponent class="col-12" :company-id="companyId"
                              v-if="canBook" ref="bookingComponent">
    </ContractBookingComponent>
  </div>
</template>

<script setup lang="ts">
import ContractBookingComponent from 'components/contracts/ContractBookingComponent.vue'
import { companyStore } from 'stores/companyStore'
import { onMounted, ref, computed, watch, onUnmounted } from 'vue'
import { api } from 'boot/axios'
import AssignPolicies from 'src/misc/functions/policies/Policies'
import laravelEcho from 'boot/laravelecho'
import { useUserStore } from 'stores/useUserStore'

const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
const canBook = ref<boolean>(false)
const userStore = useUserStore()
const userId = computed(() => userStore.userId)
const bookingComponent = ref()

onMounted(() => {
  getPermissions()
  joinReloadChannel()
})

watch(companyId, () => {
  getPermissions()
})

onUnmounted(() => {
  laravelEcho.leave('user.reload.' + userId.value)
})

function getPermissions () {
  if (companyId.value <= 0) return
  api.get('/api/policies/contract/contractList/' + companyId.value)
    .then((res) => {
      AssignPolicies([
        { policyName: 'Contracts_Booking_Book', policyToAssign: canBook }
      ], res.data.contractPolicies)
    })
    .catch((error) => {
      console.error(error)
    })
}

function joinReloadChannel () {
  laravelEcho.private('user.reload.' + userId.value)
    .listen('.user.reload', () => {
      if (bookingComponent.value === undefined) return
      bookingComponent.value?.resetOnTransaction()
    })
}

</script>

<style scoped>

</style>
