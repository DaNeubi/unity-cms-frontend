<template>
  <q-card flat
          bordered
          class="absolute-center">
    <q-card-section>
      <div class="text-h4">
        Hier kann eine neue Person erstellt werden
      </div>
    </q-card-section>
    <q-card-section>
      <q-toggle v-model="createFromBlank" keep-color color="orange" icon="mdi-account" size="xl"
                label="Neue Person erstellen, oder Person aus bestehendem Mitarbeiter erstellen"/>
    </q-card-section>
    <q-card-section v-if="createFromBlank">
      <div class="text-h6 q-mb-sm">
        Neue Person erstellen
      </div>
      <div class="column q-gutter-md">
        <q-input v-model="firstName" label="Vorname" maxlength="128" counter outlined/>
        <q-input v-model="lastName" label="Nachname" maxlength="128" counter outlined/>
        <q-input v-model="birthLastName" label="Mädchenname" maxlength="128" counter outlined
                 hint="Muss nur angegeben werden, wenn verheiratet und anderer Nachname"/>
        <q-input label="Geburtsdatum"
                 outlined v-model="birthDate" mask="date" :rules="[date]">
          <template v-slot:append>
            <q-icon name="mdi-calendar" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="birthDate">
                  <div class="row justify-center">
                    <q-btn flat round dense color="primary" label="OK" v-close-popup/>
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-input v-model="phone" label="Telefonnummer" maxlength="32" counter outlined/>
        <q-select v-model="gender" label="Geschlecht" outlined :options="availableGenders"/>
        <q-select v-model="bloodType" v-if="medicalModulesEnabled" label="Blutgruppe" outlined
                  :options="availableBloodTypes"/>
        <q-checkbox label="Tod" v-if="medicalModulesEnabled" v-model="dead" class="q-mt-md"/>
        <q-checkbox :label="`Tier? ->` + (animal ? ` Ja` : ` Nein`)" :true-value="1" v-if="medicalModulesEnabled"
                    :false-value="0" v-model="animal">
          <q-tooltip>
            Ist die Person ein Tier?
          </q-tooltip>
        </q-checkbox>
      </div>
    </q-card-section>
    <q-card-section v-if="!createFromBlank">
      <div class="text-h6">
        Person aus bestehender Person erstellen
      </div>
      <div class="column q-gutter-md">
        <div v-if="loadingUsers">
          <q-skeleton height="30px"/>
        </div>
        <div v-else>
          <q-select v-model="user" outlined class="q-mt-sm" :options="availableUsers"
                    :option-label="user => `${user.first_name} ${user.last_name}`" label="Mitarbeiter/innen"/>
          <q-input v-model="birthLastName" label="Mädchenname" class="q-mt-md" outlined
                   hint="Muss nur angegeben werden, wenn verheiratet und anderer Nachname"/>
          <q-input label="Geburtsdatum" outlined v-model="birthDate" class="q-mt-md" mask="date" :rules="[date]">
            <template v-slot:append>
              <q-icon name="mdi-calendar" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="birthDate">
                    <div class="row justify-center">
                      <q-btn flat round dense color="primary" label="OK" v-close-popup/>
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-checkbox label="Tod" v-if="medicalModulesEnabled" v-model="dead" class="q-mt-md"/>
          <q-select v-model="gender" v-if="medicalModulesEnabled" label="Geschlecht" class="q-mt-md" outlined
                    :options="availableGenders"/>
          <q-select v-model="bloodType" v-if="medicalModulesEnabled" label="Blutgruppe" outlined class="q-mt-md"
                    :options="availableBloodTypes"/>
          <q-checkbox :label="`Tier? ->` + (animal ? ` Ja` : ` Nein`)" class="q-mt-md" v-if="medicalModulesEnabled"
                      :true-value="1" :false-value="0" v-model="animal">
            <q-tooltip>
              Ist die Person ein Tier?
            </q-tooltip>
          </q-checkbox>
        </div>
      </div>
    </q-card-section>
    <q-card-actions>
      <q-btn label="Speichern" icon="mdi-content-save" size="md" @click="createNewPerson()" color="positive"/>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import IUser from 'src/misc/interfaces/User/IUser'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import Gender from 'src/misc/Enums/Gender/Gender'
import { api } from 'src/boot/axios'
import { companyStore } from 'stores/companyStore'
import BloodType from 'src/misc/Enums/Medical/BloodType'
import laravelEcho from 'boot/laravelecho'
import { useUserStore } from 'stores/useUserStore'
import { useRouter } from 'vue-router'

const firstName = ref<string>()
const lastName = ref<string>()
const birthLastName = ref<string>()
const birthDate = ref<string>()
const phone = ref<string>()
const gender = ref<number>()
const animal = ref<number>(0)
const user = ref<IUser>()
const createFromBlank = ref<boolean>(true)
const bloodType = ref<number>()
const availableGenders = Object.values(Gender).filter((v) => typeof v === 'string')
const availableBloodTypes = Object.values(BloodType).filter((v) => typeof v === 'string')
const loadingUsers = ref<boolean>(false)
const cStore = companyStore()
const companyId = computed(() => cStore.companyId)
const userStore = useUserStore()
const userId = computed(() => userStore.userId)
const availableUsers = ref<IUser[]>()
const dead = ref<boolean>(false)
const router = useRouter()
const medicalModulesEnabled = ref<boolean>(false)
onMounted(async () => {
  getContactModules()
})
onUnmounted(() => {
  // stop listening to the change event
  laravelEcho.leave('user.reload.' + userId.value)
})
watch(createFromBlank, () => {
  if (!createFromBlank.value) {
    if (availableUsers.value === undefined) {
      getAllAvailableCompanyUser()
    }
  }
  getContactModules()
})
function getAllAvailableCompanyUser () {
  if (companyId.value === 0) return
  loadingUsers.value = true
  api.get('/api/companyUsers/forContactManagementCreation/' + companyId.value)
    .then((response) => {
      availableUsers.value = response.data.users
      loadingUsers.value = false
    })
    .catch((error) => {
      console.error(error)
    })
}
function getContactModules () {
  if (companyId.value === 0) return
  api.get('/api/person/features/' + companyId.value)
    .then((response) => {
      if (response.data.medicalModule !== undefined) {
        medicalModulesEnabled.value = response.data.medicalModule
      }
    })
    .catch((error) => {
      console.error(error)
    })
}
function createNewPerson () {
  if (companyId.value === 0) return
  api.post('/api/person/create/' + companyId.value, {
    first_name: firstName.value,
    last_name: lastName.value,
    birth_last_name: birthLastName.value,
    date_of_birth: birthDate.value,
    phone: phone.value,
    gender: gender.value ? Gender[gender.value] : null,
    animal: animal.value,
    user_id: user.value?.id,
    blood_type: bloodType.value !== undefined ? BloodType[bloodType.value] : null,
    dead: dead.value
  })
    .then(() => {
      returnToMainView()
    })
    .catch((error) => {
      console.error(error)
    })
}
function returnToMainView () {
  router.push('/contact-management/main/' + companyId.value)
}
</script>

<style scoped>

</style>
