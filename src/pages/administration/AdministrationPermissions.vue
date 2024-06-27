<template>
  <q-card flat class="absolute-center card-size">
    <q-card-section>
      <div class="row">
        <div class="col-12">
          <q-select
            v-model="selectedUser" :options="availableSelectUsers" label="Benutzer auswählen" use-input
            :display-value="selectedUser === null || selectedUser === undefined ? '' : selectedUser?.first_name + ' ' + selectedUser?.last_name + ' (' + selectedUser?.phone + ')'"
            :option-label="option => option.first_name + ' ' + option.last_name + ' (' + option.phone + ')'"
            outlined clearable @update:model-value="getSelectedUserPolicies"
            @filter="filterUser" :loading="loadingUsers">
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  Keine Benutzer gefunden
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div class="col-12 q-mt-lg">
          <q-select v-model="selectedPolicies" :options="availablePolicies" option-value="id"
            label="Berechtigungen auswählen" :option-label="option => option.name" use-input multiple
            use-chips outlined :disable="selectedUser === undefined" clearable @filter="filterPolicy"
            :loading="loadingPolicies">
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  Keine Berechtigungen gefunden
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label> {{ scope.opt.name}} </q-item-label>
                  <q-item-label caption> {{ scope.opt.description}} </q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:selected-item="scope">
              <q-chip removable
                      dense
                      @remove="scope.removeAtIndex(scope.index)"
                      :tabindex="scope.tabindex"
                      color="teal-3"
                      text-color="black"
                      :label="scope.opt.name"/>
            </template>
          </q-select>
        </div>
      </div>
    </q-card-section>
    <q-card-section>
      <q-btn label="Änderungen übernehmen"
             color="primary"
             :disable="selectedUser === undefined"
             @click="updatePolicies()"
             class="full-width"/>
    </q-card-section>
    <q-card-section>
      <div class="col">
        <div class="text-h5">
          User mit Berechtigungen: ({{ usersWithPolicies?.length ?? 0 }})
        </div>
        <q-scroll-area style="height: 9vh;">
          <div v-for="user in usersWithPolicies" :key="user.id">
            <div>
              {{ user.first_name }} {{ user.last_name }} ({{ user?.phone }})
            </div>
          </div>
        </q-scroll-area>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { api } from 'src/boot/axios'
import { IPolicy } from 'src/misc/interfaces/Policy/IPolicy'
import IUser from 'src/misc/interfaces/User/IUser'
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue'
import laravelEcho from 'boot/laravelecho'
import { useUserStore } from 'stores/useUserStore'
import { IReloadEvent } from 'src/misc/interfaces/IReloadEvent'
import AssignPolicies from 'src/misc/functions/policies/Policies'

export default defineComponent({
  name: 'AdministrationPermissions',
  setup () {
    const availableUsers = ref<IUser[]>()
    const availableSelectUsers = ref<IUser[]>()
    const selectedUser = ref<IUser | undefined | null>()
    const availablePolicies = ref<IPolicy[]>()
    const selectedPolicies = ref<IPolicy[]>()
    const canEditPermissions = ref<boolean>(false)
    const usersWithPolicies = ref<IUser[]>([])
    const canAssignAdminPermissions = ref<boolean>(false)
    const loadingUsers = ref<boolean>(false)
    const loadingPolicies = ref<boolean>(false)
    const userStore = useUserStore()
    const userId = computed(() => userStore.userId)
    onMounted(async () => {
      getPolicies()
      getAllUsers()
      getUsersWithPermissions()

      // listen to the change event
      laravelEcho.private('user.reload.' + userId.value)
        .listen('.user.reload', (res: { userNotification: IReloadEvent }) => {
          if (res.userNotification.type === 3) {
            resetOnSuccess()
          }
        })
    })
    onUnmounted(() => {
      // stop listening to the change event
      laravelEcho.leave('user.reload.' + userId.value)
    })
    function getAllUsers () {
      loadingUsers.value = true
      api.get('/api/users/forPolicyAssignment')
        .then((res) => {
          availableUsers.value = res.data.users
          loadingUsers.value = false
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function getPolicies () {
      api.get('/api/administrationPolicies/policyAssignment')
        .then((res) => {
          AssignPolicies([
            { policyName: 'Administration_Permissions_Edit', policyToAssign: canEditPermissions },
            { policyName: 'Administration_Permissions_Edit_Admin', policyToAssign: canAssignAdminPermissions }
          ], res.data.policyAssignmentPolicies)
        })
    }
    function getSelectedUserPolicies () {
      if (selectedUser.value === undefined || selectedUser.value === null) return
      loadingPolicies.value = true
      api.get('/api/policies/withUser?userId=' + selectedUser.value?.id ?? 0)
        .then((res) => {
          availablePolicies.value = res.data.policies
          // set the already set policies
          selectedPolicies.value = res.data.userPolicies
          loadingPolicies.value = false
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function filterUser (val: string, update: (val: () => void) => void) {
      update(() => {
        const needle = val.toLowerCase()
        availableSelectUsers.value = availableUsers.value?.filter((v) => (v.first_name.toLowerCase() + v.last_name.toLowerCase() + v.phone?.toLowerCase() ?? '').indexOf(needle) > -1)
      })
    }
    function filterPolicy (val: string, update: (val: () => void) => void) {
      update(() => {
        const needle = val.toLowerCase()
        availablePolicies.value = availablePolicies.value?.filter((v) => v.name.toLowerCase().indexOf(needle) > -1 ||
          v.description.toLowerCase().indexOf(needle) > -1)
      })
    }
    function updatePolicies () {
      // if there are no policies given
      api.patch('/api/policies/updateUserPolicies', {
        userId: selectedUser.value?.id,
        policies: selectedPolicies.value
      })
        .catch((err) => {
          console.error(err)
        })
    }
    function getUsersWithPermissions () {
      api.get('/api/administration/adminPermissions/usersWithPermissions')
        .then((res) => {
          usersWithPolicies.value = res.data
        })
        .catch((err) => {
          console.error(err)
        })
    }
    function resetOnSuccess () {
      selectedUser.value = undefined
      selectedPolicies.value = undefined
      availablePolicies.value = undefined
      availableUsers.value = undefined
      getAllUsers()
      getUsersWithPermissions()
    }
    return {
      availableUsers,
      availablePolicies,
      selectedUser,
      selectedPolicies,
      canEditPermissions,
      canAssignAdminPermissions,
      loadingUsers,
      filterUser,
      loadingPolicies,
      getSelectedUserPolicies,
      filterPolicy,
      updatePolicies,
      availableSelectUsers,
      usersWithPolicies
    }
  }
})
</script>

<style scoped>
.card-size {
  width: 50vw;
  height: 40vh;
}
</style>
