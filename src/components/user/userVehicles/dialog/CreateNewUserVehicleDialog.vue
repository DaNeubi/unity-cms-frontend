<template>
  <q-dialog ref="dialogRef" transition-show="scale" transition-hide="scale">
    <q-card style="min-width: 400px;">
      <q-card-section>
        <div class="text-h5">
          Neues Fahrzeug hinzufügen
        </div>
      </q-card-section>
      <q-card-section>
        <div class="column q-gutter-sm">
          <q-select v-model="selectedVehicle" outlined label="Fahrzeug" :options="availableOptionVehicles" use-input
                    fill-input input-debounce="100" @filter="filterFn"
                    :option-label="(opt: IVehicle) => opt.name + ' | ' + opt.manufacturer?.name"/>
          <q-input v-model="licensePlate" outlined label="Nummernschild" counter maxlength="8"/>
          <q-input v-model.number="miles" outlined label="Meilenstand" type="number" :min="0"/>
          <q-checkbox v-model="winterTires" label="Winterreifen" :true-value="1" :false-value="0" color="accent"/>
          <q-input outlined v-model="inspectionDate" label="Letzte Inspektion" clearable>
            <template v-slot:prepend>
              <q-icon name="mdi-calendar" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="inspectionDate" mask="DD.MM.YYYY">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Schließen" color="primary" flat>
                      </q-btn>
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input v-model="parkingLocation" outlined label="Parkort" counter maxlength="255"/>
          <q-input v-model.number="purchasePrice" outlined label="Kaufpreis" type="number"/>
          <q-input outlined v-model="purchaseDate" label="Kaufdatum" clearable>
            <template v-slot:prepend>
              <q-icon name="mdi-calendar" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="purchaseDate" mask="DD.MM.YYYY">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Schließen" color="primary" flat>
                      </q-btn>
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-separator/>
          <q-checkbox v-model="engineTuning" label="Motor-Tuning" :true-value="1" :false-value="0" color="accent"/>
          <q-checkbox v-model="transmissionTuning" label="Getriebe-Tuning" :true-value="1" :false-value="0" color="accent"/>
          <q-checkbox v-model="turboTuning" label="Turbo-Tuning" :true-value="1" :false-value="0" color="accent"/>
          <q-checkbox v-model="brakeTuning" label="Bremsen-Tuning" :true-value="1" :false-value="0" color="accent"/>
        </div>
      </q-card-section>
      <q-card-section>
        <q-separator/>
      </q-card-section>
      <q-card-section>
        <div class="text-h6">Farben hinzufügen</div>
        <div class="row items-baseline q-gutter-md">
          <q-btn round dense color="positive" icon="mdi-plus" @click="addColor()" :disable="disableColorAddButton">
            <q-tooltip>Farbe hinzufügen</q-tooltip>
          </q-btn>
          <q-input v-model="newVehicleColorName" outlined label="Farbname" dense counter maxlength="64"/>
        </div>
        <q-color v-model="newVehicleColor" no-header-tabs no-footer format-model="hex" default-view="tune" flat bordered/>
        <div class="row items-center justify-start">
          <q-chip v-for="color in vehicleColors" :key="color.id" removable @remove="removeColor(color)">
            <span :style="`color: ${ color.hexa_color }`">
              {{ color.name }}
            </span>
          </q-chip>
        </div>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="saveNewVehicle()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { computed, onMounted, ref } from 'vue'
import IVehicle from 'src/misc/interfaces/Vehicle/IVehicle'
import { api } from 'boot/axios'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'
import IUserVehicle from 'src/misc/interfaces/UserVehicle/IUserVehicle'
import IUserVehicleTuning from 'src/misc/interfaces/UserVehicle/IUserVehicleTuning'
import IUserVehicleColor from 'src/misc/interfaces/UserVehicle/IUserVehicleColor'

defineEmits([...useDialogPluginComponent.emits])

const { dialogRef, onDialogOK } = useDialogPluginComponent()
const licensePlate = ref<string>('')
const availableVehicles = ref<IVehicle[]>([])
const availableOptionVehicles = ref<IVehicle[]>([])
const selectedVehicle = ref<IVehicle>()
const miles = ref<number>()
const winterTires = ref<number>(0)
const inspectionDate = ref<Date>()
const parkingLocation = ref<string>()
const purchasePrice = ref<number>()
const purchaseDate = ref<Date>()
const engineTuning = ref<number>(0)
const transmissionTuning = ref<number>(0)
const turboTuning = ref<number>(0)
const brakeTuning = ref<number>(0)
const vehicleColors = ref<IUserVehicleColor[]>([])
const newVehicleColor = ref<string>('')
const newVehicleColorName = ref<string>('')
const disableColorAddButton = computed(() => newVehicleColor.value.length === 0 || newVehicleColorName.value.length === 0)

onMounted(() => {
  newVehicleColor.value = randomColor()
})

function randomColor () {
  return '#' + Math.floor(Math.random() * 16777215).toString(16)
}
function filterFn (val: string, update: (val: () => void) => void) {
  if (availableVehicles.value !== undefined && availableVehicles.value.length > 0) {
    update(() => {
      const needle = val.toLowerCase()
      availableOptionVehicles.value = availableVehicles.value?.filter((vehicle: IVehicle) => vehicle.name.toLowerCase().indexOf(needle) > -1)
    })
    return
  }
  api.get('/api/vehicles/reduced')
    .then((response) => {
      availableVehicles.value = response.data.vehicles
      const needle = val.toLowerCase()
      availableOptionVehicles.value =
        availableVehicles.value?.filter((vehicle) => vehicle.name.toLowerCase().indexOf(needle) > -1)
    })
    .catch((error) => {
      console.error(error)
    })
}
function saveNewVehicle () {
  if (selectedVehicle.value === null || selectedVehicle.value === undefined) return
  onDialogOK({
    vehicle_id: selectedVehicle.value?.id,
    license_plate: licensePlate.value,
    miles: miles.value,
    winter_tires: winterTires.value,
    inspection_date: inspectionDate.value,
    parking_location: parkingLocation.value,
    purchase_price: purchasePrice.value,
    purchase_date: purchaseDate.value,
    tuning: {
      engine_tuning: engineTuning.value,
      transmission_tuning: transmissionTuning.value,
      turbo_tuning: turboTuning.value,
      brake_tuning: brakeTuning.value
    } as IUserVehicleTuning,
    colors: vehicleColors.value
  } as IUserVehicle)
}
function addColor () {
  vehicleColors.value.push({ hexa_color: newVehicleColor.value, id: Math.random(), name: newVehicleColorName.value } as IUserVehicleColor)
  newVehicleColorName.value = ''
  newVehicleColor.value = randomColor()
}
function removeColor (color: IUserVehicleColor) {
  vehicleColors.value = vehicleColors.value.filter((c) => c.id !== color.id)
}
</script>

<style scoped>

</style>
