<template>
  <q-card>
    <q-card-section>
      <div class="row items-center justify-start q-gutter-md">
        <create-something-new-button text="Fahrzeug besetzen" icon="mdi-car-connected" class="col-auto"
                                     :disable="selectedCompanyCar === undefined" v-if="canJoinCarSelf || canJoinCarAll"
                                     @create-something-new="createCompanyCarDriver()"/>
        <q-select v-model="selectedCompanyCar" :options="allAvailableOptionsCompanyCars" outlined use-input
                  fill-input color="secondary" dense v-if="canJoinCarSelf || canJoinCarAll"
                  label="Fahrzeug auswählen" class="col-sm-4 col-md-4 col-lg-3" @filter="filterCompanyCar" clearable
                  :option-label="(opt: ICompanyCar) => opt?.license_plate + ' | ' + opt.vehicle?.vehicle?.name + ' | ' + opt?.vehicle?.vehicle?.manufacturer?.name"/>
        <q-separator vertical/>
        <q-select v-model="selectedCompanyMember" :options="availableCompanyMembers" outlined use-input
                  label="Fahrer auswählen" class="col-sm-4 col-md-4 col-lg-3" color="secondary" clearable
                  :option-label="(opt: User) => opt?.first_name + ' ' + opt?.last_name" dense
                  v-if="canJoinCarSelf || canJoinCarAll"/>
      </div>
    </q-card-section>
    <q-separator/>
    <q-card-section>
      <q-scroll-area style="height: 20vh; min-height: 15vh;">
        <div class="row q-gutter-sm">
          <div class="col-12" v-for="(car, n) in availableCarsWithDrivers" :key="car.id">
            <q-card :class="`car-card-background-${ n % 2 === 0 ? '1' : '2' }`">
              <q-card-section class="q-pa-sm">
                <div class="row items-center justify-start q-gutter-sm">
                  <div class="col-auto text-body1">
                    {{ car?.vehicle?.vehicle?.name }} | {{ car?.license_plate }}
                    <q-tooltip class="text-body2" v-if="car?.vehicle?.vehicle?.fuel_type">
                      <q-icon name="mdi-gas-station"/> {{ car?.vehicle?.vehicle?.fuel_type?.name }}
                    </q-tooltip>
                  </div>
                  <div class="col-auto cursor-pointer">
                    <q-chip class="col-auto" icon="mdi-liquid-spot" color="purple-8"
                            :label="'Status: ' + getCarStatus(car as ICompanyCar)"/>
                    <q-popup-edit v-model="car.car_status" v-slot="scope" buttons
                                  v-if="canJoinCarSelf || canJoinCarAll"
                                  @save="(val) => updateCompanyCarStatus(car.id, val.id)">
                      <q-select v-model="scope.value" :options="availableCarStatus" outlined dense
                                label="Status auswählen" clearable
                                :option-label="(opt: ICompanyCarStatus) => opt?.name"/>
                    </q-popup-edit>
                  </div>
                  <div class="col-auto" v-for="driver in car?.driver_persons" :key="'driver:' + driver.id">
                    <q-chip icon="mdi-account-tie-hat" :label="`${ driver.first_name } ${ driver.last_name }`"
                            @remove="removeCarDriver(car.id, driver.id)"
                            :removable="canJoinCarAll || driver.id === userId"/>
                  </div>
                  <q-btn icon="mdi-plus" color="positive" @click="addCarDriver(car.id)"
                         v-if="canJoinCarSelf || canJoinCarAll">
                    <q-tooltip>
                      Fahrer hinzufügen
                    </q-tooltip>
                  </q-btn>
                  <q-select v-model="additionalSelectedCompanyMember" :options="availableCompanyMembers" outlined
                            label="Fahrer auswählen" class="col-sm-4 col-md-4 col-lg-2 bg-dark" color="secondary"
                            :option-label="(opt: User) => opt?.first_name + ' ' + opt?.last_name" dense clearable
                            v-if="canJoinCarSelf || canJoinCarAll" :disable="!canJoinCarAll" use-input/>
                  <q-btn icon="mdi-parking" color="negative" label="Frei machen" @click="clearCar(car.id)"
                         v-if="canJoinCarSelf || canJoinCarAll"/>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-scroll-area>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import { onMounted, PropType, ref, watch } from 'vue'
import ICompanyCar from 'src/misc/interfaces/CompanyCar/ICompanyCar'
import { api } from 'boot/axios'
import User from 'src/misc/classes/User/User'
import { useQuasar } from 'quasar'
import ICompanyCarStatus from 'src/misc/interfaces/CompanyCar/ICompanyCarStatus'
import ICompanyCarDriver from 'src/misc/interfaces/CompanyCar/ICompanyCarDriver'

const props = defineProps({
  companyId: {
    type: Number,
    required: true
  },
  canJoinCarSelf: {
    type: Boolean,
    required: false,
    default: false
  },
  canJoinCarAll: {
    type: Boolean,
    required: false,
    default: false
  },
  companyMembers: {
    type: Object as PropType<User[] | undefined>,
    required: false,
    default: undefined
  },
  userId: {
    type: Number,
    required: true,
    default: 0
  }
})
defineExpose({
  updateAllAvailableCompanyMembers,
  updateLoadingAvailableMembers,
  eventUpdateCompanyCar,
  eventRemoveDriver,
  eventRemoveCar
})

const allAvailableCompanyCars = ref<ICompanyCar[]>()
const allAvailableOptionsCompanyCars = ref<ICompanyCar[]>()
const selectedCompanyCar = ref<ICompanyCar>()
const selectedCompanyMember = ref<User>()
const availableCompanyMembers = ref<User[]>(props.companyMembers ?? [])
const loadingAvailableMembers = ref<boolean>(false)
const availableCarsWithDrivers = ref<ICompanyCar[]>([])
const additionalSelectedCompanyMember = ref<User>()
const availableCarStatus = ref<ICompanyCarStatus[]>([])
const $q = useQuasar()
const loadingCarStatus = ref<boolean>(false)

onMounted(() => {
  getCurrentCarDrivers()
  setSelfAsSelectedDriverIfAvailable()
  getAllCompanyCarStatuses()
})

watch(() => props.companyId, () => {
  getCurrentCarDrivers()
  getAllCompanyCarStatuses()
})

watch(() => props.canJoinCarSelf, () => {
  setSelfAsSelectedDriverIfAvailable()
  getAllCompanyCarStatuses()
})

watch(() => props.canJoinCarAll, () => {
  setSelfAsSelectedDriverIfAvailable()
  getAllCompanyCarStatuses()
})

function setSelfAsSelectedDriverIfAvailable () {
  // check if the user is allowed to join a car
  // if so, set the current user as selected driver
  if ((props.canJoinCarAll || props.canJoinCarSelf) && props.companyMembers !== undefined) {
    selectedCompanyMember.value = props.companyMembers?.find((v) => v.id === props.userId) ?? undefined
    additionalSelectedCompanyMember.value = props.companyMembers?.find((v) => v.id === props.userId) ?? undefined
  }
}
function filterCompanyCar (val: string, update: (val: () => void) => void) {
  if (props.companyId === undefined) {
    return
  }
  if (allAvailableCompanyCars.value !== undefined) {
    update(() => {
      if (val === '') {
        allAvailableOptionsCompanyCars.value = allAvailableCompanyCars.value
        return
      }
      const needle = val.toLowerCase()
      allAvailableOptionsCompanyCars.value = allAvailableCompanyCars.value?.filter((v: ICompanyCar) =>
        (v.vehicle?.vehicle?.name.toLowerCase().indexOf(needle) ?? -1) > -1 ||
        v.license_plate.toLowerCase().indexOf(needle) > -1)
    })
    return
  }
  api.get('/api/taxmax/companyCars/' + props.companyId)
    .then((res) => {
      allAvailableCompanyCars.value = res.data
      allAvailableOptionsCompanyCars.value = res.data
    })
    .catch((err) => {
      console.error(err)
    })
}
function updateAllAvailableCompanyMembers (members: User[] | undefined) {
  if (members === undefined) {
    return
  }
  availableCompanyMembers.value = members
}
function updateLoadingAvailableMembers (loading: boolean) {
  loadingAvailableMembers.value = loading
}
function createCompanyCarDriver () {
  if (selectedCompanyCar.value === undefined || selectedCompanyMember.value === undefined || props.companyId <= 0) return
  // check if there is already a company car with the id
  if (availableCarsWithDrivers.value?.find((car: ICompanyCar) => car.id === selectedCompanyCar.value?.id) !== undefined) {
    $q.notify({
      message: 'Fahrzeug bereits besetzt',
      color: 'negative',
      position: 'center',
      timeout: 4000,
      progress: true,
      icon: 'mdi-alert'
    })
    selectedCompanyCar.value = undefined
    return
  }
  api.post('/api/taxmax/create/carDriver/' + props.companyId, {
    car_id: selectedCompanyCar.value.id,
    driver_id: selectedCompanyMember.value.id
  })
    .then((res) => {
      // update or insert the car with the driver
      const index = availableCarsWithDrivers.value?.findIndex((c: ICompanyCar) => c.id === res.data.id)
      if (index === undefined || index < 0) {
        // push the car
        availableCarsWithDrivers.value?.push(res.data)
      }
      selectedCompanyCar.value = undefined
      selectedCompanyMember.value = undefined
      setSelfAsSelectedDriverIfAvailable()
    })
    .catch((err) => {
      console.error(err)
    })
}
function getCurrentCarDrivers () {
  if (props.companyId <= 0) return
  api.get('/api/taxmax/carDrivers/' + props.companyId)
    .then((res) => {
      availableCarsWithDrivers.value = res.data
    })
    .catch((err) => {
      console.error(err)
    })
}
function addCarDriver (companyCarId: number | undefined) {
  if (props.companyId <= 0 || additionalSelectedCompanyMember.value === undefined || companyCarId === undefined) return
  // check if the driver is already in the car
  if (availableCarsWithDrivers.value?.find((v) => v.id === companyCarId)?.driver_persons?.find((v) => v.id === additionalSelectedCompanyMember.value?.id) !== undefined) {
    $q.notify({
      message: 'Fahrer bereits im Fahrzeug',
      color: 'negative',
      position: 'center',
      timeout: 4000,
      progress: true,
      icon: 'mdi-alert'
    })
    additionalSelectedCompanyMember.value = undefined
    return
  }
  api.post('/api/taxmax/create/carDriver/' + props.companyId, {
    car_id: companyCarId,
    driver_id: additionalSelectedCompanyMember.value.id
  })
    .then((res) => {
      // update or insert the car with the driver
      const index = availableCarsWithDrivers.value?.findIndex((c: ICompanyCar) => c.id === res.data.id)
      if (index === undefined || index < 0) {
        // push the car
        availableCarsWithDrivers.value?.push(res.data)
      }
      additionalSelectedCompanyMember.value = undefined
    })
    .catch((err) => {
      console.error(err)
    })
}
function removeCarDriver (companyCarId: number | undefined, driverId: number | undefined) {
  if (props.companyId <= 0 || companyCarId === undefined || driverId === undefined) return
  api.post('/api/taxmax/remove/carDriver/' + props.companyId, {
    company_car_id: companyCarId,
    driver_id: driverId
  })
    .then(() => {
      // remove the driver from the array
      const carIndex = availableCarsWithDrivers.value?.findIndex((v) => v.id === companyCarId)
      if (carIndex !== -1) {
        const driverIndex = availableCarsWithDrivers.value?.[carIndex].driver_persons?.findIndex((v) => v.id === driverId)
        if (driverIndex !== undefined && driverIndex !== -1) {
          availableCarsWithDrivers.value?.[carIndex].driver_persons?.splice(driverIndex, 1)
        }
      }
      setSelfAsSelectedDriverIfAvailable()
    })
    .catch((err) => {
      console.error(err)
    })
}
function clearCar (companyCarId: number | undefined) {
  if (props.companyId <= 0 || companyCarId === undefined) return
  api.post('/api/taxmax/remove/clearCar/' + props.companyId, {
    company_car_id: companyCarId
  })
    .then(() => {
      const carIndex = availableCarsWithDrivers.value?.findIndex((v) => v.id === companyCarId)
      if (carIndex !== -1 && carIndex !== undefined) {
        availableCarsWithDrivers.value?.splice(carIndex, 1)
      }
    })
    .catch((err) => {
      console.error(err)
    })
}
function getAllCompanyCarStatuses () {
  if (props.companyId <= 0 || (!props.canJoinCarAll && !props.canJoinCarSelf)) return
  api.get('/api/companyCarStatus/reducedForTaxmax/' + props.companyId)
    .then((res) => {
      availableCarStatus.value = res.data
    })
    .catch((err) => {
      console.error(err)
    })
}
function updateCompanyCarStatus (companyCarId: number | undefined, statusId: number | undefined) {
  if (props.companyId <= 0 || companyCarId === undefined || statusId === undefined || loadingCarStatus.value) return
  loadingCarStatus.value = true
  api.patch('/api/companyCarStatus/updateStatus/' + props.companyId, {
    company_car_id: companyCarId,
    company_car_status_id: statusId
  })
    .then((res) => {
      // update or insert the car with the driver
      const newCompanyCarWithDrivers: ICompanyCar = res.data
      const index = allAvailableCompanyCars.value?.findIndex((c: ICompanyCar) => c.id === newCompanyCarWithDrivers.id)
      if (index !== undefined && index >= 0) {
        // replace the car
        availableCarsWithDrivers.value?.splice(index, 1, newCompanyCarWithDrivers)
      }
      loadingCarStatus.value = false
    })
    .catch((err) => {
      console.error(err)
    })
}
function getCarStatus (car: ICompanyCar) {
  if (car?.car_status === null || car?.car_status === undefined) return 'KEIN STATUS'
  return car?.car_status?.name
}
function eventUpdateCompanyCar (car: ICompanyCar) {
  // check if the car is in the list
  const index = availableCarsWithDrivers.value?.findIndex((v) => v.id === car.id)
  if (index !== undefined && index >= 0) {
    // replace the car
    availableCarsWithDrivers.value?.splice(index, 1, car)
  } else {
    // push the car
    availableCarsWithDrivers.value?.push(car)
  }
  additionalSelectedCompanyMember.value = undefined
}
function eventRemoveDriver (driver: ICompanyCarDriver) {
  // get the car of the driver
  const car = availableCarsWithDrivers.value?.find((v) => v.id === driver.company_car_id)
  if (car === undefined) return
  // remove the driver from the car
  const driverIndex = car.driver_persons?.findIndex((v) => v.id === driver.id)
  if (driverIndex !== undefined && driverIndex >= 0) {
    car.driver_persons?.splice(driverIndex, 1)
  }
}
function eventRemoveCar (car: ICompanyCar) {
  // check if the car is in the list
  const index = availableCarsWithDrivers.value?.findIndex((v) => v.id === car.id)
  if (index !== undefined && index >= 0) {
    // remove the car
    availableCarsWithDrivers.value?.splice(index, 1)
  }
}
</script>

<style scoped>
.car-card-background-1 {
  background-color: #d9b84d;
  color: black;
}
.car-card-background-2 {
  background-color: #4b73ad;
}
</style>
