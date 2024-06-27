<template>
  <CreateSomethingNewButton text="Neuen Kraftstoff erstellen" @click="showCreateDialog()" v-if="canCreateFuelType"/>
  <DeleteSomethingButton text="Kraftstoff löschen" @click="submitForDelete()" class="q-ml-md"
                         v-if="canDeleteFuelType" :disable="fuelTypesForDelete.length < 1"/>
  <EditSomethingButton text="Kraftstoff aktualisieren" @click="submitForEdit()" class="q-ml-md"
                        v-if="canEditFuelType" :disable="fuelTypesForEdit.length < 1"/>
  <q-table class="default-table-height q-mt-md full-width" virtual-scroll title="Alle Kraftstoffe"
           :columns="columns" :rows="fuelTypes" row-key="id" :loading="loading" :pagination="{ rowsPerPage: 100 }"
           :selection="canDeleteFuelType ? 'multiple' : 'none'" v-model:selected="fuelTypesForDelete"
           :filter="filterFuelType">
    <template v-slot:top-right>
      <q-input borderless dense debounce="250" v-model="filterManufacturer" placeholder="Hersteller suchen...">
        <template v-slot:append>
          <q-icon name="mdi-magnify"/>
        </template>
      </q-input>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-if="canDeleteFuelType">
          <q-checkbox color="accent" v-model="props.selected"/>
        </q-td>
        <q-td v-for="headerVal in columns" :key="headerVal.name" :props="props">
          <div v-if="headerVal.name === 'created_at' || headerVal.name === 'updated_at'">
            {{ FormatDateTime(props.row[headerVal.name]) }}
          </div>
          <div v-else-if="headerVal.name === 'name'" class="cursor-pointer">
            {{ props.row[headerVal.name] }}
            <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope" label-set="Aktualisieren"
                          label-cancel="Abbrechen" v-if="canEditFuelType" buttons
                          @save="(val) => editFuelType(val, props.row, headerVal.name)">
              <q-input v-model="scope.value" dense autofocus maxlength="100" counter outlined/>
            </q-popup-edit>
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">

import { onMounted, ref } from 'vue'
import IVehicleFuelType from 'src/misc/interfaces/Vehicle/IVehicleFuelType'
import { useQuasar } from 'quasar'
import FormatDateTime from 'src/misc/functions/FormatDateTime'
import { api } from 'boot/axios'
import CreateNewFuelTypeDialog from 'components/administration/vehicle/dialog/CreateNewFuelTypeDialog.vue'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'
import DeleteSomethingButton from 'components/general/buttons/DeleteSomethingButton.vue'

const fuelTypes = ref<IVehicleFuelType[]>([])
const fuelTypesForEdit = ref<IVehicleFuelType[]>([])
const fuelTypesForDelete = ref<IVehicleFuelType[]>([])
const loading = ref<boolean>(false)
const filterFuelType = ref<string>('')
const $q = useQuasar()
const columns = [{ name: 'name', label: 'Name', field: 'name' },
  { name: 'created_at', label: 'Erstellt am', field: 'created_at' },
  { name: 'updated_at', label: 'Aktualisiert am', field: 'updated_at' }]

defineProps({
  canCreateFuelType: {
    type: Boolean,
    required: true,
    default: false
  },
  canDeleteFuelType: {
    type: Boolean,
    required: true,
    default: false
  },
  canEditFuelType: {
    type: Boolean,
    required: true,
    default: false
  }
})

onMounted(() => {
  getAllFuelTypes()
})

function getAllFuelTypes () {
  loading.value = true
  api.get('/api/administration/fuelTypes/all')
    .then((response) => {
      fuelTypes.value = response.data
      loading.value = false
    })
    .catch((error) => {
      console.error(error)
    })
}
function showCreateDialog () {
  $q.dialog({
    component: CreateNewFuelTypeDialog
  })
    .onOk((newFuelType: IVehicleFuelType) => {
      api.post('/api/administration/fuelTypes/create', {
        name: newFuelType.name
      })
        .then((response) => {
          fuelTypes.value.push(response.data)
        })
        .catch((error) => {
          console.error(error)
        })
    })
}
function editFuelType (newValue: string, fuelType: IVehicleFuelType, valueChanged: string) {
  fuelType[valueChanged] = newValue
  if (fuelTypesForEdit.value.find((value) => value.id === fuelType.id) === undefined) {
    fuelTypesForEdit.value.push(fuelType)
  }
}
function submitForEdit () {
  if (fuelTypesForEdit.value.length < 1) return
  api.patch('/api/administration/fuelTypes/edit', {
    fuelTypes: fuelTypesForEdit.value
  })
    .then(() => {
      fuelTypesForEdit.value = []
    })
    .catch((error) => {
      console.error(error)
    })
}
function submitForDelete () {
  if (fuelTypesForDelete.value.length < 1) return
  api.post('/api/administration/fuelTypes/delete', {
    fuelTypes: fuelTypesForDelete.value
  })
    .then(() => {
      fuelTypes.value = fuelTypes.value.filter((value) => !fuelTypesForDelete.value.includes(value))
      fuelTypesForDelete.value = []
    })
    .catch((error) => {
      console.error(error)
    })
}
</script>

<style scoped>

</style>
