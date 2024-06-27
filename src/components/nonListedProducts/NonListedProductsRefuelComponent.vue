<template>
  <q-card flat bordered class="absolute-center refuel-card-custom">
    <q-card-section v-if="canRefuelCustomCar || canRefuelCompanyCar">
      <div class="row justify-center items-center q-gutter-sm">
        <q-input label="Tankkosten" type="number" outlined
                 :min="0" v-model.number="refuelTotalCost" class="col-12">
          <template v-slot:prepend>
            <q-icon name="mdi-cash" size="md" color="green-7"/>
          </template>
        </q-input>
      </div>
    </q-card-section>
    <q-card-section class="q-pt-none q-pb-none">
      <q-separator/>
    </q-card-section>
    <q-card-section v-if="canRefuelCompanyCar">
      <div class="row justify-center items-center q-gutter-sm">
        <q-select v-model="selectedVehicle" outlined
                  :options="companyVehicles" clearable
                  label="Firmenwagen auswählen"
                  class="col-12" use-input input-debounce="30"
                  @filter="filterCompanyCar"
                  @clear="() => selectedVehicle = undefined"
                  :option-label="(option) => option.vehicle.vehicle.name + ' |> ' + option.license_plate + ' |> ' + option.vehicle?.vehicle?.fuel_type?.name"
                  :option-value="option => option.id">
          <template v-slot:before>
            <q-icon name="mdi-car-select" size="md" :color="randomCarIconColor + '-8'" />
          </template>
        </q-select>
        <create-something-new-button :text="randomRefuelText" icon="mdi-gas-station-outline"
                                     :disable="refuelCompanyCarButtonDisabled"
                                     class="col-12" color="positive" @create-something-new="refuelCar()"/>
      </div>
    </q-card-section>
    <q-card-section class="q-pt-none q-pb-none" v-if="canRefuelCompanyCar && canRefuelCustomCar">
      <q-separator/>
    </q-card-section>
    <q-card-section>
      <div class="row justify-center items-center q-gutter-sm">
        <q-input v-model="customCarLicensePlate" outlined label="Kennzeichen"
                 class="col-12" counter maxlength="16" hint="LS/BC12345C" :disable="!canRefuelCustomCar">
          <template v-slot:before>
            <q-icon name="mdi-car-select" size="md" :color="randomCarIconColor + '-8'" />
          </template>
        </q-input>
        <create-something-new-button :text="randomRefuelText2" icon="mdi-gas-station-outline"
                                     :disable="refuelCustomCarButtonDisabled"
                                     class="col-12" color="positive" @create-something-new="refuelCar()"/>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ICompanyCar from 'src/misc/interfaces/CompanyCar/ICompanyCar'
import { api } from 'src/boot/axios'
import { companyStore } from 'stores/companyStore'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import AssignPolicies from 'src/misc/functions/policies/Policies'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const companyVehicles = ref<ICompanyCar[]>()
const selectedVehicle = ref<ICompanyCar | undefined | null>()
const randomCarIconColor = ref<string>()
const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
const randomRefuelText = selectRandomTanken()
const randomRefuelText2 = selectRandomTanken()
const canRefuelCompanyCar = ref<boolean>(true)
const canRefuelCustomCar = ref<boolean>(true)
const customCarLicensePlate = ref<string>()
const refuelTotalCost = ref<number>(0)
const refuelCompanyCarButtonDisabled = computed(() =>
  ((selectedVehicle.value === undefined || selectedVehicle.value === null) || (customCarLicensePlate.value?.length > 0)))
const refuelCustomCarButtonDisabled = computed(() =>
  ((customCarLicensePlate.value === undefined || customCarLicensePlate.value === '') || (selectedVehicle.value !== undefined)))

onMounted(() => {
  // get the policies
  getRefuelPolicies()
  // set a random color for the car icon
  selectRandomColor()
})

function selectRandomColor () {
  const colors: string[] = ['red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue', 'light-blue', 'cyan', 'teal', 'green', 'light-green', 'lime', 'amber', 'orange', 'deep-orange', 'blue-grey']
  randomCarIconColor.value = colors[Math.floor(Math.random() * colors.length)]
}
function selectRandomTanken () {
  const words: string[] = ['Tanken', 'Tanken tanken tanken', 'donken donken donken', 'mach ma voll den lachs']
  return words[Math.floor(Math.random() * words.length)]
}
function resetAfterTransaction () {
  selectedVehicle.value = undefined
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
function filterCompanyCar (val: string, update: (val: () => void) => void, abort: () => void) {
  if (companyVehicles.value !== undefined) {
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
            v.vehicle.vehicle !== undefined && v.vehicle?.vehicle?.name.toLowerCase().indexOf(needle) > -1))
    })
    return
  }
  if (companyId.value <= 0) return
  api.get('/api/companyCars/reduced/' + companyId.value)
    .then((res) => {
      companyVehicles.value = res.data.companyCars
    })
    .catch((err) => {
      console.error(err)
    })
}
function refuelCar () {
  if (companyId.value <= 0) return
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
    company_car_id: selectedVehicle.value?.id,
    custom_license_plate: customCarLicensePlate.value ?? undefined,
    total: refuelTotalCost.value
  })
    .then(() => {
      resetAfterTransaction()
    })
    .catch((err) => {
      console.error(err)
    })
}
</script>

<style scoped>
.refuel-card-custom {
  width: 70%;
  min-width: 60%;
}
</style>
