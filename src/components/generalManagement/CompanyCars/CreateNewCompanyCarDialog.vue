<template>
  <q-dialog ref="dialogRef" transition-show="scale" transition-hide="scale" persistent>
    <q-card>
      <q-card-section>
        <div class="text-h5">Neues Firmenfahrzeug erstellen</div>
      </q-card-section>
      <q-card-section class="column q-gutter-md">
        <q-select label="Aus Fahrzeugen auswählen"
                  v-model="selectedVehicle"
                  :options="availableOptionVehicles"
                  input-debounce="0"
                  @filter="filterFn"
                  use-input
                  fill-input
                  option-value="id"
                  clearable
                  :option-label="(opt: IVehicle) => opt.name + ' | ' + opt?.manufacturer?.name"
                  display-value=""
                  style="width: 20vw;"
                  outlined>
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                Keine Fahrzeuge gefunden
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-input label="Nummernschild" outlined v-model="licensePlate" counter maxlength="16" reactive-rules
                 :rules="[val => val.length > 0 || 'Pflichtfeld']"/>
        <q-input label="Meilenstand"
                 outlined
                 type="number"
                 v-model.number="milesOfCar"
                 :rules="[
                   val => decimalPlaces(val) <= 3 || 'Maximal 3 Nachkommastellen'
                 ]"/>
        <q-toggle v-model="winterTires"
                  label="Winterreifen drauf?"/>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="createNewCompanyCar"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'
import { useDialogPluginComponent } from 'quasar'
import IVehicle from 'src/misc/interfaces/Vehicle/IVehicle'
import { api } from 'src/boot/axios'
import Manufacturer from 'src/misc/Enums/Vehicle/Manufacturer'

export default defineComponent({
  name: 'CreateNewCompanyCarDialog',
  computed: {
    Manufacturer () {
      return Manufacturer
    }
  },
  components: { DialogActionComponent },
  emits: [
    ...useDialogPluginComponent.emits
  ],
  setup () {
    const { dialogRef, onDialogOK } = useDialogPluginComponent()
    const selectedVehicle = ref<IVehicle>()
    const availableVehicles = ref<IVehicle[]>()
    const availableOptionVehicles = ref<IVehicle[]>()
    const milesOfCar = ref<number>(0)
    const licensePlate = ref<string>()
    const winterTires = ref<boolean>(false)
    function filterFn (val: string, update: (val: () => void) => void) {
      if (availableVehicles.value !== undefined) {
        update(() => {
          const needle = val.toLowerCase()
          availableOptionVehicles.value =
            availableVehicles.value?.filter((vehicle) => vehicle.name.toLowerCase().indexOf(needle) > -1)
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
    function createNewCompanyCar () {
      if (selectedVehicle.value === undefined || licensePlate.value === undefined || licensePlate.value === '') {
        return
      }
      onDialogOK({
        vehicle_id: selectedVehicle.value.id,
        deleted: false,
        miles: milesOfCar.value,
        license_plate: licensePlate.value,
        winter_tires: winterTires.value,
        inspection_date: new Date()
      })
    }
    function decimalPlaces (num: number) {
      const match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/)
      if (!match) { return 0 }
      return Math.max(0,
        // Number of digits right of decimal point.
        (match[1] ? match[1].length : 0) -
        // Adjust for scientific notation.
        (match[2] ? +match[2] : 0))
    }
    return {
      dialogRef,
      selectedVehicle,
      availableVehicles,
      filterFn,
      createNewCompanyCar,
      milesOfCar,
      licensePlate,
      winterTires,
      decimalPlaces,
      availableOptionVehicles
    }
  }
})
</script>

<style scoped>

</style>
