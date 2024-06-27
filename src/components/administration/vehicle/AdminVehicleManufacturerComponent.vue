<template>
  <CreateSomethingNewButton text="Hersteller erstellen" @click="showCreateDialog()" v-if="canCreateManufacturer"/>
  <DeleteSomethingButton text="Hersteller löschen" @click="submitForDelete()" class="q-ml-md"
                         v-if="canDeleteManufacturer" :disable="manufacturersForDelete.length < 1"/>
  <EditSomethingButton text="Hersteller aktualisieren" @click="submitForEdit()" class="q-ml-md"
                       v-if="canEditManufacturer" :disable="manufacturersForEdit.length < 1"/>
  <q-table class="default-table-height q-mt-md full-width" virtual-scroll title="Alle Hersteller"
           :columns="columns" :rows="manufacturers" row-key="id" :loading="loading"
           :pagination="{ rowsPerPage: 100 }" :selection="canDeleteManufacturer ? 'multiple' : 'none'"
           v-model:selected="manufacturersForDelete" :filter="filterManufacturer">
    <template v-slot:top-right>
      <q-input borderless dense debounce="250" v-model="filterManufacturer" placeholder="Hersteller suchen...">
        <template v-slot:append>
          <q-icon name="mdi-magnify"/>
        </template>
      </q-input>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-if="canDeleteManufacturer">
          <q-checkbox color="accent" v-model="props.selected"/>
        </q-td>
        <q-td v-for="headerVal in columns" :key="headerVal.name" :props="props">
          <div v-if="headerVal.name === 'created_at' || headerVal.name === 'updated_at'">
            {{ FormatDateTime(props.row[headerVal.name]) }}
          </div>
          <div v-else-if="headerVal.name === 'name'" class="cursor-pointer">
            {{ props.row[headerVal.name] }}
            <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope" buttons label-set="Aktualisieren"
                          label-cancel="Abbrechen" v-if="canEditManufacturer"
                          @save="(val) => editManufacturer(val, props.row, headerVal.name)">
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
import IVehicleManufacturer from 'src/misc/interfaces/Vehicle/IVehicleManufacturer'
import { useQuasar } from 'quasar'
import CreateNewManufacturerDialog from 'components/administration/vehicle/dialog/CreateNewManufacturerDialog.vue'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import { api } from 'boot/axios'
import FormatDateTime from '../../../misc/functions/FormatDateTime'
import DeleteSomethingButton from 'components/general/buttons/DeleteSomethingButton.vue'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'

const manufacturers = ref<IVehicleManufacturer[]>([])
const loading = ref<boolean>(false)
const manufacturersForEdit = ref<IVehicleManufacturer[]>([])
const manufacturersForDelete = ref<IVehicleManufacturer[]>([])
const filterManufacturer = ref<string>('')
const $q = useQuasar()
const columns = [{ name: 'name', label: 'Name', field: 'name' },
  { name: 'created_at', label: 'Erstellt am', field: 'created_at' },
  { name: 'updated_at', label: 'Aktualisiert am', field: 'updated_at' }]
defineProps({
  canCreateManufacturer: {
    type: Boolean,
    required: true,
    default: false
  },
  canDeleteManufacturer: {
    type: Boolean,
    required: true,
    default: false
  },
  canEditManufacturer: {
    type: Boolean,
    required: true,
    default: false
  }
})

onMounted(() => {
  getAllManufacturers()
})

function getAllManufacturers () {
  loading.value = true
  api.get('/api/administration/manufacturers/all')
    .then((response) => {
      manufacturers.value = response.data
      loading.value = false
    })
    .catch((error) => {
      console.error(error)
    })
}
function showCreateDialog () {
  $q.dialog({
    component: CreateNewManufacturerDialog
  })
    .onOk((newManufacturer: IVehicleManufacturer) => {
      api.post('/api/administration/manufacturers/create', {
        name: newManufacturer.name
      })
        .then((response) => {
          manufacturers.value.push(response.data)
        })
        .catch((error) => {
          console.error(error)
        })
    })
}
function editManufacturer (newValue: string, manufacturer: IVehicleManufacturer, valueChanged: string) {
  manufacturer[valueChanged] = newValue
  if (manufacturersForEdit.value.find((value) => value.id === manufacturer.id) === undefined) {
    manufacturersForEdit.value.push(manufacturer)
  }
}
function submitForEdit () {
  if (manufacturersForEdit.value?.length < 1) return
  api.patch('/api/administration/manufacturers/edit', {
    manufacturers: manufacturersForEdit.value
  })
    .then(() => {
      manufacturersForEdit.value = []
    })
    .catch((error) => {
      console.error(error)
    })
}
function submitForDelete () {
  if (manufacturersForDelete.value?.length < 1) return
  api.post('/api/administration/manufacturers/delete', {
    manufacturers: manufacturersForDelete.value
  })
    .then(() => {
      manufacturers.value = manufacturers.value.filter((value) => !manufacturersForDelete.value.includes(value))
      manufacturersForDelete.value = []
    })
    .catch((error) => {
      console.error(error)
    })
}
</script>

<style scoped>

</style>
