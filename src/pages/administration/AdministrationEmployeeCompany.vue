<template>
  <div class="column">
    <div class="row q-gutter-sm text-center">
      <div class="col-4">
        <span class="text-h4">Gewerbe</span>
      </div>
      <div class="col-4">
        <span class="text-h4">Benutzer</span>
      </div>
      <div class="col">
        <span class="text-h4">Rang</span>
      </div>
    </div>
    <div class="row q-gutter-sm q-mt-sm items-start justify-between">
      <q-select v-model="selectedCompany" v-if="!loadingCompanies" outlined :options="allCompanies"
                option-value="id" option-label="name" clearable @update:model-value="loadCompanyRelatedThings"
                @clear="resetEverythingOnCompanyChange" class="col-4"/>
      <q-skeleton v-else type="QInput" animation="wave" height="56px" class="bg-primary col-4"/>
      <q-select v-model="selectedUser" v-if="!loadingUsers" outlined :options="allOptionsUsers"
                use-input input-debounce="50" @filter="filterUser" option-value="id"
                :disable="selectedCompany === undefined" clearable class="col-4"
                :option-label="(option: User) => `${option.id} | ${option.first_name} ${option.last_name} | ${option.email}`"/>
      <q-skeleton v-else type="QInput" animation="wave" height="56px" class="bg-primary col-4"/>
      <q-select v-model="selectedRank" v-if="!loadingRanks" outlined :options="companyRanks" option-value="id"
                :option-label="(option: Rank) => `${option.name} | ${option.weight}`" clearable class="col"/>
      <q-skeleton v-else type="QInput" animation="wave" height="56px" class="bg-primary col"/>
    </div>
    <div class="row q-gutter-sm q-mt-md q-mb-sm">
      <div class="column col-4">
        <div>
          <q-btn color="warning" :disable="!assignmentAvailable" class="col-1" label="Zuweisen"
                 @click="assignUserAndRankToCompany()"/>
        </div>
      </div>
      <div class="column col-4">
        <div class="column" v-if="selectedCompany !== undefined">
          <span class="text-h6">Mitarbeiter/innen in der Firma</span>
          <ListLoadingSkeletonComponent v-if="companyEmployees === undefined"/>
          <q-scroll-area style="height: 38rem;" v-else>
            <q-list bordered separator v-if="selectedCompany">
              <q-item v-for="employee in companyEmployees" :key="employee.user_id"
                      :style="`${(userEditMode && userEditModeId === employee.user_id) ? 'background-color: #25262E;' : ''}`">
                <q-item-section>
                  <q-item-label>
                    <q-icon name="mdi-account"/>
                    {{ employee.user?.id }} | {{ employee.user?.first_name }} {{ employee.user?.last_name }}
                  </q-item-label>
                  <q-item-label v-if="employee.user?.ranks.length > 0 || (employee.user?.ranks.length === 0 && (userEditMode && userEditModeId === employee.user_id))">
                    <div v-if="!userEditMode || (userEditMode && userEditModeId !== employee.user_id)">
                      <q-icon name="mdi-account-lock q-mr-sm"/>
                      <span class="text-secondary">{{ employee.user.ranks[0].name }}</span>
                    </div>
                    <div v-else-if="userEditMode && userEditModeId === employee.user_id" class="row">
                      <q-select v-model="employee.user.ranks[0]" outlined :options="companyRanks" option-value="id"
                                :option-label="(option: Rank) => `${option.name} | ${option.weight}`" class="col-4"/>
                      <q-btn label="Speichern" color="positive" class="col-2 q-ml-sm" @click="saveEditUser(employee)"/>
                      <q-btn label="Feuern" color="negative" class="col-2 q-ml-sm" @click="fireEditUser(employee)"/>
                    </div>
                  </q-item-label>
                  <q-item-label v-else>
                    <q-icon name="mdi-account-lock q-mr-sm"/>
                    <span class="text-italic text-accent">Kein Rang</span>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="mdi-account-edit" @click="editUser(employee)" style="cursor: pointer"
                          v-if="!userEditMode || (userEditMode && userEditModeId !== employee.user_id)">
                    <q-tooltip>Benutzer bearbeiten</q-tooltip>
                  </q-icon>
                  <q-icon name="mdi-account-cancel" style="cursor: pointer" @click="cancelEditUser()" v-else>
                    <q-tooltip>Änderungen verwerfen</q-tooltip>
                  </q-icon>
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </div>
      </div>
      <div class="column col">
        <div class="column" v-if="selectedRank !== null && selectedRank !== undefined">
          <edit-something-button text="Berechtigungen refreshen" icon="mdi-refresh"
                                 @create-something-new="refreshRankPolicies()"/>
          <div class="col-auto text-body1 text-white">
            Entfernt alle Berechtigungen für die User und setzt sie neu.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { api } from 'boot/axios'
import ListLoadingSkeletonComponent from '../../components/general/skeletons/ListLoadingSkeletonComponent.vue'
import User from 'src/misc/classes/User/User'
import CompanyUser from 'src/misc/classes/User/CompanyUser'
import Company from 'src/misc/classes/company/Company'
import Rank from 'src/misc/classes/Rank/Rank'
import laravelEcho from 'boot/laravelecho'
import { useUserStore } from 'stores/useUserStore'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'

const selectedCompany = ref<Company>()
const selectedUser = ref<User>()
const selectedRank = ref<Rank>()
const allCompanies = ref<Company[]>()
const allUsers = ref<User[]>()
const allOptionsUsers = ref<User[]>()
const companyEmployees = ref<CompanyUser[]>()
const companyRanks = ref<Rank[]>()
const loadingContent = ref(false)
const loadingCompanies = ref(true)
const loadingUsers = ref(true)
const loadingRanks = ref(true)
const userEditMode = ref(false)
const userEditModeId = ref(0)
const userStore = useUserStore()
const userId = computed(() => userStore.userId)
const assignmentAvailable = computed(() => {
  return selectedCompany.value !== undefined &&
    selectedUser.value !== undefined && selectedRank.value !== undefined
})
onMounted(async () => {
  // listen to the change event
  laravelEcho.private('user.reload.' + userId.value)
    .listen('.user.reload', () => {
      // just reload the companies
      selectedUser.value = undefined
      selectedRank.value = undefined
      loadCompanyRelatedThings()
      cancelEditUser()
    })
  api.get('/api/companies/admin')
    .then((response) => {
      allCompanies.value = response.data.data
      loadingCompanies.value = false
    })
    .catch((error) => {
      console.error(error)
    })
  api.get('/api/user/reduced-for-company-creation')
    .then((response) => {
      allUsers.value = response.data.users
      loadingUsers.value = false
    })
    .catch((error) => {
      console.error(error)
    })
})
onUnmounted(() => {
  // stop listening to the change event
  laravelEcho.leave('user.reload.' + userId.value)
})
function loadCompanyRelatedThings () {
  if (selectedCompany.value === undefined || selectedCompany.value?.id === undefined) return
  companyEmployees.value = undefined
  selectedRank.value = undefined
  api.get('/api/ranks/admin/reduced/' + selectedCompany.value?.id)
    .then((response) => {
      companyRanks.value = response.data.data
      loadingRanks.value = false
      selectedCompany.value !== undefined && selectedUser.value !== undefined ? loadingContent.value = true : loadingContent.value = false
    })
    .catch((error) => {
      console.error(error)
    })
  api.get('/api/companyUsers/reduced-for-assignment/' + selectedCompany.value.id)
    .then((response) => {
      companyEmployees.value = response.data
      loadingUsers.value = false
    })
    .catch((error) => {
      console.error(error)
    })
}
function resetEverythingOnCompanyChange () {
  selectedUser.value = undefined
  selectedRank.value = undefined
  loadingRanks.value = true
  companyEmployees.value = undefined
}
function assignUserAndRankToCompany () {
  if (selectedCompany.value === undefined || selectedUser.value === undefined || selectedRank.value === undefined) return
  api.post('/api/administration/add/companyuser/' + selectedCompany.value.id, {
    user_id: selectedUser.value.id,
    rank_id: selectedRank.value.id
  })
    .then(() => {
      selectedUser.value = undefined
      loadCompanyRelatedThings()
    })
    .catch((error) => {
      console.error(error)
    })
}
function editUser (user: CompanyUser) {
  // set edit mode to true
  userEditMode.value = true
  userEditModeId.value = user.user_id
}
function saveEditUser (user: CompanyUser) {
  api.patch('/api/companyUsers/update-user-rank', {
    user_id: user.user_id,
    company_id: user.company_id,
    rank_id: user.user?.ranks?.[0].id
  })
    .catch((error) => {
      console.error(error)
    })
}
function fireEditUser (user: CompanyUser) {
  api.post('/api/companyUsers/fireUserFromCompany/' + user.company_id, {
    user_id: user.user_id,
    company_id: user.company_id
  })
    .catch((error) => {
      console.error(error)
    })
}
function cancelEditUser () {
  // revert edit mode
  userEditMode.value = false
  userEditModeId.value = 0
}
function filterUser (val: string, update: (val: () => void) => void) {
  if (allUsers.value !== undefined) {
    update(() => {
      const needle = val.toLowerCase()
      allOptionsUsers.value = allUsers.value?.filter((user) =>
        (user.first_name + user.last_name + user.email).toLowerCase().indexOf(needle) > -1)
    })
  }
}
function refreshRankPolicies () {
  if (selectedCompany.value === undefined) return
  if (selectedCompany.value.id < 1) return
  if (selectedRank.value === undefined) return
  if (selectedRank.value.id < 1) return
  api.post('/api/companyUsers/refreshRankPolicies/' + selectedCompany.value?.id + '?rank_id=' + selectedRank.value?.id)
    .catch((error) => {
      console.error(error)
    })
}
</script>

<style scoped>

</style>
