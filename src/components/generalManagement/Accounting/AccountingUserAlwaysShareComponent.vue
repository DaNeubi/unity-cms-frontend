<template>
  <q-card>
    <q-card-section>
      <div class="column items-center">
        <h4 class="q-mt-none q-mb-sm">Mitarbeiter Immer-Anteil</h4>
      </div>
      <div>
        <span class="hint-text">
          Der Mitarbeiter Immer-Anteil bezieht sich wie der Mitarbeiteranteil auf den Gewinn abzüglich aller Nebenkosten.
          Der Mitarbeiter Immer-Anteil wird bei jeder Transaktion abgefragt und,
          je nach Einstellung dann auch auf die Transaktion angewendet.<br/>
          Der Immer-Anteil kann auf verschiedene Arten der Kassen aktiviert oder deaktiviert werden.
        </span>
      </div>
      <div class="row items-center justify-start q-gutter-lg q-mt-sm">
        <CreateSomethingNewButton icon="mdi-content-save"
                                  text="Neuen Mitarbeiter Immer Anteil erstellen"
                                  @create-something-new="showCreateDialog()"
                                  v-if="canCreateUserAlwaysShares"
                                  class="q-mt-md"/>
        <q-btn label="Ausgewähltes löschen"
               icon="mdi-delete"
               color="negative"
               v-if="canDeleteUserAlwaysShares"
               class="q-mt-md"
               :disable="selectedUserAlwaysShare === undefined || selectedUserAlwaysShare.length < 1"
               @click="deleteCompanyUserAlwaysShare()"/>
        <q-btn label="Änderungen übernehmen"
               icon="mdi-content-save"
               color="positive"
               v-if="canEditUserAlwaysShares"
               class="q-mt-md"
               :disable="userAlwaysSharesToUpdate.length < 1"
               @click="updateCompanyUserAlwaysShares()"/>
      </div>
      <q-table virtual-scroll
               title="Alle Mitarbeiter Immer-Anteile"
               class="q-mt-md cms-sticky-header-table"
               no-data-label="Keine Mitarbeiter Immer-Anteile gefunden"
               :columns="columns"
               :rows="rows"
               :loading="loading"
               loading-label="Daten werden abgerufen..."
               row-key="id"
               v-model:selected="selectedUserAlwaysShare"
               :selection="canDeleteUserAlwaysShares ? 'single' : 'none'">
        <template v-slot:body="props">
          <q-tr :props="props" v-if="columns?.length > 0">
            <q-td v-if="canDeleteUserAlwaysShares">
              <q-checkbox color="accent" v-model="props.selected"/>
            </q-td>
            <q-td v-for="headerVal in columns"
                  :key="headerVal.name"
                  :props="props">
              <span v-if="headerVal.name === 'id'">{{ props.row[headerVal.name] }}</span>
              <span v-if="headerVal.name === 'rank_id'"
                    class="cursor-pointer">
                {{ props.row.rank.name }}
                <q-popup-edit :model-value="props.row.rank"
                              v-slot="scope"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editCompanyUserAlwaysShare(val.id, props.row, headerVal.name)">
                  <q-select v-model="scope.value"
                            :options="ranks"
                            :option-value="option => option.id"
                            :option-label="option => option.name"
                            dense
                            outlined/>
                </q-popup-edit>
              </span>
              <span v-if="headerVal.name === 'always_share'"
                    class="cursor-pointer">
                {{ props.row[headerVal.name] + ' %' }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editCompanyUserAlwaysShare(val, props.row, headerVal.name)">
                  <q-input v-model.number="scope.value"
                           dense
                           :min="0"
                           :max="100"
                           type="number"
                           outlined>
                    <template v-slot:append>
                      <q-icon name="mdi-percent"/>
                    </template>
                  </q-input>
                </q-popup-edit>
              </span>
              <span v-if="headerVal.name === 'always_share_cash_register'"
                    class="cursor-pointer">
                {{ props.row[headerVal.name] === 1 ? 'Ja' : 'Nein' }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editCompanyUserAlwaysShare(val, props.row, headerVal.name)">
                  <q-toggle v-model="scope.value"
                            :true-value="1"
                            color="primary"
                            :false-value="0"
                            :label="`Aktiv: ${scope.value === 1 ? 'Ja' : 'Nein'}`"
                            checked-icon="mdi-check"
                            unchecked-icon="mdi-close"/>
                </q-popup-edit>
              </span>
              <span v-if="headerVal.name === 'created_at'">{{ FormatDateTime(props.row[headerVal.name]) }}</span>
              <span v-if="headerVal.name === 'updated_at'">{{ FormatDateTime(props.row[headerVal.name]) }}</span>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:no-data="{ message }">
          <div class="full-width row q-gutter-sm items-center">
            <q-icon size="2em" name="mdi-alert"/>
            <span>{{ message }}</span>
          </div>
        </template>
        <template v-slot:loading>
          <q-inner-loading showing color="primary"/>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import CreateNewUserAlwaysShareDialog from 'components/generalManagement/Dialogs/CreateNewUserAlwaysShareDialog.vue'
import { useQuasar } from 'quasar'
import Rank from 'src/misc/classes/Rank/Rank'
import { api } from 'boot/axios'
import FormatDateTime from '../../../misc/functions/FormatDateTime'
import { ICompanyUserAlwaysShare } from 'src/misc/interfaces/CompanyUserAlwaysShare/ICompanyUserAlwaysShare'

export default defineComponent({
  name: 'AccountingUserAlwaysShareComponent',
  methods: { FormatDateTime },
  components: { CreateSomethingNewButton },
  props: {
    companyId: {
      type: Number,
      required: true
    },
    updateNumber: {
      type: Number,
      required: true
    },
    canSeeUserAlwaysShares: {
      type: Boolean,
      required: true
    },
    canCreateUserAlwaysShares: {
      type: Boolean,
      required: true
    },
    canEditUserAlwaysShares: {
      type: Boolean,
      required: true
    },
    canDeleteUserAlwaysShares: {
      type: Boolean,
      required: true
    }
  },
  setup (props) {
    const $q = useQuasar()
    const rows = ref([])
    const loading = ref(true)
    const columns = ref<ICompanyUserAlwaysShare[]>([])
    const ranks = ref<Rank[]>([])
    const selectedUserAlwaysShare = ref()
    const userAlwaysSharesToUpdate = ref<ICompanyUserAlwaysShare[]>([])
    watch(() => props.updateNumber, () => {
      getUserAlwaysShares()
      getAllRanks()
    })
    onMounted(async () => {
      getUserAlwaysShares()
      getAllRanks()
    })
    function getUserAlwaysShares () {
      loading.value = true
      api.get('/api/userAlwaysShare/reduced/' + props.companyId)
        .then((res) => {
          columns.value = res.data.columns
          rows.value = res.data.userAlwaysShares
          // convert the php float string to a number
          rows.value.forEach((companyUserAlwaysShare: ICompanyUserAlwaysShare) => {
            companyUserAlwaysShare.always_share = +companyUserAlwaysShare.always_share
          })
          loading.value = false
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function getAllRanks () {
      api.get('/api/ranks/reduced/' + props.companyId)
        .then((res) => {
          ranks.value = res.data.data
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function editCompanyUserAlwaysShare (newValue: string | number, companyUserAlwaysShare: ICompanyUserAlwaysShare, valueChanged: string) {
      companyUserAlwaysShare[valueChanged] = newValue
      // change the rank association if id changed
      if (valueChanged === 'rank_id') {
        companyUserAlwaysShare.rank = ranks.value?.find((rank) => rank.id === newValue)
      }
      // check if already in array
      if (userAlwaysSharesToUpdate.value?.find((userAlwaysShare) => userAlwaysShare.id === companyUserAlwaysShare.id)) {
        const index = userAlwaysSharesToUpdate.value.indexOf(companyUserAlwaysShare)
        userAlwaysSharesToUpdate.value.splice(index, 1)
      }
      userAlwaysSharesToUpdate.value.push(companyUserAlwaysShare)
    }
    function updateCompanyUserAlwaysShares () {
      api.patch('/api/userAlwaysShare/update/' + props.companyId, {
        user_always_shares: userAlwaysSharesToUpdate.value
      })
        .then(() => {
          userAlwaysSharesToUpdate.value = []
          getUserAlwaysShares()
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function deleteCompanyUserAlwaysShare () {
      if (selectedUserAlwaysShare.value === undefined || selectedUserAlwaysShare.value?.length === 0) {
        return
      }
      api.post('/api/userAlwaysShare/delete/' + props.companyId, {
        user_always_share_id: selectedUserAlwaysShare.value[0].id
      })
        .then(() => {
          selectedUserAlwaysShare.value = []
          getUserAlwaysShares()
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function showCreateDialog () {
      $q.dialog({
        component: CreateNewUserAlwaysShareDialog,
        componentProps: {
          companyId: props.companyId,
          allRanks: ranks.value
        },
        ok: {
          push: true,
          label: 'Erstellen'
        }
      })
        .onOk((newAlwaysShare: ICompanyUserAlwaysShare | undefined) => {
          if (newAlwaysShare === undefined) {
            return
          }
          api.post('/api/userAlwaysShare/create/' + props.companyId, {
            rank_id: newAlwaysShare?.rank_id,
            always_share: newAlwaysShare?.always_share,
            always_share_cash_register: newAlwaysShare?.always_share_cash_register
          })
            .then(() => {
              getUserAlwaysShares()
            })
            .catch((error) => {
              console.error(error)
            })
        })
    }
    return {
      rows,
      loading,
      columns,
      showCreateDialog,
      selectedUserAlwaysShare,
      ranks,
      editCompanyUserAlwaysShare,
      updateCompanyUserAlwaysShares,
      deleteCompanyUserAlwaysShare,
      userAlwaysSharesToUpdate
    }
  }
})
</script>

<style scoped>

</style>
