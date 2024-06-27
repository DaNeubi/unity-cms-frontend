<template>
  <div class="column q-gutter-sm">
    <div class="row items-center justify-start">
      <create-something-new-button text="Funkfrequenz erstellen" @click="createRadio()" class="q-mr-md"
                                   v-if="canCreateRadio"/>
      <edit-something-button text="Änderungen speichern" :disabled="radiosForEdit.length === 0" class="q-mr-md"
                             v-if="canEditRadio" @click="applyRadioChanges()"/>
      <delete-something-button text="Funkfrequenz(en) löschen" :disabled="radiosForDelete.length === 0"
                               v-if="canDeleteRadio" @click="deleteRadio()"/>
    </div>
    <q-table :rows="radios" :loading="loading" class="full-width cms-sticky-header-table default-table-height"
             row-key="id" :pagination=" { rowsPerPage: 0 }" :columns="columns"
             :selection="canDeleteRadio ? 'single' : 'none'" v-model:selected="radiosForDelete"
             :title="'Funkfrequenzen (' + radios.length + '/' + radioLimit() + ')'">
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-if="canDeleteRadio">
            <q-checkbox color="accent"
                        v-model="props.selected"/>
          </q-td>
          <q-td v-for="headerVal in columns" :key="headerVal.name" :props="props">
            <div v-if="headerVal.name === 'name'" class="row items-center justify-end cursor-pointer">
              {{ props.row[headerVal.name] }}
              <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope" buttons label-set="Speichern"
                            label-cancel="Abbrechen" @save="(val) => editRadio(val, props.row, headerVal.name)"
                            v-if="canEditRadio">
                <q-input v-model="scope.value" dense autofocus label="Name" counter maxlength="64" outlined/>
              </q-popup-edit>
            </div>
            <div v-if="headerVal.name === 'frequency'" class="row items-center justify-end cursor-pointer">
              {{ props.row[headerVal.name] }}
              <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope" buttons label-set="Speichern"
                            label-cancel="Abbrechen" @save="(val) => editRadio(val, props.row, headerVal.name)"
                            v-if="canEditRadio">
                <q-input v-model.number="scope.value" label="Frequenz" dense autofocus counter
                         maxlength="64" outlined/>
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
import { api } from 'boot/axios'
import { onMounted, ref, watch } from 'vue'
import ICompanyRadio from 'src/misc/interfaces/Radio/ICompanyRadio'
import ICompany from 'src/misc/interfaces/Company/ICompany'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import { useQuasar } from 'quasar'
import CreateRadioDialog from 'components/generalManagement/Radio/dialog/CreateRadioDialog.vue'
import FormatDateTime from '../../../misc/functions/FormatDateTime'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'
import DeleteSomethingButton from 'components/general/buttons/DeleteSomethingButton.vue'

const props = defineProps({
  companyId: {
    type: Number,
    required: true
  },
  canCreateRadio: {
    type: Boolean,
    default: false,
    required: true
  },
  canEditRadio: {
    type: Boolean,
    default: false,
    required: true
  },
  canDeleteRadio: {
    type: Boolean,
    default: false,
    required: true
  }
})
const radios = ref<ICompanyRadio[]>([])
const loading = ref<boolean>(false)
const loadingRadioLimit = ref<boolean>(false)
const companyForRadioLimit = ref<ICompany>()
const $q = useQuasar()
const columns = [
  { name: 'name', label: 'Name', field: 'name' },
  { name: 'frequency', label: 'Frequenz', field: 'frequency' },
  { name: 'created_at', label: 'Erstellt am', field: 'created_at' },
  { name: 'updated_at', label: 'Aktualisiert am', field: 'updated_at' }
]
const radiosForEdit = ref<ICompanyRadio[]>([])
const radiosForDelete = ref<ICompanyRadio[]>([])

onMounted(() => {
  getRadios()
  getCompanyForRadioLimit()
})

watch(() => props.companyId, () => {
  getRadios()
  getCompanyForRadioLimit()
})

function getRadios () {
  if (props.companyId <= 0) return
  loading.value = true
  api.get('/api/radio/all/' + props.companyId)
    .then((res) => {
      radios.value = res.data
      loading.value = false
    })
    .catch((err) => {
      console.error(err)
    })
}
function getCompanyForRadioLimit () {
  if (props.companyId <= 0) return
  loadingRadioLimit.value = true
  api.get('/api/radio/companyRadioLimit/' + props.companyId)
    .then((res) => {
      companyForRadioLimit.value = res.data
      loadingRadioLimit.value = false
    })
    .catch((err) => {
      console.error(err)
    })
}
function radioLimit () {
  if (companyForRadioLimit.value === undefined) return 0
  return companyForRadioLimit.value.radio_limit
}
function createRadio () {
  $q.dialog({
    component: CreateRadioDialog
  })
    .onOk((newRadio: ICompanyRadio | undefined) => {
      if (newRadio === undefined) return
      api.post('/api/radio/create/' + props.companyId, {
        name: newRadio.name,
        frequency: newRadio.frequency
      })
        .then((res) => {
          radios.value.push(res.data)
        })
        .catch((err) => {
          console.error(err)
        })
    })
}
function editRadio (newValue: string | number, radio: ICompanyRadio, valueChanged: string) {
  radio[valueChanged] = newValue
  // check if the radio is already in the array
  const index = radiosForEdit.value.findIndex((r) => r.id === radio.id)
  if (index === -1) {
    radiosForEdit.value.push(radio)
  }
}
function applyRadioChanges () {
  if (radiosForEdit.value.length === 0) return
  api.patch('/api/radio/edit/' + props.companyId, {
    radios: radiosForEdit.value
  })
    .then(() => {
      radiosForEdit.value = []
    })
    .catch((err) => {
      console.error(err)
    })
}
function deleteRadio () {
  if (radiosForDelete.value.length === 0) return
  $q.dialog({
    title: 'Funkfrequenz löschen',
    message: 'Möchtest du die ausgewählte Funkfrequenz wirklich löschen?',
    ok: 'Ja',
    cancel: 'Nein'
  })
    .onOk(() => {
      api.post('/api/radio/delete/' + props.companyId, {
        ...radiosForDelete.value[0]
      })
        .then(() => {
          radios.value = radios.value.filter((r) => !radiosForDelete.value.includes(r))
          radiosForDelete.value = []
        })
        .catch((err) => {
          console.error(err)
        })
    })
}
</script>

<style scoped>

</style>
