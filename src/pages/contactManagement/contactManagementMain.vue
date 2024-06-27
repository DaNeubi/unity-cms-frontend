<template>
  <div class="full-width" style="margin-top: 1.5vh;">
    <q-card bordered style="height: 86vh;">
      <q-card-section>
        <q-table virtual-scroll :columns="columns" :rows="rows" :loading="loading" :pagination="{ rowsPerPage: 20 }"
                 loading-label="Hole daten..." row-key="id">
          <template v-slot:top>
            <div class="row full-width q-gutter-md items-center">
              <div class="col-auto">
                <div class="text-h4">Personenkartei</div>
              </div>
              <div class="col-auto">
                <q-btn label="Person erstellen" rounded icon="mdi-plus" v-if="canCreateNewPerson"
                       @click="switchToCreatePerson()" color="accent"/>
              </div>
              <div class="col-auto">
                <q-btn label="Person suchen" rounded @click="showSearchDialog()" icon="mdi-magnify" color="accent"/>
              </div>
              <div class="col-auto">
                <q-btn label="Zuletzt bearbeitete Akten laden" rounded @click="loadDefaultPersons()"
                       :disable="lastLoadedFrontRowPersons" icon="mdi-reload" color="accent"/>
              </div>
            </div>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props" v-on:click="switchToPerson(props.row.id)">
              <q-td v-for="headerVal in columns" :key="headerVal.name" :props="props">
                <div v-if="headerVal.name === 'updated_at'">
                  {{ FormatDateTime(props.row[headerVal.name]) }}
                </div>
                <div v-else-if="headerVal.name === 'first_name'">
                  {{ (props.row.animal ? props.row[headerVal.name] + ' 🐶🐱🐰' : props.row[headerVal.name])
                + (props.row.person_medical_status?.dead === 1 ? ' 💀' : '')
                + (canSeePsychological ? props.row.person_medical_status?.psychological_treatment === 1 ? ' 📌' : '' : '') }}
                </div>
                <div v-else-if="headerVal.name === 'last_name'">
                  {{ props.row.birth_last_name !== null ? props.row[headerVal.name] + ' (ehem. ' + props.row.birth_last_name + ')' : props.row[headerVal.name] }}
                </div>
                <div v-else>
                  {{ props.row[headerVal.name] }}
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import IPerson from 'src/misc/interfaces/Person/IPerson'
import { computed, onMounted, ref, watch } from 'vue'
import { companyStore } from 'stores/companyStore'
import { api } from 'src/boot/axios'
import FormatDateTime from '../../misc/functions/FormatDateTime'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import ContactManagementSearchPersonDialog from 'src/components/contactManagement/Dialog/ContactManagementSearchPersonDialog.vue'
import AssignPolicies from 'src/misc/functions/policies/Policies'

const loading = ref<boolean>(true)
const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
const canCreateNewPerson = ref<boolean>(false)
const canSeePsychological = ref<boolean>(false)
const personSearchResult = ref<IPerson[]>([])
const lastLoadedFrontRowPersons = ref<boolean>(false)
const $q = useQuasar()
watch(companyId, () => {
  getPermissions()
  getFrontRowPersons()
})
const columns = [
  { name: 'first_name', label: 'Vorname', field: 'first_name' },
  { name: 'last_name', label: 'Nachname', field: 'last_name' },
  { name: 'updated_at', label: 'Zuletzt bearbeitet', field: 'updated_at' }
]
const rows = ref<IPerson[]>([])
const router = useRouter()
onMounted(async () => {
  // get the permissions
  getPermissions()
  // get the front page persons
  getFrontRowPersons()
})
function getFrontRowPersons () {
  if (companyId.value === 0) return
  lastLoadedFrontRowPersons.value = true
  loading.value = true
  api.get('/api/person/getCustomAmount/' + companyId.value)
    .then((response) => {
      rows.value = response.data.persons
      loading.value = false
    })
    .catch((error) => {
      console.error(error)
    })
}
function getPermissions () {
  if (companyId.value === 0) return
  api.get('/api/policies/contactManagement/base/' + companyId.value)
    .then((res) => {
      AssignPolicies([
        { policyName: 'ContactManagement_Create', policyToAssign: canCreateNewPerson },
        { policyName: 'ContactManagement_Psychological', policyToAssign: canSeePsychological }
      ], res.data.contactManagementPolicies)
    })
    .catch((error) => {
      console.error(error)
    })
}
function switchToPerson (personId: number) {
  router.push('/contact-management/person/' + companyId.value + '/' + personId)
}
function switchToCreatePerson () {
  lastLoadedFrontRowPersons.value = false
  router.push('/contact-management/person-create/' + companyId.value)
}
function loadDefaultPersons () {
  rows.value = []
  getFrontRowPersons()
}
function showSearchDialog () {
  $q.dialog({
    component: ContactManagementSearchPersonDialog,
    ok: {
      push: true
    }
  })
    .onOk((persons: IPerson[]) => {
      lastLoadedFrontRowPersons.value = false
      personSearchResult.value = persons
      // clear the default result
      rows.value = []
      // add the new result
      for (let i = 0; i < personSearchResult.value.length; i++) {
        rows.value.push(personSearchResult.value[i])
      }
    })
}
</script>

<style scoped>

</style>
