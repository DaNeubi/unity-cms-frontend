<template>
  <q-card flat class="absolute-center card-size">
    <q-card-section>
      <div class="row">
        <div class="col-12">
          <q-select v-model="selectedUser" :options="availableSelectUsers" label="Benutzer auswählen" use-input
                    :input-debounce="300" outlined clearable :loading="loadingUsers" @filter="filterUser"
                    @update:modelValue="getSelectedUserPolicies"
                    :option-label="option => `${option.first_name} ${option.last_name} (${option?.phone ?? '-'})`"/>
        </div>
        <div class="col-12 q-mt-lg">
          <q-select v-model="selectedPolicies" :options="availableSelectPolicies" option-value="id"
                    label="Berechtigungen auswählen" multiple use-chips outlined clearable :loading="loadingPolicies"
                    @filter="filterPolicy" :option-label="option => option.name">
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                  <q-item-label caption> {{ scope.opt.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:selected-item="scope">
              <q-chip removable dense @remove="scope.removeAtIndex(scope.index)" :tabindex="scope.tabindex"
                      color="teal-3" text-color="black" :label="scope.opt.name"/>
            </template>
          </q-select>
        </div>
      </div>
    </q-card-section>
    <q-card-section>
      <create-something-new-button text="Änderungen übernehmen" :disable="selectedUser === undefined"
                                   @create-something-new="updatePolicies()"/>
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

<script setup lang="ts">
import IUser from 'src/misc/interfaces/User/IUser'
import { onMounted, ref } from 'vue'
import { IPolicy } from 'src/misc/interfaces/Policy/IPolicy'
import { api } from 'boot/axios'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'

const availableUsers = ref<IUser[]>()
const availableSelectUsers = ref<IUser[]>()
const availableSelectPolicies = ref<IPolicy[]>()
const selectedUser = ref<IUser>()
const availablePolicies = ref<IPolicy[]>()
const selectedPolicies = ref<IPolicy[]>()
const loadingUsers = ref<boolean>(false)
const loadingPolicies = ref<boolean>(false)
const usersWithPolicies = ref<IUser[]>([])

onMounted(() => {
  getPolicies()
  getUsers()
  getUsersWithPermissions()
})

function getPolicies () {
  loadingPolicies.value = true
  api.get('/api/administration/externalAccess/policies')
    .then((res) => {
      availablePolicies.value = res.data
      availableSelectPolicies.value = res.data
      loadingPolicies.value = false
    })
    .catch((err) => {
      console.error(err)
    })
}

function getUsers () {
  loadingUsers.value = true
  api.get('/api/administration/externalAccess/users')
    .then((res) => {
      availableUsers.value = res.data
      availableSelectUsers.value = res.data
      loadingUsers.value = false
    })
    .catch((err) => {
      console.error(err)
    })
}
function filterUser (val: string, update: (val: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase()
    availableSelectUsers.value = availableUsers.value
      ?.filter((v: IUser) => (v.first_name.toLowerCase() + v.last_name.toLowerCase() + v.phone?.toLowerCase()).indexOf(needle) > -1)
  })
}
function filterPolicy (val: string, update: (val: () => void) => void) {
  update(() => {
    const needle = val.toLowerCase()
    availableSelectUsers.value = availablePolicies.value
      ?.filter((v: IPolicy) => v.name.toLowerCase().indexOf(needle) > -1)
  })
}
function getSelectedUserPolicies (user?: IUser) {
  if (user === undefined || user === null) return
  api.get('/api/administration/externalAccess/userPolicies?user_id=' + user.id)
    .then((res) => {
      selectedPolicies.value = res.data
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
  getUsers()
  getUsersWithPermissions()
}
function updatePolicies () {
  if (selectedUser.value === undefined || selectedUser.value === null) return
  api.patch('/api/administration/externalAccess/updateUserPolicies', {
    user_id: selectedUser.value?.id,
    policies: selectedPolicies.value
  })
    .then(() => {
      resetOnSuccess()
    })
    .catch((err) => {
      console.error(err)
    })
}
function getUsersWithPermissions () {
  api.get('/api/administration/externalAccess/usersWithPermissions')
    .then((res) => {
      usersWithPolicies.value = res.data
    })
    .catch((err) => {
      console.error(err)
    })
}
</script>

<style scoped>
.card-size {
  width: 50vw;
  height: 40vh;
}
</style>
