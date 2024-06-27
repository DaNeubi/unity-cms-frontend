<template>
  <q-dialog ref="dialogRef" transition-show="scale" transition-hide="scale" persistent>
    <q-card>
      <q-card-section>
        <div class="text-h5">Neues Fahrzeug erstellen</div>
      </q-card-section>
      <q-card-section>
        <div class="column q-gutter-lg">
          <q-input label="Name" hint="Name des Gefährtes" maxlength="300" counter v-model="vehicleName"
                   :rules="[val => !!val || 'Ohne Name wird das nix!']" outlined/>
          <q-input label="Listenpreis" hint="Listenpreis des Gefährtes. (Kann auch leer gelassen werden)"
                   type="number" v-model.number="vehiclePrice" outlined
                   :rules="[val => val !== undefined || 'Der Preis darf nicht leer sein', val => val >= 0 || 'Der Preis darf nicht negativ sein']"/>
          <q-select label="Hersteller" hint="Hersteller des Gefährtes" v-model="vehicleManufacturer"
                    :options="manufacturerOptions" :option-label="manufacturer => manufacturer.name" outlined/>
          <q-input label="Sitzplätze" hint="Anzahl der Sitzplätze des Gefährtes" type="number"
                   v-model.number="vehicleSeats" :max="255" maxlength="255" outlined/>
          <q-input label="Kofferraumgröße" hint="Größe des Kofferraums in der Anzahl" type="number"
                   v-model.number="vehicleTrunkSize" :max="65535" outlined/>
          <q-input label="Handschuhfachgröße" hint="Größe des Handschuhfachs in der Anzahl" type="number"
                   :max="65535" v-model.number="vehicleGloveCompartmentSize" outlined/>
          <q-select label="Kraftstoffart" hint="Kraftstoffart des Gefährtes" v-model="vehicleFuelType"
                    :options="vehicleFuelTypeOptions" :option-label="fuelType => fuelType.name" outlined/>
          <q-input label="Tankgröße" hint="Größe des Tanks in der Anzahl" type="number"
                   :max="65535" v-model.number="vehicleFuelSize" outlined/>
          <q-select label="Fahrzeugkategorie" hint="Klasse des Gefährtes (Kleinwagen, Mittelklasse, Oberklasse, etc.)"
                    v-model="vehicleCategory" :options="vehicleCategoryOptions" :option-label="category => category.name"
                    outlined/>
          <q-checkbox v-model="soonCar" label="Soon Auto"/>
          <div class="text-body2">
            Unterstützte Bildformate: PNG, WEBP; Maximalgröße: 4,2531 Megabyte; <a href="https://calculateaspectratio.com/" target="_blank">Aspect Ratio: 5:4 (z.B. 600x480)</a>
          </div>
          <q-btn color="accent" label="Bild hinzufügen" class="q-mt-md" outline @click="openFileDialog"/>
          <div>
            {{ providedFileName }}
            {{ providedFileSize > 0 ? '(' + providedFileSize?.toFixed(4) + ' MB)' : '' }}
          </div>
        </div>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="createNewVehicle()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { PropType, ref } from 'vue'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'
import { useDialogPluginComponent, useQuasar } from 'quasar'
import IVehicleManufacturer from 'src/misc/interfaces/Vehicle/IVehicleManufacturer'
import IVehicleFuelType from 'src/misc/interfaces/Vehicle/IVehicleFuelType'
import IVehicleCategory from 'src/misc/interfaces/Vehicle/IVehicleCategory'
import IVehicle from 'src/misc/interfaces/Vehicle/IVehicle'

defineEmits([...useDialogPluginComponent.emits])

const props = defineProps({
  manufacturers: {
    type: Array as PropType<IVehicleManufacturer[]>,
    required: true
  },
  fuelTypes: {
    type: Array as PropType<IVehicleFuelType[]>,
    required: true
  },
  categories: {
    type: Array as PropType<IVehicleCategory[]>,
    required: true
  }
})

const { dialogRef, onDialogOK } = useDialogPluginComponent()
const vehicleName = ref<string>()
const vehiclePrice = ref<number>()
const vehicleManufacturer = ref<IVehicleManufacturer>()
const vehicleSeats = ref<number>()
const vehicleTrunkSize = ref<number>()
const vehicleGloveCompartmentSize = ref<number>()
const vehicleFuelTypeOptions = props.fuelTypes
const vehicleFuelType = ref<IVehicleFuelType>()
const vehicleFuelSize = ref<number>()
const manufacturerOptions = props.manufacturers
const vehicleCategory = ref<IVehicleCategory>()
const vehicleCategoryOptions = props.categories
const soonCar = ref<boolean>(false)
const $q = useQuasar()
const providedFileName = ref<string>()
const providedFileSize = ref<number>(0)
const providedFile = ref<File>()

function createNewVehicle () {
  if (vehicleName.value === undefined || vehicleManufacturer.value === undefined || vehicleSeats.value === undefined ||
    vehicleTrunkSize.value === undefined || vehicleGloveCompartmentSize.value === undefined ||
    vehicleFuelType.value === undefined || vehicleFuelSize.value === undefined || vehicleCategory.value === undefined) {
    return
  }
  onDialogOK({
    newVehicle:
      {
        name: vehicleName.value,
        price: vehiclePrice.value,
        vehicle_manufacturer_id: vehicleManufacturer.value?.id,
        seat_amount: vehicleSeats.value,
        trunk: vehicleTrunkSize.value,
        glove_compartment: vehicleGloveCompartmentSize.value,
        vehicle_fuel_type_id: vehicleFuelType.value?.id,
        fuel_amount: vehicleFuelSize.value,
        vehicle_category_id: vehicleCategory.value?.id,
        soon_car: soonCar.value,
        id: 0
      } as IVehicle,
    file: providedFile.value
  })
}

function openFileDialog () {
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = 'image/png, image/webp'
  fileInput.click()
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.item(0)
    if (file === undefined || file === null) {
      return
    }
    if (file.size > 4253100) {
      $q.notify({
        message: 'Das Bild darf nicht größer als 4,2531MB sein!',
        color: 'negative',
        position: 'center'
      })
      fileInput.files = null
    }
    providedFileName.value = file.name
    // convert byte to megabyte
    providedFileSize.value = file.size / 1024 / 1024
    providedFile.value = file
  })
}
</script>

<style scoped>
a {
  color: var(--q-secondary);
}
</style>
