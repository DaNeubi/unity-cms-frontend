<template>
  <div class="column q-gutter-sm">
    <div class="row items-center justify-start">
      <create-something-new-button text="Status erstellen" class="q-mr-md" v-if="canCreate"
                                   @create-something-new="createStatus()"/>
      <edit-something-button text="Änderungen speichern" class="q-mr-md" v-if="canEdit"
                             @create-something-new="applyCarStatusChanges()" :disable="carStatusesForEdit.length === 0"/>
      <delete-something-button text="Status löschen" v-if="canDelete" :disable="carStatusesForDelete.length === 0"
                               @create-something-new="deleteCarStatus()"/>
    </div>
    <q-table :rows="carStatuses" :loading="loading" class="full-width cms-sticky-header-table default-table-height"
             row-key="id" :pagination=" { rowsPerPage: 0 }" :columns="columns"
             :selection="canDelete ? 'single' : 'none'" v-model:selected="carStatusesForDelete">
      <template v-slot:top>
        <div class="text-h6">
          Fahrzeugstatusse
          <q-tooltip class="text-body2">
            Ja du bist gemeint😏
          </q-tooltip>
        </div>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-if="canDelete">
            <q-checkbox color="accent"
                        v-model="props.selected"/>
          </q-td>
          <q-td v-for="headerVal in columns" :key="headerVal.name" :props="props">
            <div v-if="headerVal.name === 'name'" class="row items-center justify-end cursor-pointer">
              {{ props.row[headerVal.name] }}
              <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope" buttons label-set="Speichern"
                            label-cancel="Abbrechen" @save="(val) => editCarStatus(val, props.row, headerVal.name)"
                            v-if="canEdit">
                <q-input v-model="scope.value" dense autofocus label="Name" counter maxlength="64" outlined/>
              </q-popup-edit>
            </div>
            <div v-else-if="headerVal.name === 'driving_default' || headerVal.name === 'idle_default'">
              {{ props.row[headerVal.name] === 1 ? 'Ja' : 'Nein' }}
              <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope" buttons label-set="Speichern"
                            label-cancel="Abbrechen" @save="(val) => editCarStatus(val, props.row, headerVal.name)"
                            v-if="canEdit">
                <q-toggle v-model="scope.value" :false-value="0" :true-value="1" dense label="Standardfahrstatus"
                          color="accent"/>
              </q-popup-edit>
            </div>
            <div v-else>
              {{ FormatDateTime(props.row[headerVal.name]) }}
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">

import { onMounted, ref, watch } from 'vue'
import ICompanyCarStatus from 'src/misc/interfaces/CompanyCar/ICompanyCarStatus'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'
import DeleteSomethingButton from 'components/general/buttons/DeleteSomethingButton.vue'
import CreateCompanyCarStatusDialog from 'components/generalManagement/TaxMax/dialog/CreateCompanyCarStatusDialog.vue'
import FormatDateTime from '../../../misc/functions/FormatDateTime'

const props = defineProps({
  companyId: {
    type: Number,
    required: true
  },
  canCreate: {
    type: Boolean,
    required: true,
    default: false
  },
  canEdit: {
    type: Boolean,
    required: true,
    default: false
  },
  canDelete: {
    type: Boolean,
    required: true,
    default: false
  }
})
const carStatuses = ref<ICompanyCarStatus[]>([])
const loading = ref<boolean>(false)
const carStatusesForEdit = ref<ICompanyCarStatus[]>([])
const $q = useQuasar()
const carStatusesForDelete = ref<ICompanyCarStatus[]>([])
const columns = [
  { name: 'name', label: 'Name', field: 'name' },
  { name: 'driving_default', label: 'Standardfahrstatus', field: 'driving_default' },
  { name: 'idle_default', label: 'Standardwartestatus', field: 'idle_default' },
  { name: 'created_at', label: 'Erstellt am', field: 'created_at' },
  { name: 'updated_at', label: 'Aktualisiert am', field: 'updated_at' }
]

onMounted(() => {
  getCarStatuses()
})

watch(() => props.companyId, () => {
  getCarStatuses()
})

function getCarStatuses () {
  if (props.companyId <= 0) return
  loading.value = true
  api.get('/api/companyCarStatus/all/' + props.companyId)
    .then((res) => {
      carStatuses.value = res.data
      loading.value = false
    })
    .catch((err) => {
      console.error(err)
    })
}
function editCarStatus (newValue: string, status: ICompanyCarStatus, valueChanged: string) {
  status[valueChanged] = newValue
  // check if the status is already in the array
  const index = carStatusesForEdit.value.findIndex((s) => s.id === status.id)
  if (index === -1) {
    carStatusesForEdit.value.push(status)
  }
}
function applyCarStatusChanges () {
  if (carStatusesForEdit.value.length === 0) return
  api.patch('/api/companyCarStatus/edit/' + props.companyId, {
    status: carStatusesForEdit.value
  })
    .then(() => {
      carStatusesForEdit.value = []
    })
    .catch((err) => {
      console.error(err)
    })
}
function createStatus () {
  $q.dialog({
    component: CreateCompanyCarStatusDialog
  })
    .onOk((newStatus: ICompanyCarStatus | undefined) => {
      if (newStatus === undefined) return
      api.post('/api/companyCarStatus/create/' + props.companyId, {
        name: newStatus.name,
        driving_default: newStatus.driving_default,
        idle_default: newStatus.idle_default
      })
        .then((res) => {
          carStatuses.value.push(res.data)
        })
        .catch((err) => {
          console.error(err)
        })
    })
}
function deleteCarStatus () {
  if (carStatusesForDelete.value.length === 0) return
  api.post('/api/companyCarStatus/delete/' + props.companyId, {
    ...carStatusesForDelete.value[0]
  })
    .then(() => {
      carStatuses.value = carStatuses.value.filter((s) => s.id !== carStatusesForDelete.value[0].id)
      carStatusesForDelete.value = []
    })
    .catch((err) => {
      console.error(err)
    })
}
</script>

<style scoped>

</style>
