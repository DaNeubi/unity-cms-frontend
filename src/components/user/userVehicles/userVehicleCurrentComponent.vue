<template>
  <div class="row items-center justify-start q-mb-sm q-gutter-md">
    <CreateSomethingNewButton text="Auto Hinzufügen" @create-something-new="showCreateDialog()"/>
    <edit-something-button text="Änderungen Speichern" :disable="vehiclesForEdit.length < 1" @create-something-new="editVehicles()"/>
    <div>Sortiere nach:</div>
    <q-option-group v-model="selectedFilter" :options="filterOptions" color="accent" inline @update:model-value="(val) => sortUserVehicles(val)"/>
  </div>
  <q-scroll-area style="height: 60vh;">
    <q-list bordered separator>
      <q-expansion-item v-for="userVehicle in userVehicles" :key="userVehicle.id"
                        @mousedown="increaseClickCounter()" :class="checkNextInspection(userVehicle.inspection_date as string | null) ? 'bg-red-7' : ''">
        <template v-slot:header>
          <q-item-section avatar>
            <q-avatar icon="mdi-car" color="secondary"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>
              <div class="text-body1 text-bold">
                {{ userVehicle.license_plate?.length ?? 0 > 0 ? userVehicle.license_plate : 'Kein Nummernschild' }}
                {{ checkNextInspection(userVehicle.inspection_date as string | null) ? '🔧 Inspektion bald Fällig!' : '' }}
              </div>
            </q-item-label>
            <q-item-label caption>
              <div>
                {{ userVehicle?.vehicle?.manufacturer?.name }} - {{ userVehicle.vehicle?.name }}
                ({{ userVehicle?.vehicle?.fuel_type?.name }}) <b>{{ checkIfAnyTuningSet(userVehicle.tuning as IUserVehicleTuning) ? '[LT]' : '' }}</b>
              </div>
            </q-item-label>
          </q-item-section>
        </template>
        <q-card>
          <q-card-section>
            <div class="column q-gutter-sm text-body1">
              <div class="cursor-pointer">
                Kennzeichen: <b>{{ userVehicle.license_plate?.length ?? 0 > 0 ? userVehicle.license_plate : 'Kein Nummernschild' }}</b>
                <q-popup-edit :model-value="userVehicle.license_plate" v-slot="scope" buttons
                              label-set="Aktualisieren" label-cancel="Abbrechen"
                              @save="(val) => saveVehicleChanges(val, userVehicle as IUserVehicle, 'license_plate')">
                  <q-input v-model="scope.value" outlined label="Kennzeichen*" counter maxlength="8"/>
                </q-popup-edit>
              </div>
              <div class="cursor-pointer">
                Winterreifen: {{ userVehicle.winter_tires ? 'Ja' : 'Nein' }}
                <q-popup-edit :model-value="userVehicle.winter_tires" v-slot="scope" buttons
                              label-set="Aktualisieren" label-cancel="Abbrechen"
                              @save="(val) => saveVehicleChanges(val, userVehicle as IUserVehicle, 'winter_tires')">
                  <q-checkbox v-model="scope.value" color="accent" :true-value="1" :false-value="0"
                              label="Winterreifen"/>
                </q-popup-edit>
              </div>
              <div class="cursor-pointer">
                Letzte Inspektion: <b>{{ customDateFormat(userVehicle.inspection_date) ?? 'Kein Datum' }}</b>
                <q-popup-edit :model-value="userVehicle.inspection_date" v-slot="scope" buttons
                              label-set="Aktualisieren" label-cancel="Abbrechen"
                              @save="(val) => saveVehicleChanges(val, userVehicle as IUserVehicle, 'inspection_date')">
                  <q-input outlined v-model="scope.value" label="Letzte Inspektion" clearable>
                    <template v-slot:prepend>
                      <q-icon name="mdi-calendar" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="scope.value" mask="DD.MM.YYYY">
                            <div class="row items-center justify-end">
                              <q-btn v-close-popup label="Schließen" color="primary" flat>
                              </q-btn>
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </q-popup-edit>
              </div>
              <div class="cursor-pointer">
                Parkort: {{ userVehicle.parking_location?.length ?? 0 > 0 ? userVehicle.parking_location : 'Ich nix wissen🤔' }}
                <q-popup-edit :model-value="userVehicle.parking_location" v-slot="scope" buttons
                              label-set="Aktualisieren" label-cancel="Abbrechen"
                              @save="(val) => saveVehicleChanges(val, userVehicle as IUserVehicle, 'parking_location')">
                  <q-input v-model="scope.value" outlined label="Parkort" counter maxlength="255"/>
                </q-popup-edit>
              </div>
              <div class="cursor-pointer">
                Gekauft für: <b>${{ userVehicle.purchase_price ?? 'n.A.' }}</b>
                <q-popup-edit :model-value="userVehicle.purchase_price" v-slot="scope" buttons
                              label-set="Aktualisieren" label-cancel="Abbrechen"
                              @save="(val) => saveVehicleChanges(val, userVehicle as IUserVehicle, 'purchase_price')">
                  <q-input v-model.number="scope.value" outlined label="Kaufpreis" :min="0" type="number"/>
                </q-popup-edit>
              </div>
              <div class="cursor-pointer">
                Gekauft am: <b>{{ customDateFormat(userVehicle.purchase_date) ?? 'Kein Datum' }}</b>
                <q-popup-edit :model-value="userVehicle.purchase_date" v-slot="scope" buttons
                              label-set="Aktualisieren" label-cancel="Abbrechen"
                              @save="(val) => saveVehicleChanges(val, userVehicle as IUserVehicle, 'purchase_date')">
                  <q-input outlined v-model="scope.value" label="Kaufdatum" clearable>
                    <template v-slot:prepend>
                      <q-icon name="mdi-calendar" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="scope.value" mask="DD.MM.YYYY">
                            <div class="row items-center justify-end">
                              <q-btn v-close-popup label="Schließen" color="primary" flat>
                              </q-btn>
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </q-popup-edit>
              </div>
              <div class="cursor-pointer">
                Tuning: {{ createTuningString(userVehicle.tuning as IUserVehicleTuning | null) }}
                <q-popup-edit :model-value="userVehicle.tuning" v-slot="scope" buttons
                              label-set="Aktualisieren" label-cancel="Abbrechen"
                              @save="(val) => saveVehicleChanges(val, userVehicle as IUserVehicle, 'tuning')">
                  <div class="column">
                    <q-checkbox v-model="scope.value.engine_tuning" label="Motor-Tuning" :true-value="1"
                                :false-value="0" color="accent"/>
                    <q-checkbox v-model="scope.value.transmission_tuning" label="Getriebe-Tuning" :true-value="1"
                                :false-value="0" color="accent"/>
                    <q-checkbox v-model="scope.value.turbo_tuning" label="Turbo-Tuning" :true-value="1"
                                :false-value="0" color="accent"/>
                    <q-checkbox v-model="scope.value.brake_tuning" label="Bremsen-Tuning" :true-value="1"
                                :false-value="0" color="accent"/>
                  </div>
                </q-popup-edit>
              </div>
              <div class="cursor-pointer">
                Meilen: {{ userVehicle.miles !== null ? userVehicle.miles + ' mi.' : 'n.A.' }}
                <q-popup-edit :model-value="userVehicle.miles" v-slot="scope" buttons
                              label-set="Aktualisieren" label-cancel="Abbrechen"
                              @save="(val) => saveVehicleChanges(val, userVehicle as IUserVehicle, 'miles')">
                  <q-input v-model.number="scope.value" outlined label="Meilenstand" :min="0" type="number"/>
                </q-popup-edit>
              </div>
              <div class="cursor-pointer row items-center justify-start">
                <div>Farben: </div>
                <q-chip v-for="color in userVehicle.colors" :key="color.id" icon="mdi-palette" outline removable
                        @remove="removeColor(color, userVehicle)" clickable @click="editColor(color, userVehicle)">
                  <span :style="`color: ${ color.hexa_color }`">{{ color.name }}</span>
                </q-chip>
                <q-btn round dense icon="mdi-plus" color="positive" @click="addNewColor(userVehicle)">
                  <q-tooltip>
                    Neue Farbe hinzufügen
                  </q-tooltip>
                </q-btn>
              </div>
              <div class="row">
                <delete-something-button icon="mdi-car-off" text="Auto muss weg😢" class="col-auto"
                                         @create-something-new="removeVehicle(userVehicle as IUserVehicle)"/>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>
  </q-scroll-area>
</template>

<script setup lang="ts">
import IUserVehicle from 'src/misc/interfaces/UserVehicle/IUserVehicle'
import { date, useQuasar } from 'quasar'
import IUserVehicleTuning from 'src/misc/interfaces/UserVehicle/IUserVehicleTuning'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'
import { onMounted, ref, watch } from 'vue'
import CreateNewUserVehicleDialog from 'components/user/userVehicles/dialog/CreateNewUserVehicleDialog.vue'
import { api } from 'boot/axios'
import DeleteSomethingButton from 'components/general/buttons/DeleteSomethingButton.vue'
import RemoveUserVehicleDialog from 'components/user/userVehicles/dialog/RemoveUserVehicleDialog.vue'
import IUserVehicleColor from 'src/misc/interfaces/UserVehicle/IUserVehicleColor'
import AddNewUserVehicleColorDialog from 'components/user/userVehicles/dialog/AddNewUserVehicleColorDialog.vue'

const $q = useQuasar()
const userVehicles = ref<IUserVehicle[]>([])
const clickCounter = ref<number>(0)
const vehiclesForEdit = ref<IUserVehicle[]>([])
const selectedFilter = ref<string>('')
const filterOptions = ref([
  { label: 'Fahrzeug', value: 'vehicle' },
  { label: 'Hersteller', value: 'manufacturer' },
  { label: 'Inspektion', value: 'inspection_date' },
  { label: 'Tuning', value: 'tuning' }
])

onMounted(() => {
  getAllUserVehicles()
})

watch(clickCounter, () => {
  if (clickCounter.value === 30) {
    $q.notify({
      message: 'Herzlichen Glückwunsch, du hast 30 mal auf Autos geklickt!',
      color: 'primary',
      position: 'center',
      icon: 'mdi-egg-easter',
      timeout: 5000
    })
  }
})

function getAllUserVehicles () {
  api.get('/api/userVehicle/all')
    .then((res) => {
      userVehicles.value = res.data
      // create empty tuning if null
      userVehicles.value.forEach((vehicle) => {
        if (vehicle.tuning === null) {
          vehicle.tuning = {
            id: -1,
            engine_tuning: 0,
            transmission_tuning: 0,
            turbo_tuning: 0,
            brake_tuning: 0
          } as IUserVehicleTuning
        }
      })
      selectedFilter.value = 'vehicle'
      sortUserVehicles('vehicle')
    })
    .catch((err) => {
      console.error(err)
    })
}
function increaseClickCounter () {
  clickCounter.value++
}
function createNewUserVehicle (newVehicle: IUserVehicle) {
  api.post('/api/userVehicle/create', newVehicle)
    .then(() => {
      // add the vehicle to the list
      getAllUserVehicles()
    })
    .catch((err) => {
      console.error(err)
    })
}
function saveVehicleChanges (newValue: string | number | null, vehicle: IUserVehicle, valueChanged: string) {
  vehicle[valueChanged] = newValue
  if (vehiclesForEdit.value.find((v) => v.id === vehicle.id) === undefined) {
    vehiclesForEdit.value.push(vehicle)
  }
}
function removeColor (color: IUserVehicleColor, vehicle: IUserVehicle) {
  vehicle.colors = vehicle.colors?.filter((c) => c.id !== color.id)
  if (vehiclesForEdit.value.find((v) => v.id === vehicle.id) === undefined) {
    vehiclesForEdit.value.push(vehicle)
  }
}
function addNewColor (vehicle: IUserVehicle) {
  $q.dialog({
    component: AddNewUserVehicleColorDialog
  })
    .onOk((newColor: IUserVehicleColor) => {
      if (vehicle.colors === null || vehicle.colors === undefined) {
        vehicle.colors = []
      }
      vehicle.colors.push(newColor)
      if (vehiclesForEdit.value.find((v) => v.id === vehicle.id) === undefined) {
        vehiclesForEdit.value.push(vehicle)
      }
    })
}
function editColor (color: IUserVehicleColor, vehicle: IUserVehicle) {
  $q.dialog({
    component: AddNewUserVehicleColorDialog,
    componentProps: {
      vehicleColor: color
    }
  })
    .onOk((editedColor: IUserVehicleColor) => {
      const changedColor = vehicle.colors?.find((c) => c.id === color.id)
      if (changedColor !== undefined) {
        changedColor.name = editedColor.name
        changedColor.hexa_color = editedColor.hexa_color
      }
      if (vehiclesForEdit.value.find((v) => v.id === vehicle.id) === undefined) {
        vehiclesForEdit.value.push(vehicle)
      }
    })
}
function createTuningString (tuning?: IUserVehicleTuning | null) {
  if (tuning === null || tuning === undefined || tuning.id === -1) {
    return 'Kein Tuning'
  }
  let tuningString = ''
  if (tuning.engine_tuning) {
    tuningString += 'Motor-Tuning'
  }
  if (tuning.transmission_tuning) {
    if (tuningString.length > 0) {
      tuningString += ', '
    }
    tuningString += 'Getriebe-Tuning'
  }
  if (tuning.turbo_tuning) {
    if (tuningString.length > 0) {
      tuningString += ', '
    }
    tuningString += 'Turbo-Tuning'
  }
  if (tuning.brake_tuning) {
    if (tuningString.length > 0) {
      tuningString += ', '
    }
    tuningString += 'Bremsen-Tuning'
  }
  if (tuningString.length === 0) {
    tuningString = 'Kein Tuning'
  }
  return tuningString
}
function checkNextInspection (lastInspection: string | null) {
  if (lastInspection === null) {
    return false
  }
  const lastInspectionDate = new Date(lastInspection)
  const nextInspectionDate = date.addToDate(lastInspectionDate, { days: 90 })
  // get the amount of days between now and the next inspection
  const daysToNextInspection = date.getDateDiff(nextInspectionDate, new Date(), 'days')
  // if the days are smaller than 15, return true
  return daysToNextInspection < 15
}
function sortUserVehicles (sortType: string) {
  // sort by id before sorting by the selected type
  userVehicles.value = userVehicles.value.sort((a, b) => a.id - b.id)
  switch (sortType) {
    case 'vehicle':
      // if vehicle or vehicle.name is null, skip
      userVehicles.value = userVehicles.value.sort((a, b) => {
        if (a.vehicle === null || b.vehicle === null || a.vehicle === undefined || b.vehicle === undefined) {
          return 0
        }
        if (a.vehicle.name < b.vehicle.name) {
          return -1
        }
        if (a.vehicle.name > b.vehicle.name) {
          return 1
        }
        return 0
      })
      break
    case 'manufacturer':
      // sort my Manufacturer[vehicle.manufacturer] string alphabetically
      userVehicles.value = userVehicles.value.sort((a, b) => {
        if (a.vehicle === null || b.vehicle === null || a.vehicle === undefined || b.vehicle === undefined) {
          return 0
        }
        return a.vehicle.manufacturer.name.localeCompare(b.vehicle.manufacturer.name) - b.vehicle.manufacturer.name.localeCompare(a.vehicle.manufacturer.name)
      })
      break
    case 'inspection_date':
      userVehicles.value = userVehicles.value.sort((a, b) => {
        if ((a.inspection_date === null || a.inspection_date === undefined) && b.inspection_date !== null && b.inspection_date !== undefined) {
          return 1
        }
        if ((b.inspection_date === null || b.inspection_date === undefined) && a.inspection_date !== null && a.inspection_date !== undefined) {
          return -1
        }
        if (a.inspection_date === null || b.inspection_date === null || a.inspection_date === undefined || b.inspection_date === undefined) {
          return 0
        }
        return new Date(a.inspection_date).getTime() - new Date(b.inspection_date).getTime()
      })
      break
    case 'tuning':
      // sort if any tuning is set
      userVehicles.value = userVehicles.value.sort((a, b) => {
        if (a.tuning === null || a.tuning === undefined || a.tuning.id === -1) {
          return 1
        }
        if (b.tuning === null || b.tuning === undefined || b.tuning.id === -1) {
          return -1
        }
        return 0
      })
      break
  }
}
function showCreateDialog () {
  $q.dialog({
    component: CreateNewUserVehicleDialog
  })
    .onOk((newVehicle: IUserVehicle) => createNewUserVehicle(newVehicle))
}
function editVehicles () {
  if (vehiclesForEdit.value.length < 1) return
  api.patch('/api/userVehicle/update', {
    vehicles: vehiclesForEdit.value
  })
    .then(() => {
      vehiclesForEdit.value = []
      getAllUserVehicles()
    })
    .catch((err) => {
      console.error(err)
    })
}
function removeVehicle (vehicle: IUserVehicle) {
  if (vehicle.id === null || vehicle.id === undefined) {
    return
  }
  $q.dialog({
    component: RemoveUserVehicleDialog
  })
    .onOk((givenReason: string | null) => {
      api.patch('/api/userVehicle/delete', {
        id: vehicle.id,
        reason: givenReason ?? null
      })
        .then(() => {
          getAllUserVehicles()
        })
        .catch((err) => {
          console.error(err)
        })
    })
}
function checkIfAnyTuningSet (tuning: IUserVehicleTuning | null) {
  if (tuning === null || tuning === undefined || tuning.id === -1) {
    return false
  }
  return tuning.engine_tuning || tuning.transmission_tuning || tuning.turbo_tuning || tuning.brake_tuning
}
function customDateFormat (currentDate: string | null | undefined) {
  if (currentDate === null || currentDate === undefined) {
    return 'Kein Datum'
  }
  // check if the date is in the format 'DD.MM.YYYY'
  if (currentDate.includes('.')) {
    return currentDate
  }
  return date.formatDate(currentDate, 'DD.MM.YYYY')
}
</script>

<style scoped>

</style>
