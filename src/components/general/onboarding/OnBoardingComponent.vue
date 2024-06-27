<template>
  <q-card>
    <q-img src="/images/welcome_bg_1.webp" loading="lazy" height="70vh">
      <q-card-section class="absolute-center custom-image-content">
        <q-stepper v-model="stepper" animated flat header-nav style="width: 50vw; min-height: 50vh; height: 50vh;" class="glass-stepper">
          <q-step title="Willkommen" :name="0" icon="mdi-human-greeting" active-icon="mdi-human-greeting"
                  done-color="warning" active-color="secondary">
            <div class="column q-gutter-sm">
              <div class="text-h5">
                Hallo {{ userName }}!
              </div>
              <div class="text-body1">
                Herzlich Willkommen im neuen Connect Management System.
              </div>
              <div class="text-body2">
                Bevor du loslegen kannst, benötigen wir noch ein paar Informationen von dir.
              </div>
            </div>
          </q-step>
          <q-step title="Grundlegende Informationen" :name="1" icon="mdi-account-card" :error="disableSaveButton"
                  error-color="negative" active-icon="mdi-account-edit" done-color="warning" active-color="secondary">
            <q-scroll-area style="height: calc(40vh - 111px);">
              <div class="column q-gutter-sm">
                <div class="text-body1">
                  Bitte fülle die folgenden Felder aus, um deine Grundlegenden Informationen zu vervollständigen.
                </div>
                <q-input v-model="phone" type="text" outlined rounded label="Deine aktuelle Handy Nummer"
                         color="orange-5" mask="###-#######" fill-mask reactive-rules hint="Format: 555-#######"
                         :rules="[val => !val.includes('_') || 'Bitte alles ausfüllen']"/>
                <q-input v-model="bankAccount" type="text" outlined rounded label="Deine Kontonummer" color="orange-5"
                         mask="L\S########" fill-mask reactive-rules
                         :rules="[val => !val.includes('_') || 'Bitte alles ausfüllen']"/>
                <div class="text-body1">
                  Dein Geburtsdatum
                </div>
                <q-date v-model="birthDate" landscape mask="DD-MM-YYYY" :navigation-max-year-month="minDate"
                        :default-year-month="minDate"/>
              </div>
            </q-scroll-area>
          </q-step>
          <q-step title="Zusätzliche Informationen" :name="2" icon="mdi-account"
                  done-color="warning" active-color="secondary" >
            <div class="column q-gutter-sm full-height">
              <div class="text-body1">
                Wir von Connect nehmen den Datenschutz sehr ernst. Um dir bei dem Schutz deiner Daten bestmöglich helfen zu können, kannst du nachfolgende Felder ausfüllen und wir werden diese Informationen sicher auf unseren Servern speichern.
              </div>
              <q-scroll-area style="height: calc(40vh - 170px);">
                <div class="column q-gutter-sm">
                  <div v-if="loadingAdditionalInformationFields">
                    <q-skeleton/>
                  </div>
                  <div v-for="userField in userInformation" :key="userField.id" v-else class="col-12">
                    <q-input v-model="userField.value" outlined rounded type="textarea" color="orange-5"
                             :label="userField.user_information_field?.name" :autogrow="userField.user_information_field?.name.length < 100"
                             :shadow-text="userField.user_information_field?.name.length > 100 ? userField.user_information_field?.name : ''"
                             v-if="userField.user_information_field?.dynamic_field?.type === 'TEXTAREA'"/>
                    <q-toggle v-model="userField.value" false-value="0" true-value="1" color="orange-5"
                              :label="`${userField.user_information_field?.name} - ${ +userField.value === 1 ? 'Ja' : 'Nein'}`"
                              v-else-if="userField.user_information_field?.dynamic_field?.type === 'TOGGLE'"/>
                    <q-input v-model.number="userField.value" outlined rounded type="number" color="orange-5"
                             :label="userField.user_information_field?.name"
                             v-else-if="userField.user_information_field?.dynamic_field?.type === 'NUMBER'"/>
                    <q-input v-model="userField.value" outlined rounded color="orange-5"
                             :label="userField.user_information_field?.name" :type="userField.showHidden ? 'text' : 'password'"
                             v-else-if="userField.user_information_field?.dynamic_field?.type === 'HIDDEN'">
                      <template v-slot:append>
                        <q-icon :name="userField.showHidden ? 'mdi-eye' : 'mdi-eye-off'"
                                class="cursor-pointer"
                                @click="userField.showHidden = !userField.showHidden"/>
                      </template>
                    </q-input>
                    <q-input v-model="userField.value" outlined rounded type="text"
                             :label="userField.user_information_field?.name" color="orange-5"
                             v-else-if="userField.user_information_field?.dynamic_field.type === 'DATE'">
                      <template v-slot:append>
                        <q-icon name="mdi-calendar" class="cursor-pointer">
                          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-date v-model="userField.value" mask="DD.MM.YYYY">
                              <div class="row items-center justify-end">
                                <q-btn v-close-popup label="Schließen" color="primary" flat/>
                              </div>
                            </q-date>
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>
                </div>
              </q-scroll-area>
            </div>
          </q-step>
          <template v-slot:navigation>
            <q-stepper-navigation>
              <div class="row items-center q-gutter-md">
                <q-btn label="Zurück" color="accent" @click="stepper--" :disable="stepper === 0"
                       icon="mdi-arrow-left-bold" rounded/>
                <transition leave-active-class="animated flipOutX">
                  <q-btn label="Weiter" color="secondary" @click="stepper++" :disable="stepper === 2"
                         icon="mdi-arrow-right-bold" v-if="stepper < 2" rounded/>
                </transition>
                <transition enter-active-class="animated flipInX"
                            leave-active-class="animated flipOutX">
                  <q-btn label="Speichern und Loslegen" color="primary" @click="saveUserInformation()"
                         v-if="stepper === 2" icon="mdi-content-save" rounded :disable="disableSaveButton"/>
                </transition>
                <q-btn label="Keine Daten abgeben" rounded color="negative" id="escapeButton" @mouseover="moveButton()"
                       @click="moveButton(true)" class="cursor-none"/>
              </div>
            </q-stepper-navigation>
          </template>
        </q-stepper>
      </q-card-section>
    </q-img>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useUserStore } from 'stores/useUserStore'
import { date, useQuasar } from 'quasar'
import IUserInformationField from 'src/misc/interfaces/User/IUserInformationField'
import { api } from 'boot/axios'
import IUserInformation from 'src/misc/interfaces/User/IUserInformation'
import laravelEcho from 'boot/laravelecho'
import { useRouter } from 'vue-router'
import IGeneralReloadNotification from 'src/misc/interfaces/User/IGeneralReloadNotification'
import ReloadType from 'src/misc/Enums/Reload/ReloadType'

const stepper = ref(0)
const userStore = useUserStore()
const userName = ref<string>(userStore.userName)
const userId = computed(() => userStore.userId)
const phone = ref<string>('')
const bankAccount = ref<string>('')
const birthDate = ref<string>('')
const minDate = ref<string>(date.formatDate(date.subtractFromDate(new Date(), { years: 21 }).toISOString(), 'YYYY/MM/DD'))
const additionalInformationFields = ref<IUserInformationField[]>([])
const loadingAdditionalInformationFields = ref<boolean>(false)
const userInformation = ref<IUserInformation[]>([])
const router = useRouter()
const disableSaveButton = computed(() => {
  return phone.value === '' || bankAccount.value === '' || birthDate.value === '' || phone.value.includes('_') || bankAccount.value.includes('_') || !phone.value.startsWith('555-')
})
const pageX = ref<number | undefined>(document.getElementById('currentPageView')?.offsetWidth)
const pageY = ref<number | undefined>(document.getElementById('currentPageView')?.offsetHeight)
const $q = useQuasar()

onMounted(() => {
  joinReloadChannel()
  // listen to the resize event
  window.onresize = () => {
    pageX.value = document.getElementById('currentPageView')?.offsetWidth
    pageY.value = document.getElementById('currentPageView')?.offsetHeight
  }
})

watch(() => stepper.value, () => {
  if (stepper.value === 2 && additionalInformationFields.value.length === 0) {
    loadAdditionalInformationFields()
  } else if (stepper.value === 2 && additionalInformationFields.value.length > 0) {
    buildUserInformation()
  }
})
function joinReloadChannel () {
  if (userId.value <= 0) return
  // listen to the change event
  laravelEcho.private('user.reload.' + userId.value)
    .listen('.user.reload', (cb: IGeneralReloadNotification) => {
      // push to home if successful
      if (cb.userNotification.type === ReloadType.Success.valueOf()) {
        router.push('/')
      }
    })
}
function loadAdditionalInformationFields () {
  loadingAdditionalInformationFields.value = true
  api.get('/api/user/additionalFields')
    .then((response) => {
      additionalInformationFields.value = response.data
      buildUserInformation()
      loadingAdditionalInformationFields.value = false
    })
    .catch((error) => {
      console.error(error)
    })
}
function buildUserInformation () {
  userInformation.value = []
  additionalInformationFields.value.forEach((field: IUserInformationField) => {
    userInformation.value?.push({
      id: Math.random(),
      value: '',
      user_id: userStore.userId,
      user_information_field_id: field.id,
      user_information_field: field,
      showHidden: false
    })
  })
}
function saveUserInformation () {
  // check if the required fields are set
  if (phone.value === '' || bankAccount.value === '' || birthDate.value === '' || phone.value.includes('_') || bankAccount.value.includes('_')) {
    return
  }
  api.post('/api/user/updateFields', {
    user_id: userStore.userId,
    phone: phone.value,
    bank_account_number: bankAccount.value,
    birth_day: birthDate.value,
    fields: userInformation.value
  })
    .catch((error) => {
      console.error(error)
    })
}
function getRandomNumber (num: number) {
  return Math.floor(Math.random() * (num + 1))
}
function moveButton (clicked = false) {
  if (clicked) {
    $q.notify({
      message: 'Sorry, wir müssen Daten sammeln, ohne geht\'s leider nicht.',
      color: 'negative',
      position: 'center',
      timeout: 5000,
      icon: 'mdi-easter-egg'
    })
  }
  if (pageX.value === undefined) {
    pageX.value = document.getElementById('currentPageView')?.offsetWidth ?? 0
  }
  if (pageY.value === undefined) {
    pageY.value = document.getElementById('currentPageView')?.offsetHeight ?? 0
  }
  const top = getRandomNumber(pageX.value - window.innerWidth)
  const left = getRandomNumber(pageY.value - window.innerHeight)
  document.getElementById('escapeButton')?.style.setProperty('top', `${top}px`)
  document.getElementById('escapeButton')?.style.setProperty('left', `${left}px`)
}

</script>

<style scoped>
.glass-stepper {
  background-color: rgba(37, 37, 37, 0.8);
  border-radius: 25px;
}
.custom-image-content {
  padding: unset;
  background-color: unset;
}
</style>
