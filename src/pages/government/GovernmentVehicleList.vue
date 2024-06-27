<template>
  <div class="column">
    <transition enter-active-class="animated bounceInLeft delay-1s slower">
      <access-validation-component v-if="!loadingCompanies && !loadingAccess && showCompanySelect"
                                   @create-access-request="createAccessRequest" :user-id="userId"
                                   @cancel-request="cancelAccessRequest" @go-to-selected-company="goToList"
                                   :companies="companies" :companies-with-access="currentAccess"/>
    </transition>
    <transition enter-active-class="animated bounceInLeft delay-1s slower">
      <essential-company-vehicles-component :company-name="selectedCompanyName" @go-back="backFromList"
                                            :company-id="selectedCompanyId" v-if="!showCompanySelect"/>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import ICompany from 'src/misc/interfaces/Company/ICompany'
import ICompanyExternalAccess from 'src/misc/interfaces/Company/ICompanyExternalAccess'
import { api } from 'boot/axios'
import AccessValidationComponent from 'components/government/accessValidationComponent.vue'
import GovernmentArea from 'src/misc/Enums/Government/GovernmentArea'
import { useUserStore } from 'stores/useUserStore'
import laravelEcho from 'boot/laravelecho'
import EssentialCompanyVehiclesComponent from 'components/government/essentialCompanyVehiclesComponent.vue'

const companies = ref<ICompany[]>()
const currentAccess = ref<ICompanyExternalAccess[]>()
const loadingCompanies = ref<boolean>(true)
const loadingAccess = ref<boolean>(true)
const userStore = useUserStore()
const userId = computed(() => userStore.userId)
const showCompanySelect = ref<boolean>(true)
const selectedCompanyId = ref<number|undefined>(0)
const selectedCompanyName = ref<string|undefined>()

onMounted(() => {
  joinReloadChannel()
  getCompanies()
  getEmployeeAccess()
})
onUnmounted(() => {
  // stop listening to the change event
  laravelEcho.leave('user.reload.' + userId.value)
})

function joinReloadChannel () {
  if (userId.value <= 0) return
  // listen to the change event
  laravelEcho.private('user.reload.' + userId.value)
    .listen('.user.reload', () => {
      getEmployeeAccess()
    })
}
function getCompanies () {
  loadingCompanies.value = true
  api.get('/api/government/companies')
    .then((response) => {
      companies.value = response.data
      loadingCompanies.value = false
    })
    .catch((error) => {
      console.error(error)
    })
}
function getEmployeeAccess () {
  loadingAccess.value = true
  api.get('/api/government/currentAccess?area=5')
    .then((response) => {
      currentAccess.value = response.data
      loadingAccess.value = false
    })
    .catch((error) => {
      console.error(error)
    })
}
function createAccessRequest (company: ICompany | undefined, hasResolution: boolean, hasNote?: string | null) {
  if (company === undefined) return
  api.patch('/api/government/createAccessRequest', {
    area: GovernmentArea.CompanyVehicles,
    company_id: company.id,
    resolution: hasResolution,
    note: hasNote
  })
    .then(() => {
      getEmployeeAccess()
    })
    .catch((error) => {
      console.error(error)
    })
}
function cancelAccessRequest (accessRequestId: number) {
  api.patch('/api/government/cancelAccessRequest', {
    id: accessRequestId
  })
    .then(() => {
      getEmployeeAccess()
    })
    .catch((error) => {
      console.error(error)
    })
}
function goToList (companyId: number) {
  selectedCompanyId.value = companyId
  selectedCompanyName.value = companies.value?.find((company) => company.id === companyId)?.name
  showCompanySelect.value = false
}
function backFromList () {
  getEmployeeAccess()
  showCompanySelect.value = true
  selectedCompanyId.value = 0
  selectedCompanyName.value = ''
}
</script>

<style scoped>

</style>
