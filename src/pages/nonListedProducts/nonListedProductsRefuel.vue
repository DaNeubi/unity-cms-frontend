<template>
  <NonListedProductsRefuelComponent/>
</template>

<script lang="ts">
import { api } from 'src/boot/axios'
import ICompanyCar from 'src/misc/interfaces/CompanyCar/ICompanyCar'
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import { companyStore } from 'stores/companyStore'
import laravelEcho from 'boot/laravelecho'
import { useUserStore } from 'stores/useUserStore'
import { useQuasar } from 'quasar'
import AssignPolicies from 'src/misc/functions/policies/Policies'
import NonListedProductsRefuelComponent from 'components/nonListedProducts/NonListedProductsRefuelComponent.vue'

export default defineComponent({
  name: 'nonListedProductsRefuel',
  components: { NonListedProductsRefuelComponent },
  setup () {
    const $q = useQuasar()
    const companyVehicles = ref<ICompanyCar[]>()
    const selectedCompanyVehicle = ref<ICompanyCar>()
    const randomCarIconColor = ref<string>()
    const cStore = companyStore()
    const companyId = computed(() => cStore.companyId)
    const userStore = useUserStore()
    const userId = computed(() => userStore.userId)
    const refuelCompanyCarButtonDisabled = computed(() => (selectedCompanyVehicle.value === undefined || (customCarLicensePlate.value !== undefined || customCarLicensePlate.value === '')))
    const refuelCustomCarButtonDisabled = computed(() => ((customCarLicensePlate.value === undefined || customCarLicensePlate.value === '') || (selectedCompanyVehicle.value !== undefined)))
    const randomTankenText = selectRandomTanken()
    const randomTankenText2 = selectRandomTanken()
    const canRefuelCompanyCar = ref<boolean>(false)
    const canRefuelCustomCar = ref<boolean>(false)
    const customCarLicensePlate = ref<string>()
    const refuelTotalCost = ref<number>(0)
    onMounted(() => {
      getRefuelPolicies()
      // select a random color for the car icons
      selectRandomColor()
      // get all company vehicles but only if available
      getCompanyVehicles()
      joinReloadChannel()
    })
    watch(userId, () => {
      joinReloadChannel()
    })
    onUnmounted(() => {
      // stop listening to the change event
      laravelEcho.leave('user.reload.' + userId.value)
    })
    function joinReloadChannel () {
      if (userId.value <= 0) { return }
      // listen to the change event
      laravelEcho.private('user.reload.' + userId.value)
        .listen('.user.reload', () => {
          // reset everything
          resetAfterTransaction()
        })
    }
    function selectRandomColor () {
      const colors: string[] = ['red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue', 'light-blue', 'cyan', 'teal', 'green', 'light-green', 'lime', 'amber', 'orange', 'deep-orange', 'blue-grey']
      randomCarIconColor.value = colors[Math.floor(Math.random() * colors.length)]
    }
    function selectRandomTanken () {
      const words: string[] = ['Tanken', 'Tanken tanken tanken', 'donken donken donken', 'mach den lachs ma voll']
      return words[Math.floor(Math.random() * words.length)]
    }
    function getCompanyVehicles () {
      if (companyId.value <= 0) {
        return
      }
      api.get('/api/companyCars/reduced/' + companyId.value)
        .then((res) => {
          companyVehicles.value = res.data.companyCars
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function filterCompanyCar (val: string, update: (val: () => void) => void, abort: () => void) {
      update(() => {
        if (val.length < 1) {
          abort()
          return
        }
        if (companyVehicles.value === undefined) return
        const needle = val.toLowerCase()
        companyVehicles.value = companyVehicles.value
          .filter((v: ICompanyCar) => v.license_plate.toLowerCase().indexOf(needle) > -1 ||
            (v.vehicle !== undefined &&
              v.vehicle.vehicle !== undefined &&
              v.vehicle?.vehicle?.name.toLowerCase().indexOf(needle) > -1))
      })
    }
    function resetAfterTransaction () {
      selectedCompanyVehicle.value = undefined
      customCarLicensePlate.value = undefined
      refuelTotalCost.value = 0
    }
    function getRefuelPolicies () {
      if (companyId.value <= 0) {
        return
      }
      api.get('/api/policies/nonProduct/refuel/' + companyId.value)
        .then((res) => {
          AssignPolicies([
            { policyName: 'NonProductPolicy_Refuel_Company_Cars', policyToAssign: canRefuelCompanyCar },
            { policyName: 'NonProductPolicy_Refuel_Custom', policyToAssign: canRefuelCustomCar }
          ], res.data.nonProductRefuelPolicies)
        })
    }
    function refuelCar () {
      // check if price greater 0
      if (refuelTotalCost.value <= 0) {
        $q.notify({
          icon: 'mdi-alert-circle',
          color: 'red-5',
          textColor: 'white',
          message: 'Brudiii, du musst schon für mehr als $0 tanken⛽!',
          timeout: 2500,
          position: 'top-right'
        })
        return
      }
      // refuel the car
      api.post('/api/nonProducts/refuel/' + companyId.value, {
        company_car_id: selectedCompanyVehicle.value?.id ?? null,
        custom_license_plate: customCarLicensePlate.value ?? null,
        total: refuelTotalCost.value
      })
        .catch((err) => {
          console.error(err)
        })
    }
    return {
      companyVehicles,
      selectedCompanyVehicle,
      randomCarIconColor,
      randomTankenText,
      refuelCompanyCarButtonDisabled,
      refuelCar,
      canRefuelCompanyCar,
      canRefuelCustomCar,
      customCarLicensePlate,
      randomTankenText2,
      refuelCustomCarButtonDisabled,
      filterCompanyCar,
      refuelTotalCost
    }
  }
})
</script>

<style scoped>

</style>
