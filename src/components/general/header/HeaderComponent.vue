<template>
<div class="row items-center justify-between">
  <div class="col-2"></div>
  <q-select class="col-5"
            outlined
            label="Aktuelles Gewerbe"
            label-color="white"
            v-model="selectedCompany"
            :options="availableCompanies"
            transition-show="rotate"
            option-value="id"
            @update:model-value="updateSelectedCompany"
            @click="removeCompanyChanged()"
            option-label="name">
    <template v-slot:prepend>
      <q-icon name="mdi-domain">
        <q-badge color="red-9" floating rounded v-if="companyChanged"/>
      </q-icon>
    </template>
  </q-select>
  <div class="col-4">
    <div class="row justify-end items-center justify-end q-gutter-md">
      <q-btn-dropdown rounded color="secondary" dropdown-icon="mdi-bell" no-icon-animation>
        <div class="text-body1 q-ma-sm">Deine letzten Benachrichtigungen</div>
        <q-separator/>
        <q-scroll-area style="min-height: 160px; height: 165px;" :vertical-thumb-style="{ backgroundColor: 'var(--q-secondary)', opacity: 0.75 }"
                       v-if="notificationHistory !== undefined && notificationHistory.length > 0">
          <q-list separator>
              <q-item v-for="(notification, n) in notificationHistory" :key="n" dense class="">
                <q-item-section>
                  <q-item-label>{{ notification.notification }}</q-item-label>
                  <q-item-label caption>{{ notification.timestamp }}</q-item-label>
                </q-item-section>
              </q-item>
          </q-list>
        </q-scroll-area>
        <div v-else class="text-body1 q-ml-md text-italic">
          Auf dem neusten Stand😊
        </div>
        <q-separator/>
        <span class="q-ml-sm text-caption cursor-pointer delete-all-notifications"
              @click="clearNotificationHistory()">Alles löschen</span>
      </q-btn-dropdown>
      <UserMenuDropdown v-if="isLoggedIn"/>
      <q-btn label="Einloggen" outline :to="'/login'" v-if="!isLoggedIn"/>
      <q-btn label="Ausloggen" outline @click="cusLogout()" v-if="isLoggedIn && !isOnTablet"/>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { useUserStore } from 'stores/useUserStore'
import { computed, onMounted, ref } from 'vue'
import { companyStore } from 'stores/companyStore'
import { api } from 'boot/axios'
import Company from 'src/misc/classes/company/Company'
import UserMenuDropdown from 'components/general/header/UserMenuDropdown.vue'
import { useRouter } from 'vue-router'
import { notificationHistoryStateStore } from 'stores/notificationHistoryStore'

const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.authenticated)
const isOnTablet = computed(() => userStore.sessionLogin)
const availableCompanies = ref<Company[] | undefined>(undefined)
const cStore = companyStore()
const currentCompany = computed(() => cStore.companyId)
const companyChanged = ref<boolean>(false)
const notificationStore = notificationHistoryStateStore()
const notificationHistory = computed(() => notificationStore.notifications)
const selectedCompany = computed(() => {
  return availableCompanies.value === undefined
    ? 'Firmen werden geladen...'
    : availableCompanies.value.find((availableCompany: Company) => availableCompany.id === currentCompany.value)
})
const router = useRouter()
onMounted(() => {
  getUserCompanies()
})
defineExpose({
  updateAvailableCompanies
})
function getUserCompanies () {
  // get all available companies for the user
  api.get('/api/userCompanies')
    .then((response) => {
      availableCompanies.value = []
      availableCompanies.value = response.data.companies
      if (availableCompanies.value !== undefined && availableCompanies.value?.length > 0) {
        userStore.companiesAvailable = true
      } else {
        userStore.companiesAvailable = false
      }
    })
    .catch((error) => {
      console.error(error)
    })
}
function updateSelectedCompany (company: Company) {
  cStore.updateCompanyId(company.id)
}
function updateAvailableCompanies () {
  getUserCompanies()
  companyChanged.value = true
}
function removeCompanyChanged () {
  companyChanged.value = false
}
function cusLogout () {
  Promise.resolve(userStore.signOut())
    .then((res: boolean) => {
      if (res) {
        cStore.updateCompanyId(-1)
        router.push('/login')
      }
    })
}
function clearNotificationHistory () {
  notificationStore.clearStore()
}
</script>

<style scoped>
.unselectable {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.delete-all-notifications:hover {
  text-decoration: underline;
}
</style>
