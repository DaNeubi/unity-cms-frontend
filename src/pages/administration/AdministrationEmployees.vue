<template>
  <div class="column">
    <div class="row">
      <CreateSomethingNewButton icon="mdi-account-plus" text="Neuer Mitarbeiter"
                                @create-something-new="showCreateDialog()" v-if="canCreateNewUser"/>
    </div>
    <div class="row">
      <q-table
        class="default-table-height q-mt-md full-width cms-sticky-header-table" title="Alle Mitarbeiter/innen"
        no-data-label="Keine Daten vorhanden" :columns="columns" :filter="filter"
        :rows="rows" :loading="loading" key="id" :pagination="{ rowsPerPage: 50 }"
        row-key="id" loading-label="Daten werden abgerufen...">
        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Suchen...">
            <template v-slot:append>
              <q-icon name="mdi-magnify" />
            </template>
          </q-input>
        </template>
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th auto-width />
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td auto-width>
              <q-btn size="sm" color="accent" round dense @click="props.expand = !props.expand" :icon="props.expand ? 'mdi-minus' : 'mdi-plus'"/>
            </q-td>
            <q-td v-for="headerVal in columns" :key="headerVal.name" :props="props">
              <div v-if="headerVal.name === 'id'">{{ props.row[headerVal.name] }}</div>
              <div v-else-if="headerVal.name === 'email'">{{ props.row[headerVal.name] }}</div>
              <div v-else style="height: 100%;" class="cursor-pointer flex items-center justify-end">
                {{ props.row[headerVal.name] }}
                <q-popup-edit :model-value="props.row[headerVal.name]"
                              v-slot="scope"
                              buttons
                              v-if="canEditUser"
                              label-set="Aktualisieren"
                              label-cancel="Abbrechen"
                              @save="(val) => updateUser(val, props.row, headerVal.name)">
                  <q-input v-model="scope.value" dense autofocus outlined counter :type="'text'" maxlength="255"/>
                </q-popup-edit>
              </div>
            </q-td>
          </q-tr>
          <q-tr v-show="props.expand" :props="props">
            <q-td colspan="100%">
              <template v-if="props.expand">
                {{ loadUserCompanies(props.row) }}
                <div v-if="props.row?.companies === undefined">
                  <q-skeleton type="QChip"/>
                </div>
                <div v-else>
                  <q-chip v-for="company in props.row?.companies" :key="company.id + 'usercompany' + props.row.id"
                          color="orange-9" :label="company?.name"/>
                </div>
              </template>
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

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import CreateSomethingNewButton from '../../components/general/buttons/CreateSomethingNewButton.vue'
import CreateNewEmployeeDialog from '../../components/administration/CreateNewEmployeeDialog.vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import laravelEcho from 'boot/laravelecho'
import { useUserStore } from 'stores/useUserStore'
import User from 'src/misc/classes/User/User'
import AssignPolicies from 'src/misc/functions/policies/Policies'
import IUser from 'src/misc/interfaces/User/IUser'

const $q = useQuasar()
const rows = ref<User[]>([])
const loading = ref(true)
const canCreateNewUser = ref(false)
const canEditUser = ref(false)
const canDeleteUser = ref(false)
const userStore = useUserStore()
const userId = computed(() => userStore.userId)
const filter = ref<string>('')
const columns = [
  { name: 'id', field: 'id', label: 'ID' },
  { name: 'first_name', field: 'first_name', label: 'Vorname' },
  { name: 'last_name', field: 'last_name', label: 'Nachname' },
  { name: 'phone', field: 'phone', label: 'Handynummer' },
  { name: 'bank_account_number', field: 'bank_account_number', label: 'Kontonummer' },
  { name: 'birth_day', field: 'birth_day', label: 'Geburtsdatum' },
  { name: 'email', field: 'email', label: 'UMail' }
]

onMounted(() => {
  // get permissions
  getPermissions()
  fetchUsers()
  // listen to the change event
  laravelEcho.private('user.reload.' + userId.value)
    .listen('.user.reload', () => {
      // just reload the companies
      loading.value = true
      fetchUsers()
    })
})
onUnmounted(() => {
  // stop listening to the change event
  laravelEcho.leave('user.reload.' + userId.value)
})
function getPermissions () {
  api.get('/api/administrationPolicies/user')
    .then((res) => {
      AssignPolicies([
        { policyName: 'Administration_User_Create', policyToAssign: canCreateNewUser },
        { policyName: 'Administration_User_Edit', policyToAssign: canEditUser },
        { policyName: 'Administration_User_Delete', policyToAssign: canDeleteUser }
      ], res.data.userPolicies)
    })
    .catch((err) => {
      console.error(err)
    })
}
function fetchUsers () {
  api.get('/api/users/admin')
    .then((response) => {
      rows.value = response.data.users
      loading.value = false
    })
    .catch((error) => {
      $q.notify({
        color: 'negative',
        position: 'top-right',
        message: 'User konnten nicht abgerufen werden! ' + error,
        icon: 'mdi-alert-circle'
      })
      loading.value = false
    })
}
function updateUser (newValue: string, user: User, changedValue: string) {
  const newUser = {
    ...user,
    [changedValue]: newValue
  }
  const userToUpdate = rows.value?.findIndex(u => u.id === user.id)
  if (userToUpdate !== undefined && rows.value !== undefined) {
    rows.value[userToUpdate] = newUser
  }
  // send the new user to the backend
  api.patch('/api/users/' + newUser.id, JSON.stringify(newUser))
    .catch((err) => {
      $q.notify({
        color: 'negative',
        position: 'top-right',
        message: 'Benutzer konnte nicht aktualisiert werden! ' + err,
        icon: 'mdi-alert-circle'
      })
      console.error(err)
    })
}
function showCreateDialog () {
  $q.dialog({
    component: CreateNewEmployeeDialog,
    ok: {
      push: true,
      label: 'Erstellen'
    }
  })
}
function loadUserCompanies (user: IUser) {
  if (user.companies !== undefined) return
  api.get('/api/administration/users/companies?user_id=' + user.id)
    .then((res) => {
      user.companies = res.data
    })
    .catch((err) => {
      console.error(err)
    })
}
</script>

<style scoped>

</style>
