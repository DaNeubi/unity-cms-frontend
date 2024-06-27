<template>
  <div class="column">
    <div class="row">
      <CreateSomethingNewButton icon="mdi-account-minus" :text="`Ausgewählte/n Mitarbeiter/in entlassen`"
                                @create-something-new="fireUserDialog()" v-if="canFireUser"
                                :disable="fireButtonEnabled"/>
    </div>
    <div class="row">
      <q-table
        class="default-table-height q-mt-md full-width cms-sticky-header-table"
        virtual-scroll :pagination="{ rowsPerPage: 0 }" v-model:selected="selectedUser"
        :title="`${ canFireUser ? 'Mitarbeiterübersicht (' + currentUserCount + '/' + maxUserCount + ')' : 'Mitarbeiterübersicht'}`"
        :columns="columns" :rows="availableUsers" no-data-label="Keine Daten vorhanden" :loading="loading"
        loading-label="Daten werden abgerufen..." row-key="id" :selection="canFireUser ? 'single' : 'none'"
        @selection="((state) => state.added ? fireButtonEnabled = false : fireButtonEnabled = true)">
        <template v-slot:body="props">
          <q-tr :props="props" :class="`${ props.row.id === userId ? 'custom-company-background-color inset-shadow ' : '' }`">
            <q-td v-if="canFireUser">
              <q-checkbox color="accent" v-model="props.selected"/>
            </q-td>
            <q-td v-for="headerVal in columns" :key="headerVal.name" :props="props">
              <div v-if="headerVal.name === 'rank'" class="cursor-pointer row full-width full-height items-center justify-end">
                {{ props.row.ranks.length === 1 ? props.row.ranks[0].name : '...' }}
                <q-popup-edit :model-value="props.row.ranks[0]" v-slot="scope" buttons label-set="Aktualisieren"
                              label-cancel="Abbrechen" @save="(val) => updateUserRank(val, props.row)"
                              v-if="canEditRank">
                  <q-select v-model="scope.value" :options="availableRanks" :option-value="option => option.id"
                            :option-label="(option: Rank) => option.name" dense outlined/>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'gender'" class="cursor-pointer row full-width full-height items-center justify-end">
                {{ props.row.genders.length === 1 ? props.row.genders[0].name : ' ' }}
                <q-popup-edit v-model="props.row.genders[0]" v-slot="scope" buttons label-set="Aktualisieren"
                              label-cancel="Abbrechen" v-if="props.row.genders.length > 0 && canEditGender"
                              @save="(val) => updateUserGender(val, props.row)">
                  <q-select v-model="scope.value" :options="availableGenders" :option-value="option => option.id"
                            :option-label="(option: Gender) => option.name" dense outlined/>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'note'" class="cursor-pointer row full-width full-height items-center justify-end">
                {{ props.row.notes.length === 1 ? props.row.notes[0].note : ' ' }}
                <q-popup-edit :model-value="props.row.notes[0].note" v-slot="scope" buttons
                              v-if="canEditNote" label-set="Aktualisieren" label-cancel="Abbrechen"
                              @save="(val) => updateUserNote(val, props.row)">
                  <q-input v-model="scope.value" dense autofocus outlined counter type="textarea" maxlength="2048"/>
                </q-popup-edit>
              </div>
              <div v-else-if="headerVal.name === 'joined_at'">
                {{ FormatDateTime(props.row[headerVal.name]) }}
              </div>
              <div v-else>
                {{ props.row[headerVal.name] }}
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

<script setup lang="ts">
import User from 'src/misc/classes/User/User'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { api } from 'boot/axios'
import { companyStore } from 'stores/companyStore'
import laravelEcho from 'boot/laravelecho'
import { useUserStore } from 'stores/useUserStore'
import Rank from 'src/misc/classes/Rank/Rank'
import { PackedUser } from 'src/misc/classes/User/PackedUser'
import Gender from 'src/misc/classes/Gender/Gender'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import { useQuasar } from 'quasar'
import AssignPolicies from 'src/misc/functions/policies/Policies'
import TableHeader from 'src/misc/classes/General/TableHeader'
import Note from 'src/misc/classes/Note/Note'
import FormatDateTime from '../../misc/functions/FormatDateTime'

const $q = useQuasar()
const availableUsers = ref<User[] | undefined>([])
const cStore = companyStore()
const userStore = useUserStore()
const userId = computed(() => userStore.userId)
const companyId = computed(() => cStore.companyId)
const columns = ref()
const availableRanks = ref<Rank[] | undefined>()
const availableGenders = ref<Gender[] | undefined>()
const loading = ref(true)
const selectedUser = ref<User[] | undefined>(undefined)
const canEditGender = ref<boolean>(false)
const canEditRank = ref<boolean>(false)
const canEditNote = ref<boolean>(false)
const canFireUser = ref<boolean>(false)
const fireButtonEnabled = ref<boolean>(true)
const currentUserCount = computed(() => availableUsers.value?.length ?? 0)
const maxUserCount = ref<number>(0)
watch(companyId, () => {
  getPolicies()
  getAllUsersForCompany()
  getAllRanks()
  getAllGenders()
})
watch(userId, () => {
  joinReloadChannel()
})
onMounted(() => {
  // get permissions
  getPolicies()
  joinReloadChannel()
  getAllUsersForCompany()
  getAllRanks()
  getAllGenders()
})
watch(canEditRank, () => {
  getAllRanks()
})
watch(canEditGender, () => {
  getAllGenders()
})
onUnmounted(() => {
  // stop listening to the change event
  laravelEcho.leave('user.reload.' + userId.value)
})
function joinReloadChannel () {
  if (userId.value <= 0) { return }
  // listen to the change event
  laravelEcho.private('user.reload.' + userId.value)
    .listen('.user.reload', () => {
      // just reload the companies
      loading.value = true
      availableUsers.value = undefined
      columns.value = undefined
      selectedUser.value = undefined
      fireButtonEnabled.value = true
      getAllUsersForCompany()
    })
}
function getPolicies () {
  if (companyId.value <= 0) { return }
  api.get('/api/policies/userManagement/userList/' + companyId.value)
    .then((res) => {
      AssignPolicies([
        { policyName: 'UserManagement_UserList_Edit_Gender', policyToAssign: canEditGender },
        { policyName: 'UserManagement_UserList_Edit_Rank', policyToAssign: canEditRank },
        { policyName: 'UserManagement_UserList_Edit_Note', policyToAssign: canEditNote },
        { policyName: 'UserManagement_UserList_Fire', policyToAssign: canFireUser }
      ], res.data.employeeListPolicies)
    })
    .catch((err) => {
      console.error(err)
    })
}
function getAllRanks () {
  if (companyId.value <= 0) { return }
  if (!canEditRank.value) { return }
  api.get('/api/ranks/reduced/' + companyId.value)
    .then((res) => {
      availableRanks.value = res.data.data
    })
    .catch((err) => {
      console.error(err)
    })
}
function getAllGenders () {
  if (companyId.value <= 0) { return }
  if (!canEditGender.value) { return }
  api.get('/api/genders/reduced/' + companyId.value)
    .then((res) => {
      availableGenders.value = res.data.data
    })
    .catch((err) => {
      console.error(err)
    })
}
function getAllUsersForCompany () {
  if (companyId.value <= 0) { return }
  api.get('/api/companyUsers/reducedForEmployeeList/' + companyId.value)
    .then((res) => {
      availableUsers.value = []
      // first owners then users
      if (res.data.owners !== undefined) {
        const owners = res.data.owners as PackedUser[]
        owners.forEach((user: PackedUser) => {
          availableUsers.value?.push(user.user)
        })
      }
      if (res.data.users !== undefined) {
        res.data.users.forEach((user: PackedUser) => {
          user.user.joined_at = user.joined_at
          availableUsers.value?.push(user.user)
        })
      }
      // check if the user has a rank, gender or note, if not, add an empty one
      availableUsers.value?.forEach((user: User) => {
        if (user.ranks?.length === 0) {
          user.ranks?.push(new Rank())
        }
        if (user.genders?.length === 0) {
          user.genders?.push(new Gender())
        }
        if (user.notes?.length === 0) {
          user.notes?.push(new Note())
        }
      })
      // order the availableUsers by the order number of their rank
      availableUsers.value?.sort((a: User, b: User) => {
        if (a.ranks === null && b.ranks !== null) {
          return b.ranks[0].weight
        } else if (a.ranks !== null && b.ranks === null) {
          return a.ranks[0].weight
        } else if (a.ranks !== null && b.ranks !== null) {
          return b.ranks[0].weight - a.ranks[0].weight
        } else {
          return 0
        }
      })
      // set the columns
      columns.value = res.data.headers
      columns.value?.sort((a: TableHeader, b: TableHeader) => {
        return a.order - b.order
      })
      // set the max users
      maxUserCount.value = res.data.userLimit
      loading.value = false
    })
    .catch((err) => {
      console.error(err)
    })
}
function updateUserRank (newValue: Rank, user: User) {
  // check if the rank has the weight of 100, if so cancel, the owner rank cannot be changed to
  if (newValue.weight === 100) {
    $q.notify({
      type: 'negative',
      message: 'Du kannst niemandem den Inhaber Rang zuweisen!',
      position: 'center'
    })
    return
  }
  api.patch('/api/companyUsers/updateUser/' + companyId.value, {
    user_id: user.id,
    company_id: companyId.value,
    rank_id: newValue.id
  })
    .catch((err) => {
      console.error(err)
    })
}
function updateUserGender (newValue: Gender, user: User) {
  api.patch('/api/genders/updateUser/' + companyId.value, {
    user_id: user.id,
    company_id: companyId.value,
    gender_id: newValue.id
  })
    .catch((err) => {
      console.error(err)
    })
}
function updateUserNote (newValue: string, user: User) {
  api.patch('/api/userNotes/updateUser/' + companyId.value, {
    user_id: user.id,
    company_id: companyId.value,
    note: newValue
  })
    .then(() => {
      if (user !== null && user.notes !== null && user.notes.length > 0) {
        user.notes[0].note = newValue
      }
    })
    .catch((err) => {
      console.error(err)
    })
}
function fireUserDialog () {
  $q.dialog({
    title: 'Mitarbeiter/in kündigen',
    message: 'Bist du dir sicher, dass du die Person entlassen willst?',
    cancel: true,
    persistent: true,
    prompt: {
      model: '',
      type: 'textarea',
      maxlength: 1024,
      counter: true,
      required: true
    }
  }).onOk((data: string) => {
    fireUser(data)
  })
}
function fireUser (fireReason: string) {
  if (fireReason.length < 1) {
    $q.notify({
      type: 'negative',
      message: 'Der Kündigungsgrund darf nicht leer sein!',
      position: 'center'
    })
    return
  }
  if (selectedUser.value !== undefined) {
    selectedUser?.value?.forEach((user: User) => {
      api.patch('/api/users/fire/' + companyId.value, {
        user_id: user.id,
        reason: fireReason
      })
        .then(() => {
          availableUsers.value = availableUsers.value?.filter((u: User) => u.id !== user.id)
        })
        .catch((err) => {
          console.error(err)
        })
    })
  }
}
</script>

<style scoped>

</style>
