<template>
  <div class="column">
    <div class="row">
      <CreateSomethingNewButton icon="mdi-lock-plus" text="Neuen Rang erstellen"
                                @create-something-new="showCreateDialog()" v-if="canCreateRanks"/>
      <CreateSomethingNewButton icon="mdi-lock-remove"
                                class="q-ml-lg"
                                text="Ausgewählten Rang löschen"
                                :disable="deleteButtonDisabled"
                                @create-something-new="deleteRankConfirm()" v-if="canDeleteRanks"/>
    </div>
    <div class="row">
      <q-table
        class="default-table-height q-mt-md full-width cms-sticky-header-table" virtual-scroll
        :pagination="{ rowsPerPage: 20 }" title="Ränge" :columns="columns" no-data-label="Keine Daten vorhanden"
        :rows="rows" :loading="loading" loading-label="Daten werden abgerufen..."
        :selection="canDeleteRanks ? 'single' : 'none'" row-key="id" v-model:selected="selectedRanks"
        @selection="(state) => state.added ? deleteButtonDisabled = false : deleteButtonDisabled = true">
        <template v-slot:no-data="{ message }">
          <div class="full-width row q-gutter-sm items-center">
            <q-icon size="2em" name="mdi-alert"/>
            <span>{{ message }}</span>
          </div>
        </template>
        <template v-slot:loading>
          <q-inner-loading showing color="primary"/>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props" v-if="columns?.length > 0">
            <q-td v-if="canDeleteRanks">
              <q-checkbox color="accent" v-model="props.selected" :disable="props.row.weight === 100"/>
            </q-td>
            <q-td v-for="headerVal in columns"
                  :key="headerVal.name"
                  :props="props">
              <div v-if="headerVal.name === 'name'">
                {{ props.row[headerVal.name] }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              v-if="props.row.weight !== 100"
                              @save="(val) => updateRankName(val,props.row)">
                  <q-input v-model="scope.value" outlined label="Name des Ranges" type="text" counter
                           maxlength="128"/>
                </q-popup-edit>
                <q-popup-edit :model-value="props.row[headerVal.name]" v-else buttons label-set="Abbrechen 2"
                              label-cancel="Abbrechen">
                  <div class="text-body1">
                    Den Inhaber Rank kannst du nicht bearbeiten.
                  </div>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'weight'">
                {{ props.row[headerVal.name] }}
                <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope" buttons label-set="Aktualisieren"
                              label-cancel="Abbrechen" @save="(val) => updateRankWeight(val,props.row)">
                  <q-input v-model.number="scope.value" outlined label="Gewichtung des Ranges" type="number"
                           counter reactive-rules maxlength="128"
                           :rules="[val => val >= 0 || 'Die Gewichtung muss mindestens 0 sein.']" min="0"
                           hint="Ein Rang mit einer niedrigeren Gewichtung kann die Eigenschaften eines Rangs mit höherer Gewichtung nicht bearbeiten."/>
                </q-popup-edit>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import CreateNewRankDialogComponent from 'components/userManagement/dialogs/CreateNewRankDialogComponent.vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import { companyStore } from 'stores/companyStore'
import Rank from 'src/misc/classes/Rank/Rank'
import AssignPolicies from 'src/misc/functions/policies/Policies'

const columns = [
  { name: 'name', label: 'Name', field: 'name' },
  { name: 'weight', label: 'Gewichtung', field: 'weight' }
]
const $q = useQuasar()
const rows = ref<Rank[] | undefined>([])
const loading = ref(true)
const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
const canEditRanks = ref<boolean>(false)
const canViewRanks = ref<boolean>(false)
const canDeleteRanks = ref<boolean>(false)
const canCreateRanks = ref<boolean>(false)
const selectedRanks = ref<Rank[]>([])
const deleteButtonDisabled = ref<boolean>(true)
watch(companyId, () => {
  getPolicies()
})
onMounted(() => {
  getPolicies()
})
watch(canViewRanks, () => {
  getAllAvailableRanks()
})
function getPolicies () {
  if (companyId.value <= 0) return
  api.get('/api/policies/userManagement/ranks/' + companyId.value)
    .then((res) => {
      AssignPolicies([
        { policyName: 'UserManagement_Ranks_View_All', policyToAssign: canViewRanks },
        { policyName: 'UserManagement_Ranks_Edit', policyToAssign: canEditRanks },
        { policyName: 'UserManagement_Ranks_Delete', policyToAssign: canDeleteRanks },
        { policyName: 'UserManagement_Ranks_Create', policyToAssign: canCreateRanks }
      ], res.data.rankPolicies)
    })
    .catch((err) => {
      console.error(err)
    })
}
function updateRankWeight (newValue: number, rank: Rank) {
  if (companyId.value <= 0) { return }
  if (newValue === null || newValue === undefined || +newValue < 0) return
  api.patch('/api/ranks/update-rank/' + companyId.value, {
    rank_id: rank.id,
    weight: newValue,
    company_id: companyId.value
  })
    .then((res) => {
      const rankIndex = rows.value?.findIndex((r) => r.id === rank.id)
      if (rankIndex !== undefined && rankIndex >= 0) {
        rows.value.splice(rankIndex, 1, res.data as Rank)
      }
    })
    .catch((err) => {
      console.error(err)
    })
}
function updateRankName (newValue: string, rank: Rank) {
  if (companyId.value <= 0) { return }
  if (newValue === null || newValue === undefined || newValue === '') return
  api.patch('/api/ranks/update-rank/' + companyId.value, {
    rank_id: rank.id,
    name: newValue,
    company_id: companyId.value
  })
    .then((res) => {
      const rankIndex = rows.value?.findIndex((r) => r.id === rank.id)
      if (rankIndex !== undefined && rankIndex >= 0) {
        rows.value.splice(rankIndex, 1, res.data as Rank)
      }
    })
    .catch((err) => {
      console.error(err)
    })
}
function getAllAvailableRanks () {
  if (companyId.value <= 0) { return }
  api.get('/api/ranks/reduced/' + companyId.value)
    .then((response) => {
      rows.value = response.data.data
      loading.value = false
    })
    .catch((error) => {
      $q.notify({
        color: 'negative',
        position: 'top-right',
        message: 'Ränge konnten nicht abgerufen werden! ' + error,
        icon: 'mdi-alert-circle'
      })
      loading.value = false
      console.error(error)
    })
}
function deleteRankConfirm () {
  $q.dialog({
    title: 'Rang löschen',
    message: 'Möchtest du den ausgewählten Rang wirklich löschen?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    deleteRank()
  })
}
function deleteRank () {
  if (companyId.value <= 0) { return }
  selectedRanks.value?.forEach((rank: Rank) => {
    api.post('/api/ranks/delete/' + companyId.value, {
      rank_id: rank.id
    })
      .then(() => {
        const rankIndex = rows.value?.findIndex((r) => r.id === rank.id)
        if (rankIndex !== undefined && rankIndex >= 0) {
          rows.value?.splice(rankIndex, 1)
        }
      })
      .catch((err) => {
        console.error(err)
      })
  })
}
function showCreateDialog () {
  $q.dialog({
    component: CreateNewRankDialogComponent,
    ok: {
      push: true,
      label: 'Erstellen'
    }
  })
    .onOk((newRank: Rank) => {
      api.post('/api/ranks/add/' + cStore.companyId, {
        name: newRank.name,
        weight: newRank.weight
      })
        .then((res) => {
          rows.value?.push(res.data as Rank)
        })
        .catch((e) => {
          console.error(e)
        })
    })
}
</script>

<style scoped>

</style>
