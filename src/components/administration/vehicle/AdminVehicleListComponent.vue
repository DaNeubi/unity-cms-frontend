<template>
  <CreateSomethingNewButton icon="mdi-truck-plus" text="Neues Fahrzeug" @click="createNewVehicle"
                            v-if="canCreateNewVehicle"/>
  <q-btn icon="mdi-delete" label="Ausgewählte löschen" color="negative" class="q-ml-md"
         :disable="deleteButtonDisabled" v-if="canDeleteVehicle" @click="deleteVehicles()"/>
  <q-btn icon="mdi-update" label="Änderungen übernehmen" color="primary" class="q-ml-md"
         v-if="canEditVehicle" @click="commitEditingChanges()" :disable="vehiclesForEdit.length < 1"/>
  <div class="row items-center">
    <div>Preview Größe</div>
    <q-radio v-model="previewImageSize" label="100x100" :val="100"/>
    <q-radio v-model="previewImageSize" label="200x200" :val="200"/>
    <q-radio v-model="previewImageSize" label="300x300" :val="300"/>
    <q-radio v-model="previewImageSize" label="400x400" :val="400"/>
    <q-radio v-model="previewImageSize" label="500x500" :val="500"/>
  </div>
  <q-table class="default-table-height q-mt-md full-width" title="Alle Fahrzeuge"
           :columns="columns" :rows="rows" row-key="id"
           :pagination="{ rowsPerPage: 100 }" :selection="canDeleteVehicle ? 'multiple' : 'none'"
           v-model:selected="vehiclesForDeletion" :filter="filterVehicle" :loading="loading"
           @selection="(state) => state.added ? deleteButtonDisabled = false : deleteButtonDisabled = true">
    <template v-slot:no-data="{ message }">
      <div class="full-width row q-gutter-sm items-center">
        <q-icon size="2em" name="mdi-alert"/>
        <span>{{ message }}</span>
      </div>
    </template>
    <template v-slot:top-right>
      <q-input borderless dense debounce="250" v-model="filterVehicle" placeholder="Fahrzeug suchen...">
        <template v-slot:append>
          <q-icon name="mdi-magnify"/>
        </template>
      </q-input>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props" v-if="columns?.length > 0">
        <q-td v-if="canDeleteVehicle">
          <q-checkbox color="accent" v-model="props.selected"/>
        </q-td>
        <q-td v-for="headerVal in columns"
              :key="headerVal.name"
              :props="props">
          <span v-if="headerVal.name === 'name'"
                class="cursor-pointer">
            {{ props.row[headerVal.name] }}
            <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope" buttons
                          label-set="Aktualisieren" label-cancel="Abbrechen"
                          @save="(val) => editVehicle(val, props.row, headerVal.name)">
              <q-input v-model="scope.value" outlined label="Name des Fahrzeugs" maxlength="300" counter
                       :min="1"/>
            </q-popup-edit>
          </span>
          <span v-if="headerVal.name === 'price'"
            class="cursor-pointer">
            ${{ props.row[headerVal.name] }}
            <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope" buttons
                          label-set="Aktualisieren" label-cancel="Abbrechen"
                          @save="(val) => editVehicle(val, props.row, headerVal.name)">
              <q-input v-model.number="scope.value" outlined type="number" label="Preis des Fahrzeugs"/>
            </q-popup-edit>
          </span>
          <span v-if="headerVal.name === 'seat_amount'"
            class="cursor-pointer">
            {{ props.row[headerVal.name] }}
            <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope" buttons
                          label-set="Aktualisieren" label-cancel="Abbrechen"
                          @save="(val) => editVehicle(val, props.row, headerVal.name)">
              <q-input v-model.number="scope.value" outlined type="number" label="Anzahl Sitzplätze"/>
            </q-popup-edit>
          </span>
          <span v-if="headerVal.name === 'trunk'"
            class="cursor-pointer">
            {{ props.row[headerVal.name] }}
            <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope" buttons
                          label-set="Aktualisieren" label-cancel="Abbrechen"
                          @save="(val) => editVehicle(val, props.row, headerVal.name)">
              <q-input v-model.number="scope.value" outlined type="number" label="Kofferraum Platz"/>
            </q-popup-edit>
          </span>
          <span v-if="headerVal.name === 'glove_compartment'"
            class="cursor-pointer">
            {{ props.row[headerVal.name] }}
            <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope" buttons
                          label-set="Aktualisieren" label-cancel="Abbrechen"
                          @save="(val) => editVehicle(val, props.row, headerVal.name)">
              <q-input v-model.number="scope.value" outlined type="number" label="Handschuhfach Platz"/>
            </q-popup-edit>
          </span>
          <span v-if="headerVal.name === 'fuel_amount'"
            class="cursor-pointer">
            {{ props.row[headerVal.name] }} Liter
            <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope" buttons
                          label-set="Aktualisieren" label-cancel="Abbrechen"
                          @save="(val) => editVehicle(val, props.row, headerVal.name)">
              <q-input v-model.number="scope.value" outlined type="number" label="Tank Größe"/>
            </q-popup-edit>
          </span>
          <div v-if="headerVal.name === 'vehicle_fuel_type_id'"
            class="cursor-pointer full-height row items-center justify-end">
            {{ props.row?.fuel_type?.name }}
            <q-popup-edit :model-value="props.row?.fuel_type" v-slot="scope" buttons
                          label-set="Aktualisieren" label-cancel="Abbrechen"
                          @save="(val) => editVehicle(val.id, props.row, headerVal.name, val, 'fuel_type')">
            <q-select label="Kraftstoffart" hint="Kraftstoffart des Gefährtes" v-model="scope.value"
                      outlined :options="vehicleFuelTypes" :option-label="val => val.name"
                      :option-value="val => val.id" map-options/>
            </q-popup-edit>
          </div>
          <div v-else-if="headerVal.name === 'vehicle_manufacturer_id'"
            class="cursor-pointer full-height row items-center justify-end">
            {{ props.row?.manufacturer?.name }}
            <q-popup-edit :model-value="props.row?.manufacturer" v-slot="scope" buttons
                          label-set="Aktualisieren" label-cancel="Abbrechen"
                          @save="(val) => editVehicle(val.id, props.row, headerVal.name, val, 'manufacturer')">
            <q-select label="Hersteller" hint="Hersteller des Gefährtes" v-model="scope.value"
                      outlined :options="vehicleManufacturers" :option-label="val => val.name"
                      :option-value="val => val.id" map-options/>
            </q-popup-edit>
          </div>
          <div v-else-if="headerVal.name === 'vehicle_category_id'"
            class="cursor-pointer full-height row items-center justify-end">
            {{ props.row?.category?.name }}
            <q-popup-edit :model-value="props.row?.category" v-slot="scope" buttons
                          label-set="Aktualisieren" label-cancel="Abbrechen"
                          @save="(val) => editVehicle(val.id, props.row, headerVal.name, val, 'category')">
            <q-select label="Fahrzeugkategorie" hint="Kategorie des Gefährtes" v-model="scope.value"
                      outlined :options="vehicleCategories" :option-label="val => val.name"
                      :option-value="val => val.id" map-options/>
            </q-popup-edit>
          </div>
          <div v-else-if="headerVal.name === 'soon_car'"
                class="cursor-pointer">
                {{ props.row[headerVal.name] ? 'Ja' : 'Nein' }}
                <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope" buttons
                              label-set="Aktualisieren" label-cancel="Abbrechen"
                              @save="(val) => editVehicle(val, props.row, headerVal.name)">
                  <q-checkbox v-model="scope.value" color="accent" :true-value="1" :false-value="0"
                              label="Soon Auto"/>
                </q-popup-edit>
          </div>
          <div v-else-if="headerVal.name === 'image'" class="cursor-pointer" @click="openFileDialog(props.row)">
            <div v-if="vehicleEditedFilesIds.some((id) => id === props.row.id)">
              Wurde geändert und hochgeladen
            </div>
            <div v-else-if="props.row[headerVal.name] === null">
              Kein Bild
            </div>
            <div v-else>
              Bild vorhanden
              <q-tooltip class="text-body2">
                <q-img :src="backendServer + props.row[headerVal.name]" alt="Car Image"
                       :style="`max-height: ${previewImageSize}px; max-width: ${previewImageSize}px`"/>
                <div>{{ props.row[headerVal.name] }}</div>
                <div class="text-body2 text-orange-9">
                  Unterstützte Bildformate: PNG, WEBP; Maximalgröße: 4,2531 Megabyte; <a href="https://calculateaspectratio.com/" target="_blank">Aspect Ratio: 5:4 (z.B. 600x480)</a>
                </div>
              </q-tooltip>
            </div>
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import IVehicle from 'src/misc/interfaces/Vehicle/IVehicle'
import { api } from 'boot/axios'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import CreateNewVehicleDialog from 'components/administration/CreateNewVehicleDialog.vue'
import { useQuasar } from 'quasar'
import IVehicleManufacturer from 'src/misc/interfaces/Vehicle/IVehicleManufacturer'
import IVehicleCategory from 'src/misc/interfaces/Vehicle/IVehicleCategory'
import IVehicleFuelType from 'src/misc/interfaces/Vehicle/IVehicleFuelType'

const columns = [{ name: 'name', label: 'Name', field: 'name' },
  { name: 'price', label: 'Listenpreis', field: 'price' },
  { name: 'seat_amount', label: 'Sitzplätze', field: 'seat_amount' },
  { name: 'trunk', label: 'Kofferraum', field: 'trunk' },
  { name: 'glove_compartment', label: 'Handschuhfach', field: 'glove_compartment' },
  { name: 'fuel_amount', label: 'Tankgröße', field: 'fuel_amount' },
  { name: 'vehicle_fuel_type_id', label: 'Tankart', field: 'vehicle_fuel_type_id' },
  { name: 'vehicle_manufacturer_id', label: 'Hersteller', field: 'vehicle_manufacturer_id' },
  { name: 'vehicle_category_id', label: 'Fahrzeug Kategorie', field: 'vehicle_category_id' },
  { name: 'soon_car', label: 'Soon Auto', field: 'soon_car' },
  { name: 'image', label: 'Bild', field: 'image' }]
const rows = ref<IVehicle[]>([])
const $q = useQuasar()
const loading = ref(true)
const vehiclesForDeletion = ref<IVehicle[]>([])
const vehiclesForEdit = ref<IVehicle[]>([])
const vehicleManufacturers = ref<IVehicleManufacturer[]>([])
const vehicleCategories = ref<IVehicleCategory[]>([])
const vehicleFuelTypes = ref<IVehicleFuelType[]>([])
const deleteButtonDisabled = ref(true)
const filterVehicle = ref('')
const backendServer = process.env.BACKEND_SERVER + '/'
const previewImageSize = ref<number>(200)
const vehicleEditedFilesIds = ref<number[]>([])
defineProps({
  canEditVehicle: {
    type: Boolean,
    required: true
  },
  canDeleteVehicle: {
    type: Boolean,
    required: true
  },
  canCreateNewVehicle: {
    type: Boolean,
    required: true
  }
})

onMounted(() => {
  getAllAvailableVehicles()
  getAllManufacturers()
  getAllVehicleCategories()
  getAllFuelTypes()
})

function getAllAvailableVehicles () {
  loading.value = true
  api.get('/api/administration/vehicles/reduced')
    .then((response) => {
      rows.value = response.data.vehicles
      loading.value = false
    })
    .catch((e) => {
      console.error(e)
    })
}
function getAllManufacturers () {
  api.get('/api/administration/manufacturers/reduced')
    .then((response) => {
      vehicleManufacturers.value = response.data
    })
    .catch((e) => {
      console.error(e)
    })
}
function getAllVehicleCategories () {
  api.get('/api/administration/vehicleCategories/reduced')
    .then((response) => {
      vehicleCategories.value = response.data
    })
    .catch((e) => {
      console.error(e)
    })
}
function getAllFuelTypes () {
  api.get('/api/administration/fuelTypes/reduced')
    .then((response) => {
      vehicleFuelTypes.value = response.data
    })
    .catch((e) => {
      console.error(e)
    })
}
function editVehicle (newValue: string | number, vehicle: IVehicle, valueChanged: string, additionalNewValue?: string, additionalValueChanged?: string) {
  vehicle[valueChanged] = newValue
  if (additionalNewValue !== undefined && additionalValueChanged !== undefined) {
    vehicle[additionalValueChanged] = additionalNewValue
  }
  if (vehiclesForEdit.value?.find((v) => v.id === vehicle.id) === undefined) {
    if (vehiclesForEdit.value === undefined) {
      vehiclesForEdit.value = []
    }
    vehiclesForEdit.value?.push(vehicle)
  }
}
function commitEditingChanges () {
  api.patch('/api/administration/vehicles/edit', {
    vehicles: vehiclesForEdit.value
  })
    .then(() => {
      vehiclesForEdit.value = []
    })
    .catch((e) => {
      console.error(e)
    })
}
function deleteVehicles () {
  api.post('/api/administration/vehicles/delete', {
    vehicles: vehiclesForDeletion.value
  })
    .then(() => {
      vehiclesForDeletion.value = []
      deleteButtonDisabled.value = true
    })
    .catch((e) => {
      console.error(e)
    })
}
function createNewVehicle () {
  $q.dialog({
    component: CreateNewVehicleDialog,
    ok: {
      push: true,
      label: 'Erstellen'
    },
    componentProps: {
      manufacturers: vehicleManufacturers.value,
      fuelTypes: vehicleFuelTypes.value,
      categories: vehicleCategories.value
    }
  })
    .onOk((p: { newVehicle: IVehicle, file: File }) => {
      const carInformation = JSON.stringify({
        name: p.newVehicle.name,
        price: p.newVehicle.price,
        manufacturer: p.newVehicle.vehicle_manufacturer_id,
        seat_amount: p.newVehicle.seat_amount,
        trunk: p.newVehicle.trunk,
        glove_compartment: p.newVehicle.glove_compartment,
        fuel: p.newVehicle.vehicle_fuel_type_id,
        fuel_amount: p.newVehicle.fuel_amount,
        category: p.newVehicle.vehicle_category_id,
        soon_car: p.newVehicle.soon_car
      })
      api.post('/api/administration/vehicles/create', {
        carInfo: carInformation,
        file: p.file
      }, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then((res) => {
          rows.value.push(res.data)
        })
        .catch(error => {
          console.error(error)
        })
    })
}

function openFileDialog (vehicle: IVehicle) {
  // check if currently a file for this vehicle is being uploaded
  if (vehicleEditedFilesIds.value.find((id) => id === vehicle.id) !== undefined) {
    $q.notify({
      message: 'Es wird bereits ein Bild für dieses Fahrzeug hochgeladen! Warte bitte noch kurz🤏',
      color: 'warning',
      position: 'center'
    })
    return
  }
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = 'image/png, image/webp'
  fileInput.click()
  fileInput.addEventListener('change', () => {
    const currentFile = fileInput.files?.item(0)
    if (currentFile === undefined || currentFile === null) {
      return
    }
    if (currentFile.size > 4253100) {
      $q.notify({
        message: 'Das Bild darf nicht größer als 4,2531MB sein!',
        color: 'negative',
        position: 'center'
      })
      fileInput.files = null
    }
    // insert the file and number into the arrays
    if (vehicleEditedFilesIds.value.find((id) => id === vehicle.id) === undefined) {
      vehicleEditedFilesIds.value.push(vehicle.id)
    } else {
      // remove the file and the id
      const index = vehicleEditedFilesIds.value.indexOf(vehicle.id)
      vehicleEditedFilesIds.value.splice(index, 1)
      vehicleEditedFilesIds.value.push(vehicle.id)
    }
    uploadImage(vehicle, currentFile)
  })
}
function uploadImage (vehicle: IVehicle, inputFile: File) {
  if (vehicle === null || vehicle === undefined || inputFile === null) return
  api.post('/api/administration/vehicles/uploadImage', {
    vehicleId: vehicle.id,
    file: inputFile
  }, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => {
      vehicleEditedFilesIds.value = vehicleEditedFilesIds.value.filter((id) => id !== vehicle.id)
      // update the image
      vehicle.image = res.data
    })
    .catch((e) => {
      console.error(e)
    })
}
</script>

<style scoped>

</style>
