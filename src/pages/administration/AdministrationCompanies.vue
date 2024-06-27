<template>
  <div class="column">
    <div class="row">
      <CreateSomethingNewButton icon="mdi-home-plus" text="Neues Gewerbe"
                                @create-something-new="showCreateDialog()" v-if="canCreateNewCompany"/>
      <q-btn icon="mdi-content-save" class="q-ml-md" label="Änderungen speichern" color="accent"
             @click="commitChanges()" v-if="canEditCompanies"
             :disable="changedCompanies === undefined || changedCompanies.length <= 0"/>
    </div>
    <div class="row">
      <q-table
        class="default-table-height q-mt-md full-width cms-sticky-header-table"
        virtual-scroll v-model:pagination="pagination" title="Alle Gewerbe" :columns="columns"
        no-data-label="Keine Daten vorhanden" :rows="rows" :loading="loading">
        <template v-slot:body="props">
          <q-tr :props="props" :style="`${ props.row.deleted === 1 ? 'background-color: #D05D5D;' : '' }`">
            <q-td v-for="headerVal in columns" :key="headerVal.name" :props="props">
              <span v-if="headerVal.name === 'created_at'">{{ formDate(props.row[headerVal.name]) }}</span>
              <span v-else-if="headerVal.name === 'id'">{{ props.row[headerVal.name] }}</span>
              <div v-else-if="headerVal.name === 'util'">
                <q-btn color="primary" :disable="!canResetRankAndPolicies" label="Policy Reset"
                       @click="resetCompanyRankAndPolicies(props.row.id)"/>
              </div>
              <div v-else-if="headerVal.name === 'owners'" class="cursor-pointer" style="min-height: 1.5rem;">
                <div v-for="owner in props.row.owners" :key="owner.user_id">
                  {{ getCompanyOwnerName(owner) }}
                </div>
                <q-popup-edit :model-value="props.row.owners" v-slot="scope" buttons label-cancel="Abbrechen"
                              @save="(val) => updateCompany(val, props.row, headerVal.name)"
                              label-set="Aktualisieren">
                  <q-select label="Inhaber" v-model="scope.value" multiple outlined use-chips
                            clearable use-input :options="availableOptionsUsers" @filter="filterUserFn"
                            :option-value="option => option.user"
                            :option-label="(option: ICompanyOwner) => option.user?.first_name + ' ' + option.user?.last_name">
                    <template v-slot:selected-item="scope">
                      <q-chip color="orange-4" removable @remove="scope.removeAtIndex(scope.index)" text-color="black"
                              icon="mdi-account">
                        {{ getCompanyOwnerName(scope.opt) }}
                      </q-chip>
                    </template>
                  </q-select>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'deleted'" class="cursor-pointer">
                {{ props.row[headerVal.name] === 1 ? 'Ja' : 'Nein' }}
                <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope" buttons
                              label-set="Aktualisieren" label-cancel="Abbrechen"
                              @save="(val) => updateCompany(val, props.row, headerVal.name)">
                  <q-checkbox v-model="scope.value" :true-value="1" :false-value="0" label="Gewerbe Deaktivieren?"/>
                </q-popup-edit>
              </div>
              <div v-else class="cursor-pointer">
                {{ props.row[headerVal.name] }}
                <q-popup-edit :model-value="props.row[headerVal.name]" v-slot="scope" buttons
                              label-set="Aktualisieren" label-cancel="Abbrechen"
                              @save="(val) => updateCompany(val, props.row, headerVal.name)">
                  <q-input v-model="scope.value" dense autofocus outlined counter
                           :type="isNaN(parseInt(scope.value)) ? 'text' : 'number'" maxlength="255"/>
                </q-popup-edit>
              </div>
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
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue'
import CreateSomethingNewButton from '../../components/general/buttons/CreateSomethingNewButton.vue'
import CreateNewCompanyDialog from '../../components/administration/CreateNewCompanyDialog.vue'
import { api } from 'boot/axios'
import { date, useQuasar } from 'quasar'
import { useUserStore } from 'stores/useUserStore'
import { companyStore } from 'stores/companyStore'
import laravelEcho from 'src/boot/laravelecho'
import formatDate = date.formatDate
import ICompany from 'src/misc/interfaces/Company/ICompany'
import ICompanyOwner from 'src/misc/interfaces/Company/ICompanyOwner'
import IUser from 'src/misc/interfaces/User/IUser'
import AssignPolicies from 'src/misc/functions/policies/Policies'

export default defineComponent({
  name: 'AdministrationCompanies',
  components: { CreateSomethingNewButton },
  computed: {
    ICompanyOwner () {
      return Object as unknown as ICompanyOwner
    }
  },
  setup () {
    const $q = useQuasar()
    const rows = ref<ICompanyOwner[]>([])
    const canCreateNewCompany = ref<boolean>(false)
    const canEditCompanies = ref<boolean>(false)
    const canDeleteCompanies = ref<boolean>(false)
    const canResetRankAndPolicies = ref<boolean>(false)
    const availableRows = computed(() => rows.value)
    const userStore = useUserStore()
    const bearerToken = computed(() => userStore.userToken)
    const company = companyStore()
    const companyId = computed(() => company.companyId)
    const loading = ref<boolean>(true)
    const backendUrl = ref(process.env.BACKEND_SERVER)
    const logoChange = ref<boolean>(false)
    const changeLogo = computed(() => logoChange)
    const userId = computed(() => userStore.userId)
    const changedCompanies = ref<ICompany[]>()
    const allUsers = ref<ICompanyOwner[]>()
    const availableOptionsUsers = ref<ICompanyOwner[]>()
    const columns = [
      { name: 'id', label: 'ID', field: 'id', sortable: true },
      { name: 'name', label: 'Name', field: 'name', sortable: true },
      { name: 'user_limit', label: 'Mitarbeiter-Limit', field: 'user_limit', sortable: true },
      { name: 'owners', label: 'Inhaber', field: 'owners', sortable: true },
      { name: 'bank_account_number', label: 'Kontonummer', field: 'bank_account_number', sortable: true },
      { name: 'phone_number', label: 'Leitstelle', field: 'phone_number', sortable: true },
      { name: 'util', label: 'Utility', field: 'util', sortable: true },
      { name: 'radio_limit', label: 'Funk Limit', field: 'radio_limit', sortable: true },
      { name: 'deleted', label: 'Gelöscht', field: 'deleted', sortable: true },
      { name: 'created_at', label: 'Erstellt am', field: 'created_at', sortable: true }
    ]
    onMounted(() => {
      // get permissions
      api.get('/api/administrationPolicies/company')
        .then((res) => {
          AssignPolicies([
            { policyName: 'Administration_Company_Create', policyToAssign: canCreateNewCompany },
            { policyName: 'Administration_Company_Edit', policyToAssign: canEditCompanies },
            { policyName: 'Administration_Company_Delete', policyToAssign: canDeleteCompanies },
            { policyName: 'Administration_Company_Util_Reset_Owner_Permissions', policyToAssign: canResetRankAndPolicies }
          ], res.data.companyPolicies)
        })
        .catch((err) => {
          console.error(err)
        })
      fetchCompanies()
      // listen to the change event
      laravelEcho.private('user.reload.' + userId.value)
        .listen('.user.reload', () => {
          // just reload the companies
          loading.value = true
          changedCompanies.value = undefined
          fetchCompanies()
        })
    })
    onUnmounted(() => {
      // stop listening to the change event
      laravelEcho.leave('user.reload.' + userId.value)
    })
    function fetchCompanies () {
      api.get('/api/companies/admin')
        .then((response) => {
          rows.value = response.data.data
          loading.value = false
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function updateCompany (newValue : string | number, company : ICompany, changedValue : string | number) {
      // assign the new value to the company
      company[changedValue] = newValue
      // check if already in the changed array
      if (changedCompanies.value === undefined) {
        changedCompanies.value = []
      }
      if (changedCompanies.value?.indexOf(company) === -1) {
        changedCompanies.value?.push(company)
      }
    }
    function commitChanges () {
      if (changedCompanies.value === undefined) {
        return
      }
      // send the new company to the backend
      api.patch('/api/admin/company', {
        companies: changedCompanies.value
      })
        .catch((error) => {
          console.error(error)
        })
    }
    function filterUserFn (val: string, update: (val: () => void) => void) {
      if (allUsers.value !== undefined && val.length >= 2) {
        update(() => {
          const needle = val.toLowerCase()
          availableOptionsUsers.value =
            allUsers.value?.filter((v: ICompanyOwner) => v.user === undefined ||
              v.user?.first_name.toLowerCase().indexOf(needle) > -1 ||
              v.user?.last_name.toLowerCase().indexOf(needle) > -1 ||
              v.user?.email.toLowerCase().indexOf(needle) > -1) || []
        })
      }

      // else load all users
      api.get('/api/user/reduced-for-company-creation')
        .then((response) => {
          allUsers.value = response.data.users.map((user: IUser) => {
            return {
              user_id: user.id,
              company_id: companyId.value,
              user: user ?? undefined
            }
          })
          // parse the IUser[] into a ICompanyOwner[]
          update(() => {
            const needle = val.toLowerCase()
            availableOptionsUsers.value =
              allUsers.value?.filter((v: ICompanyOwner) => v.user === undefined ||
                v.user?.first_name.toLowerCase().indexOf(needle) > -1 ||
                v.user?.last_name.toLowerCase().indexOf(needle) > -1 ||
                v.user?.email.toLowerCase().indexOf(needle) > -1) || []
          })
        })
        .catch((error) => {
          $q.notify({
            color: 'negative',
            position: 'top-right',
            message: 'Benutzer konnten nicht abgerufen werden! ' + error,
            icon: 'mdi-alert-circle'
          })
        })
    }
    function resetCompanyRankAndPolicies (companyId: number) {
      // first make a sanity check
      $q.dialog({
        cancel: {
          push: true,
          label: 'Nein hab mich nur verklickt'
        },
        ok: {
          push: true,
          label: 'Ja Zurücksetzen',
          color: 'negative'
        },
        title: 'Wirklich zurücksetzen?',
        message: 'Willst du wirklich die Ränge und Policies des Gewerbes zurücksetzen? Dies kann nicht rückgängig gemacht werden!'
      })
        .onOk(() => {
          api.post('/api/company/resetPolicies/' + companyId)
            .catch((error) => {
              console.error(error)
            })
        })
    }
    function getCompanyOwnerName (user: { first_name?: string, last_name?: string, id?: number, laravel_through_key?: number, user_id?: number, company_id?: number, user?: IUser }) {
      // check if it's a user object or a object containing a user object
      if (user.user !== undefined) {
        return user.user?.first_name + ' ' + user.user?.last_name
      } else if (user.id !== undefined) {
        return user?.first_name + ' ' + user?.last_name
      } else {
        return 'Unbekannt'
      }
    }
    return {
      pagination: ref({
        rowsPerPage: 0
      }),
      columns,
      showCreateDialog: function () {
        $q.dialog({
          component: CreateNewCompanyDialog,
          ok: {
            push: true,
            label: 'Erstellen'
          }
        })
      },
      rows,
      onMounted,
      loading,
      updateCompany,
      availableRows,
      formDate (date: string | null | undefined) {
        if (date === null || date === undefined) {
          return 'hamma koi datum'
        }
        const d = Date.parse(date)
        return formatDate(d, 'DD.MM.YYYY - HH:mm:ss')
      },
      bearerToken,
      companyId,
      backendUrl,
      changeLogo,
      changeLogoFn: function () {
        logoChange.value = !logoChange.value
      },
      canCreateNewCompany,
      canEditCompanies,
      canDeleteCompanies,
      commitChanges,
      changedCompanies,
      availableOptionsUsers,
      filterUserFn,
      canResetRankAndPolicies,
      resetCompanyRankAndPolicies,
      getCompanyOwnerName
    }
  }
})
</script>

<style scoped>

</style>
