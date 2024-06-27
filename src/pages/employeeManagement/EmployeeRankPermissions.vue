<template>
  <div class="column items-start">
    <span class="text-h5 ">Berechtigungen Verwalten</span>
    <div class="row q-mt-md full-width">
    <q-select v-model="selectedRank"
              outlined
              v-if="!loadingRanks"
              :options="availableRanks"
              option-value="id"
              option-label="name"
              clearable
              label="Ränge"
              class="full-width"/>
      <q-skeleton v-else
                  type="QInput"
                  animation="wave"
                  height="56px"
                  class="bg-primary col"/>
    </div>
    <div class="row q-mt-md">
      <div class="col-12" v-if="availableModules !== undefined && availableModules !== null">
        <span class="text-body1 text-secondary">Verfügbare Module:</span>
        <q-chip v-for="module in availableModules.getModuleAccessArray()"
                :key="module.name"
                :label="module.name"
                text-color="secondary"
                icon="mdi-check-decagram-outline">
          <q-tooltip class="bg-deep-orange-9 text-body2">{{ module.description }}</q-tooltip>
        </q-chip>
      </div>
    </div>
    <div class="row full-width q-gutter-sm q-mt-sm">
      <div class="col-6">
        <span class="text-h5">Berechtigungen, die für den Rang gesetzt sind.</span>
        <div v-if="selectedRank !== null && selectedRank !== undefined">
          <q-btn label="Ausgewählte entfernen"
                 color="secondary"
                 class="q-mt-sm q-mb-sm"
                 icon="mdi-account-multiple-plus-outline"
                 :disable="removeButtonDisabled"
                 @click="removePermissionsFromRank()">
            <q-tooltip v-if="removeButtonDisabled">
              Erstmal musst du was auswählen...
            </q-tooltip>
          </q-btn>
        </div>
        <div v-if="selectedRank === null || selectedRank === undefined">
          <span>Rang auswählen um Berechtigungen zu sehen.</span>
        </div>
        <q-separator/>
        <RankPolicyListSkeletonComponent class="q-mt-sm" v-if="!loadedRankPermissions"/>
        <div v-else-if="selectedPermissions !== undefined && selectedPermissions.length === 0">
          <span class="text-h5">Keine Berechtigungen gesetzt</span>
        </div>
        <q-list bordered class="rounded-borders q-mt-sm" v-else>
          <q-expansion-item expand-separator
                            icon="mdi-list-box-outline"
                            header-class="text-pink-7"
                            v-for="permissionList in selectedPermissions"
                            group="permissions_set"
                            :key="permissionList"
                            :label="permissionList[0].category + ' (' + permissionList.length + ')'">
            <div v-if="permissionList.length > 0">
              <q-item clickable v-ripple v-for="permission in permissionList" :key="permission.name">
                <q-item-section side top>
                  <q-checkbox v-model="permission.selected"
                              color="pink-7"
                              @update:model-value="addToRemovePermission(permission)"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ permission.name }}</q-item-label>
                  <q-item-label caption>{{ permission.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </q-expansion-item>
        </q-list>
      </div>
      <div class="col">
        <span class="text-h5">Berechtigungen, die noch zur Verfügung stehen.</span>
        <div v-if="selectedRank !== null && selectedRank !== undefined">
          <q-btn label="Ausgewählte hinzufügen"
                 color="secondary"
                 class="q-mt-sm q-mb-sm"
                 icon="mdi-account-multiple-plus-outline"
                 :disable="addButtonDisabled"
                 @click="addPermissionsFromRank()">
            <q-tooltip v-if="addButtonDisabled">
              Erstmal musst du was auswählen...
            </q-tooltip>
          </q-btn>
        </div>
        <div v-if="selectedRank === null || selectedRank === undefined">
          <span>Rang auswählen um Berechtigungen zu sehen.</span>
        </div>
        <q-separator/>
        <RankPolicyListSkeletonComponent class="q-mt-sm" v-if="!loadedRankPermissions"/>
        <q-list bordered class="rounded-borders q-mt-sm" v-else>
          <q-expansion-item expand-separator
                            icon="mdi-list-box-outline"
                            header-class="text-pink-7"
                            group="permissions_free"
                            v-for="permissionList in availablePermissions"
                            :key="permissionList"
                            :label="permissionList[0].category + ' (' + permissionList.length + ')'">
            <div v-if="permissionList.length > 0">
              <q-item clickable v-ripple v-for="permission in permissionList" :key="permission.name">
                <q-item-section side top>
                  <q-checkbox v-model="permission.selected"
                              color="pink-7"
                              @update:model-value="addToAddPermission(permission)"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ permission.name }}</q-item-label>
                  <q-item-label caption>{{ permission.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </q-expansion-item>
        </q-list>
      </div>
    </div>
    <q-ajax-bar ref="ajaxBar" position="top" color="secondary" size="10px" skip-hijack/>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import { api } from 'boot/axios'
import { companyStore } from 'stores/companyStore'
import RankPolicyListSkeletonComponent from 'components/userManagement/skeletons/RankPolicyListSkeletonComponent.vue'
import Permission from 'src/misc/classes/UserManagement/Permission'
import Rank from 'src/misc/classes/Rank/Rank'
import laravelEcho from 'boot/laravelecho'
import { useUserStore } from 'stores/useUserStore'
import { QAjaxBar } from 'quasar'
import { CompanyModuleAccess } from 'src/misc/classes/company/CompanyModuleAccess'

export default defineComponent({
  name: 'EmployeeRankPermissions',
  components: { RankPolicyListSkeletonComponent },
  setup () {
    const backendUrl = ref<string | undefined>(process.env.BACKEND_SERVER)
    const selectedRank = ref<Rank | null>()
    const availableRanks = ref<[Rank]>()
    const userStore = useUserStore()
    const userId = computed(() => userStore.userId)
    const cStore = companyStore()
    const companyId = computed(() => cStore.companyId)
    const availablePermissions = ref<[[Permission]]>()
    const selectedPermissions = ref<[[Permission]]>()
    const loadingRanks = ref(true)
    const loadedRankPermissions = ref(false)
    const permissionsToAdd = ref<Permission[]>()
    const permissionsToRemove = ref<Permission[]>()
    const removeButtonDisabled = ref<boolean>(true)
    const addButtonDisabled = ref<boolean>(true)
    const ajaxBar = ref<QAjaxBar | null>(null)
    const availableModules = ref<CompanyModuleAccess>(new CompanyModuleAccess())
    watch(companyId, () => {
      getPolicies()
      getCompanyRanks()
      getCompanyModules()
    })
    watch(userId, () => {
      joinReloadChannel()
    })
    onMounted(() => {
      joinReloadChannel()
      getCompanyRanks()
      getCompanyModules()
    })
    onUnmounted(() => {
      // stop listening to the change event
      laravelEcho.leave('user.reload.' + userId.value)
    })
    function joinReloadChannel () {
      if (userId.value <= 0) { return }
      // override ajaxBar default
      laravelEcho.private('user.reload.' + userId.value)
        .listen('.user.reload', () => {
          // clear the selected permissions
          clearSelectedPermissions()
          // just reload the companies
          getPolicies()
        })
    }
    function getCompanyRanks () {
      if (companyId.value <= 0) { return }
      api.get('/api/ranks/reduced/' + companyId.value)
        .then((response) => {
          availableRanks.value = response.data.data
          loadingRanks.value = false
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function getCompanyModules () {
      if (companyId.value <= 0) { return }
      api.get('/api/company/modules/' + companyId.value)
        .then((response) => {
          availableModules.value.setModules(response.data.companyModules)
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function addToAddPermission (permission: Permission | null) {
      if (permission !== null) {
        // add
        if (permission.selected) {
          if (permissionsToAdd.value === undefined) {
            permissionsToAdd.value = [permission]
          } else {
            permissionsToAdd.value?.push(permission)
          }
          permissionsToAdd.value?.length > 0 ? addButtonDisabled.value = false : addButtonDisabled.value = true
        } else {
          // remove
          const index = permissionsToAdd.value?.indexOf(permission)
          if (index !== undefined && index > -1) {
            permissionsToAdd.value?.splice(index, 1)
          }
          permissionsToAdd.value !== undefined && permissionsToAdd.value?.length > 0 ? addButtonDisabled.value = false : addButtonDisabled.value = true
        }
      }
    }
    function addToRemovePermission (permission: Permission | null) {
      if (permission !== null) {
        // add
        if (permission.selected) {
          if (permissionsToRemove.value === undefined) {
            permissionsToRemove.value = [permission]
          } else {
            permissionsToRemove.value?.push(permission)
          }
          permissionsToRemove.value.length > 0 ? removeButtonDisabled.value = false : removeButtonDisabled.value = true
        } else {
          // remove
          const index = permissionsToRemove.value?.indexOf(permission)
          if (index !== undefined && index > -1) {
            permissionsToRemove.value?.splice(index, 1)
          }
          permissionsToRemove.value !== undefined && permissionsToRemove.value?.length > 0 ? removeButtonDisabled.value = false : removeButtonDisabled.value = true
        }
      }
    }
    function removePermissionsFromRank () {
      if (selectedRank.value === undefined || permissionsToRemove.value === undefined ||
        permissionsToRemove.value?.length < 1) return
      loadedRankPermissions.value = false
      selectedPermissions.value = undefined
      availablePermissions.value = undefined
      api.post('/api/policies/remove-update/' + companyId.value, {
        rank_id: selectedRank.value?.id,
        policies: permissionsToRemove.value
      }, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Access-Control-Allow-Origin': process.env.ACAO
        }
      })
        .then(() => {
          // clear the selected permissions
          clearSelectedPermissions()
          // just reload the companies
          getPolicies()
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function addPermissionsFromRank () {
      if (selectedRank.value === undefined || permissionsToAdd.value === undefined ||
        permissionsToAdd.value?.length < 1) return
      loadedRankPermissions.value = false
      selectedPermissions.value = undefined
      availablePermissions.value = undefined
      api.post('/api/policies/add-update/' + companyId.value, {
        rank_id: selectedRank.value?.id,
        policies: permissionsToAdd.value
      })
        .then(() => {
          // clear the selected permissions
          clearSelectedPermissions()
          // just reload the companies
          getPolicies()
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function resetEverything (newRank: Rank | null | undefined) {
      // recalculate the set and not set policies
      loadedRankPermissions.value = false
      selectedPermissions.value = undefined
      availablePermissions.value = undefined
      if (newRank !== undefined && newRank !== null && selectedRank.value !== undefined) {
        getPolicies()
      }
    }
    function getPolicies () {
      if (companyId.value <= 0 || companyId.value === undefined || selectedRank.value === undefined || selectedRank.value?.id === undefined) {
        return
      }
      ajaxBar.value?.start(5)
      api.get('/api/policies/' + companyId.value + '/' + selectedRank.value?.id)
        .then((response) => {
          availablePermissions.value = response.data.freePolicies
          selectedPermissions.value = response.data.setPolicies
          loadedRankPermissions.value = true
          ajaxBar.value?.stop()
        })
        .catch((error) => {
          console.error(error)
          ajaxBar.value?.stop()
        })
      getCompanyModules()
    }
    function clearSelectedPermissions () {
      permissionsToRemove.value = []
      permissionsToAdd.value = []
    }
    return {
      selectedRank,
      availableRanks,
      availablePermissions,
      selectedPermissions,
      loadingRanks,
      onMounted,
      loadedRankPermissions,
      checkRankChanged: watch(selectedRank, (newRank: Rank | null | undefined) => {
        resetEverything(newRank)
      }),
      addToAddPermission,
      addToRemovePermission,
      removePermissionsFromRank,
      addPermissionsFromRank,
      permissionsToAdd,
      permissionsToRemove,
      removeButtonDisabled,
      addButtonDisabled,
      backendUrl,
      ajaxBar,
      availableModules
    }
  }
})
</script>

<style scoped>

</style>
