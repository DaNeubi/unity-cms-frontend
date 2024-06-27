<template>
  <div class="row">
    <div class="col-2">
      <div class="column items-center q-gutter-sm">
        <div class="row col-12 items-baseline full-width">
          <q-input outlined v-model="searchFilter" :debounce="300" label="Suche" class="col-12 full-width"
                   color="secondary" @update:modelValue="searchVehicles()" clearable @clear="resetAllFilters">
            <template v-slot:prepend>
              <q-icon name="mdi-magnify"/>
            </template>
          </q-input>
        </div>
        <div class="row col-12 items-center full-width">
          <q-select outlined v-model="selectedManufacturer" :options="manufacturersList" label="Hersteller"
                    :option-label="val => val.name" class="col-12" color="secondary" clearable @clear="selectedManufacturer = null"
                    @update:modelValue="filterVehicles()"/>
        </div>
        <div class="row col-12 items-center full-width">
          <q-select outlined v-model="selectedCategory" :options="categoryList" label="Kategorie"
                    :option-label="val => val.name" class="col-12" color="secondary" clearable @clear="selectedCategory = null"
                    @update:modelValue="filterVehicles()"/>
        </div>
        <div class="row col-12 items-center full-width">
          <q-select outlined v-model="selectedFuel" :options="fuelList" label="Kraftstoff"
                    :option-label="val => val.name" class="col-12" color="secondary" clearable @clear="selectedFuel = null"
                    @update:modelValue="filterVehicles()"/>
        </div>
        <div class="row col-12 items-center full-width">
          <q-input outlined v-model.number="moneyMin" label="Preis von $" class="col-5" color="secondary" :min="0"
                   type="number" :rules="[val => val >= 0 || 'Mindestens $0!', val => val <= moneyMax || 'Das Minimum muss schon auch kleiner sein']"/>
          <span class="q-ml-md q-mr-md">-</span>
          <q-input outlined v-model.number="moneyMax" label="Preis bis $" class="col-5" color="secondary" :min="0"
                   type="number" :rules="[val => val >= 0 || 'Mindestens $0!', val => val >= moneyMin || 'Das Maximum muss schon auch größer als das Minimum sein']"/>
          <q-btn color="green-7" label="Preisspanne übernehmen" @click="filterVehicles()"/>
        </div>
        <div class="row col-12 items-center full-width">
          <q-select outlined v-model="selectedSeatsAmount" :options="vehicleSeatList" label="Anzahl der Sitze"
                    class="col-12" color="secondary" clearable @clear="resetSeatFilter()"
                    @update:modelValue="filterVehicles()" :option-label="opt => opt === 0 ? 'Egal' : opt"/>
        </div>
        <div class="row col-12 items-center full-width q-mb-md">
          <div class="col-12">Kofferraumgröße in
            <span>
              Litern
              <q-tooltip class="text-body1">
                Metrische Liter😮
              </q-tooltip>
            </span>
          </div>
          <q-range v-model="selectedTrunkRange" color="accent" :min="trunkRangeMin" :max="trunkRangeMax" label-always
                   switch-label-side class="col-12" @update:modelValue="inputRangeDebounce()"/>
        </div>
        <div class="row col-12 items-center full-width">
          <q-toggle :label="`${ onlySoonCars ? 'Nur Soon Autos' : 'Normale und Soon Autos' }`" v-model="onlySoonCars" color="orange-7"
                    keep-color checked-icon="mdi-car-sports"
                    @update:modelValue="filterVehicles()" unchecked-icon="mdi-car"/>
        </div>
        <div class="row col-12 items-center full-width justify-between">
          <div class="text-caption cursor-pointer" @click="resetAllFilters()">
            <u>Filter zurücksetzen</u>
            <q-tooltip class="text-body2">
              Setzt alle Filter zurück
            </q-tooltip>
          </div>
          <div>
            Anzahl der Ergebnisse: {{ usedVehicleList.length }}
          </div>
        </div>
      </div>
    </div>
    <div class="col-10 q-mt-sm row items-center justify-center q-gutter-lg scroll" style="height: 75vh;">
      <q-intersection v-for="vehicle in usedVehicleList" :key="vehicle.id" class="col-3">
        <vehicle-list-vehicle-component :vehicle="vehicle" :backend-server="backendServer"/>
      </q-intersection>
    </div>
  </div>
</template>

<script setup lang="ts">
import IVehicle from 'src/misc/interfaces/Vehicle/IVehicle'
import { onMounted, ref } from 'vue'
import { api } from 'boot/axios'
import VehicleListVehicleComponent from 'components/vehicleList/vehicleListVehicleComponent.vue'
import IVehicleManufacturer from 'src/misc/interfaces/Vehicle/IVehicleManufacturer'
import IVehicleFuelType from 'src/misc/interfaces/Vehicle/IVehicleFuelType'
import IVehicleCategory from 'src/misc/interfaces/Vehicle/IVehicleCategory'

const vehicleList = ref<IVehicle[]>([])
const usedVehicleList = ref<IVehicle[]>([])
const manufacturersList = ref<IVehicleManufacturer[]>([])
const fuelList = ref<IVehicleFuelType[]>([])
const selectedFuel = ref<IVehicleFuelType | null>(null)
const categoryList = ref<IVehicleCategory[]>([])
const selectedCategory = ref<IVehicleCategory | null>(null)
const selectedManufacturer = ref<IVehicleManufacturer | null>(null)
const searchFilter = ref<string>('')
const moneyMin = ref<number>(0)
const moneyMax = ref<number>(500000)
const onlySoonCars = ref<boolean>(false)
const vehicleSeatList = ref<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
const selectedSeatsAmount = ref<number>(0)
const trunkRangeMin = ref<number>(0)
const trunkRangeMax = ref<number>(360)
const selectedTrunkRange = ref<{ min: number, max: number }>({ min: trunkRangeMin.value, max: trunkRangeMax.value })
const rangeDebounceTimer = ref()
const backendServer = process.env.BACKEND_SERVER + '/'

onMounted(() => {
  getAllVehicleManufacturers()
  getAllVehicleCategories()
  getAllVehicleFuels()
  getAllVehicles()
})

function getAllVehicleCategories () {
  api.get('/api/vehicles/categories')
    .then((res) => {
      categoryList.value = res.data
    })
    .catch((err) => {
      console.error(err)
    })
}
function getAllVehicleFuels () {
  api.get('/api/vehicles/fuelTypes')
    .then((res) => {
      fuelList.value = res.data
    })
    .catch((err) => {
      console.error(err)
    })
}
function getAllVehicleManufacturers () {
  api.get('/api/vehicles/manufacturers')
    .then((res) => {
      manufacturersList.value = res.data
    })
    .catch((err) => {
      console.error(err)
    })
}
function getAllVehicles () {
  api.get('/api/vehicles/forVehicleList')
    .then(response => {
      vehicleList.value = response.data
      usedVehicleList.value = vehicleList.value
      trunkRangeMax.value = Math.max(...vehicleList.value.map((vehicle : IVehicle) => vehicle.trunk))
    })
    .catch(error => {
      console.error(error)
    })
}
function searchVehicles () {
  if (searchFilter.value === null || searchFilter.value === '' || searchFilter.value.length < 3) return
  usedVehicleList.value = vehicleList.value.filter(vehicle => {
    return (vehicle.name + vehicle.manufacturer?.name).toLowerCase().includes(searchFilter.value.toLowerCase())
  })
}
function filterVehicles () {
  usedVehicleList.value = vehicleList.value.filter(vehicle => {
    let matches = true
    if (onlySoonCars.value) {
      matches = matches && vehicle.soon_car
    }
    if (selectedManufacturer.value !== null) {
      matches = matches && vehicle.vehicle_manufacturer_id === selectedManufacturer.value?.id
    }
    if (selectedCategory.value !== null) {
      matches = matches && vehicle.vehicle_category_id === selectedCategory.value?.id
    }
    if (selectedFuel.value !== null) {
      matches = matches && vehicle.vehicle_fuel_type_id === selectedFuel.value?.id
    }
    if (moneyMin.value === 0) {
      matches = matches && (vehicle.price === null || vehicle.price <= moneyMax.value)
    } else {
      matches = matches && (vehicle.price >= moneyMin.value && vehicle.price <= moneyMax.value)
    }
    if (selectedSeatsAmount.value === 0) {
      matches = matches && true
    } else {
      matches = matches && vehicle.seat_amount === selectedSeatsAmount.value
    }
    if (selectedTrunkRange.value !== undefined) {
      matches = matches && (vehicle.trunk >= selectedTrunkRange.value.min && vehicle.trunk <= selectedTrunkRange.value.max)
    }
    return matches
  })
}
function resetSeatFilter () {
  selectedSeatsAmount.value = 0
  filterVehicles()
}
function resetAllFilters () {
  selectedManufacturer.value = null
  selectedCategory.value = null
  selectedFuel.value = null
  searchFilter.value = ''
  moneyMin.value = 0
  moneyMax.value = 500000
  usedVehicleList.value = vehicleList.value
  onlySoonCars.value = false
  selectedSeatsAmount.value = 0
  selectedTrunkRange.value = { min: trunkRangeMin.value, max: trunkRangeMax.value }
}
function inputRangeDebounce () {
  clearTimeout(rangeDebounceTimer.value)
  rangeDebounceTimer.value = setTimeout(() => {
    filterVehicles()
  }, 300)
}
</script>

<style scoped>

</style>
