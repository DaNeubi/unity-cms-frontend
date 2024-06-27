<template>
  <div class="row q-gutter-md" v-if="!showModificationComponent">
    <create-something-new-button text="Neues Rennen erstellen" class="col-auto"
                                 icon="mdi-flag-plus"
                                 @create-something-new="changeToCreationComponent()"
                                 v-if="canCreateRace"/>
    <edit-something-button text="Rennen bearbeiten" class="col-auto"
                           icon="mdi-flag-checkered"
                           @create-something-new="changeToEditComponent()"
                           :disable="selectedRace?.length <= 0 || selectedRace === undefined"
                           v-if="canEditRace || canManageRaceParticipants || canManageRaceVehicles"/>
    <delete-something-button text="Rennen löschen" class="col-auto"
                             icon="mdi-flag-remove"
                             @create-something-new="deleteCheckForRace()"
                             :disable="selectedRace?.length <= 0 || selectedRace === undefined"
                             v-if="canDeleteRace"/>
    <q-table class="col-12 default-table-height cms-sticky-header-table" :columns="columns" row-key="id" v-model:selected="selectedRace"
             :pagination="{ rowsPerPage: 20 }"
             :filter="filterRace"
             :rows="races" :selection="canEditRace ? 'single' : 'none'" virtual-scroll>
      <template v-slot:top-right>
        <q-input borderless dense debounce="250" v-model="filterRace" placeholder="Rennen suchen...">
          <template v-slot:append>
            <q-icon name="mdi-magnify"/>
          </template>
        </q-input>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-if="canDeleteRace || canEditRace">
            <q-checkbox color="accent"
                        v-model="props.selected"/>
          </q-td>
          <q-td v-for="headerVal in columns"
                :key="headerVal.name" :props="props">
            <div v-if="headerVal.name === 'user'">
              {{ props.row.user?.first_name }} {{ props.row.user?.last_name }}
            </div>
            <div v-else-if="headerVal.name === 'date'">
              {{ FormatDateTime(props.row[headerVal.name], true) }}
            </div>
            <div v-else-if="headerVal.name === 'created_at'">
              {{ FormatDateTime(props.row[headerVal.name]) }}
            </div>
            <div v-else-if="headerVal.name === 'public'">
              {{ props.row[headerVal.name] ? 'Ja' : 'Nein' }}
            </div>
            <div v-else>
              {{ props.row[headerVal.name] }}
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
  <RaceModificationComponent v-else :company-id="companyId" :race="raceToEdit"
                             @cancel="cancelCreationOrEdit()"
                             ref="modificationComponent"
                             :can-manage-race-participants="canManageRaceParticipants"
                             :can-manage-race-vehicles="canManageRaceVehicles"/>
</template>

<script setup lang="ts">

import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'
import DeleteSomethingButton from 'components/general/buttons/DeleteSomethingButton.vue'
import { onMounted, ref, watch } from 'vue'
import RaceModificationComponent from 'components/race/RaceModificationComponent.vue'
import IRace from 'src/misc/interfaces/Race/IRace'
import { api } from 'boot/axios'
import FormatDateTime from '../../misc/functions/FormatDateTime'
import { useQuasar } from 'quasar'

const props = defineProps({
  companyId: {
    type: Number,
    required: true
  },
  canCreateRace: {
    type: Boolean,
    required: true
  },
  canEditRace: {
    type: Boolean,
    required: true
  },
  canDeleteRace: {
    type: Boolean,
    required: true
  },
  canMakeRacePublic: {
    type: Boolean,
    required: true
  },
  canManageRaceParticipants: {
    type: Boolean,
    required: true
  },
  canManageRaceVehicles: {
    type: Boolean,
    required: true
  }
})

defineExpose({
  handleReloadEvent
})

const showModificationComponent = ref<boolean>(false)
const columns = [{ label: 'Name', field: 'name', name: 'name' },
  { label: 'Renn Datum', field: 'date', name: 'date' },
  { label: 'Ort', field: 'location', name: 'location' },
  { label: 'Öffentlich einsehbar', field: 'public', name: 'public' },
  { label: 'Runden', field: 'laps', name: 'laps' },
  { label: 'Teilnehmer Limit', field: 'participants', name: 'participants' },
  { label: 'Erstellt von', field: 'user.first_name', name: 'user' },
  { label: 'Erstellt am', field: 'created_at', name: 'created_at' }
]
const races = ref<IRace[]>([])
const selectedRace = ref<IRace[]>()
const raceToEdit = ref<IRace|undefined>()
const modificationComponent = ref()
const $q = useQuasar()
const filterRace = ref('')

onMounted(() => {
  getAllRaces()
})

watch(() => props.companyId, () => {
  getAllRaces()
})

function getAllRaces () {
  if (props.companyId === undefined || props.companyId <= 0) return
  api.get('/api/race/all/' + props.companyId)
    .then((res) => {
      races.value = res.data
    })
    .catch((err) => {
      console.error(err)
    })
}
function deleteCheckForRace () {
  $q.dialog({
    title: 'Rennen löschen',
    message: 'Bre bischt du dir da siggi?',
    ok: {
      label: 'Na logisch alter',
      color: 'positive'
    },
    cancel: {
      label: 'Shit gut dass du fragst, hab gefettfingert😬',
      color: 'negative'
    },
    persistent: true
  }).onOk(() => {
    deleteSelectedRace()
  })
}
function deleteSelectedRace () {
  if (props.companyId === undefined || props.companyId <= 0) return
  if (selectedRace.value === undefined || selectedRace.value.length <= 0) return
  api.post('/api/race/delete/' + props.companyId, {
    race_id: selectedRace.value[0].id
  })
    .catch((err) => {
      console.error(err)
    })
}

function changeToCreationComponent () {
  raceToEdit.value = undefined
  showModificationComponent.value = true
}

function changeToEditComponent () {
  if (selectedRace.value === undefined || selectedRace.value.length <= 0) return
  raceToEdit.value = selectedRace.value[0]
  showModificationComponent.value = true
}

function cancelCreationOrEdit () {
  showModificationComponent.value = false
  selectedRace.value = []
  raceToEdit.value = undefined
}

function handleReloadEvent () {
  showModificationComponent.value = false
  selectedRace.value = []
  raceToEdit.value = undefined
  modificationComponent.value?.resetOnSuccess()
  getAllRaces()
}

</script>

<style scoped>

</style>
