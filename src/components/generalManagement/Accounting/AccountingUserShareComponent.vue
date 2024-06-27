<template>
  <q-card>
    <q-card-section>
      <div class="column items-center">
        <h4 class="q-mt-none q-mb-sm">Mitarbeiter Anteil</h4>
      </div>
      <div>
        <span class="hint-text">
           Der Mitarbeiteranteil bezieht sich auf den Gewinn abzüglich aller Nebenkosten.<br/>
          Heißt, wenn ein Produkt 10$ im Einkauf kostet und für 50$ verkauft wird,
          ziehen wir zuerst den Einkaufspreis ab, dann den Steueranteil und davon
          erhält der/die Mitarbeiter/in den prozentualen Anteil am Gewinn des verkauften Produktes X% von 35$
        </span>
      </div>
      <div class="row items-center justify-start q-gutter-lg q-mt-sm">
        <CreateSomethingNewButton icon="mdi-content-save"
                                  text="Neuen Mitarbeiter Anteil erstellen"
                                  @create-something-new="showCreateDialog()"
                                  :v-if="canCreateUserShares"
                                  class="q-mt-sm"/>
        <q-btn label="Ausgewähltes löschen"
               icon="mdi-delete"
               color="negative"
               v-if="canDeleteUserShares"
               class="q-mt-sm"
               :disable="selectedUserShares === undefined || selectedUserShares.length < 1"
               @click="deleteCompanyUserShare()"/>
        <q-btn label="Änderungen übernehmen"
               icon="mdi-content-save"
               color="positive"
               v-if="canEditUserShares"
               class="q-mt-sm"
               :disable="userSharesToUpdate.length < 1"
               @click="updateCompanyUserShares()"/>
      </div>
      <q-table virtual-scroll
               title="Alle Mitarbeiter Anteile"
               class="q-mt-md cms-sticky-header-table"
               no-data-label="Keine Mitarbeiter Anteile gefunden"
               :columns="columns"
               :rows="rows"
               :loading="loading"
               loading-label="Daten werden abgerufen..."
               row-key="id"
               v-model:selected="selectedUserShares"
               :selection="canDeleteUserShares ? 'single' : 'none'">
        <template v-slot:no-data="{ message }">
          <div class="full-width row q-gutter-sm items-center">
            <q-icon size="2em" name="mdi-alert"/>
            <span>{{ message }}</span>
          </div>
        </template>
        <template v-slot:loading>
          <q-inner-loading showing
                           color="primary"/>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props" v-if="columns?.length > 0">
            <q-td v-if="canDeleteUserShares">
              <q-checkbox color="accent" v-model="props.selected"/>
            </q-td>
            <q-td v-for="headerVal in columns"
                  :key="headerVal.name"
                  :props="props">
              <span v-if="headerVal.name === 'id'">{{ props.row[headerVal.name] }}</span>
              <span v-if="headerVal.name === 'user_share'"
                    class="cursor-pointer">
                {{ props.row[headerVal.name] + ' %' }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editCompanyUserShare(val, props.row, headerVal.name)">
                  <q-input v-model.number="scope.value"
                           dense
                           type="number"
                           outlined>
                    <template v-slot:append>
                      <q-icon name="mdi-percent"/>
                    </template>
                  </q-input>
                </q-popup-edit>
              </span>
              <span v-if="headerVal.name === 'rank_id'"
                    class="cursor-pointer">
                {{ props.row.rank.name }}
                <q-popup-edit :model-value="props.row.rank"
                              v-slot="scope"
                              buttons
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => editCompanyUserShare(val.id, props.row, headerVal.name)">
                  <q-select v-model="scope.value"
                            :options="ranks"
                            :option-value="option => option.id"
                            :option-label="option => option.name"
                            dense
                            outlined/>
                </q-popup-edit>
              </span>
              <span v-if="headerVal.name === 'created_at'">{{ FormatDateTime(props.row[headerVal.name]) }}</span>
              <span v-if="headerVal.name === 'updated_at'">{{ FormatDateTime(props.row[headerVal.name]) }}</span>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import CreateNewUserShareDialog from 'components/generalManagement/Dialogs/CreateNewUserShareDialog.vue'
import { api } from 'boot/axios'
import FormatDateTime from '../../../misc/functions/FormatDateTime'
import Rank from 'src/misc/classes/Rank/Rank'
import { ICompanyUserShare } from 'src/misc/interfaces/CompanyUserShare/ICompanyUserShare'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'AccountingUserShareComponent',
  methods: { FormatDateTime },
  components: { CreateSomethingNewButton },
  props: {
    canSeeUserShares: {
      type: Boolean,
      required: true,
      default: false
    },
    canEditUserShares: {
      type: Boolean,
      required: true,
      default: false
    },
    canDeleteUserShares: {
      type: Boolean,
      required: true,
      default: false
    },
    canCreateUserShares: {
      type: Boolean,
      required: true,
      default: false
    },
    companyId: {
      type: Number,
      required: true
    },
    updateNumber: {
      type: Number,
      required: true
    }
  },
  setup (props) {
    const $q = useQuasar()
    const rows = ref([])
    const loading = ref<boolean>(true)
    const columns = ref<ICompanyUserShare[]>([])
    const userSharesToUpdate = ref<ICompanyUserShare[]>([])
    const ranks = ref<Rank[]>([])
    const selectedUserShares = ref<ICompanyUserShare[]>([])
    watch(() => props.updateNumber, () => {
      getUserShares()
      getAllRanks()
    })
    onMounted(async () => {
      getUserShares()
      getAllRanks()
    })
    function getUserShares () {
      loading.value = true
      api.get('/api/userShare/reduced/' + props.companyId)
        .then((res) => {
          rows.value = res.data.userShares
          columns.value = res.data.columns
          // convert the php float string to a number
          rows.value.forEach((row: ICompanyUserShare) => {
            row.user_share = +row.user_share
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
    function editCompanyUserShare (newValue: string | number, companyUserShare: ICompanyUserShare, valueChanged: string) {
      companyUserShare[valueChanged] = newValue
      // change rank association if id changed
      if (valueChanged === 'rank_id') {
        companyUserShare.rank = ranks.value?.find((rank) => rank.id === newValue)
      }
      // check if already in array
      if (userSharesToUpdate.value.find((userShare) => userShare.id === companyUserShare.id)) {
        const index = userSharesToUpdate.value.indexOf(companyUserShare)
        userSharesToUpdate.value.splice(index, 1)
      }
      userSharesToUpdate.value.push(companyUserShare)
    }
    function updateCompanyUserShares () {
      api.patch('/api/userShare/update/' + props.companyId, {
        user_shares: userSharesToUpdate.value
      })
        .then(() => {
          userSharesToUpdate.value = []
          getUserShares()
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function deleteCompanyUserShare () {
      if (selectedUserShares.value === undefined || selectedUserShares.value?.length === 0) {
        return
      }
      api.post('/api/userShare/delete/' + props.companyId, {
        user_share_id: selectedUserShares.value[0].id
      })
        .then(() => {
          selectedUserShares.value = []
          getUserShares()
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function showCreateDialog () {
      $q.dialog({
        component: CreateNewUserShareDialog,
        componentProps: {
          companyId: props.companyId,
          allRanks: ranks.value
        },
        ok: {
          push: true,
          label: 'Erstellen'
        }
      })
        .onOk((userShare: ICompanyUserShare) => {
          api.post('/api/userShare/create/' + props.companyId, {
            user_share: userShare.user_share,
            rank_id: userShare.rank_id
          })
            .then(() => {
              getUserShares()
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
      ranks,
      editCompanyUserShare,
      updateCompanyUserShares,
      userSharesToUpdate,
      deleteCompanyUserShare,
      selectedUserShares,
      showCreateDialog
    }
  }
})
</script>

<style scoped>

</style>
