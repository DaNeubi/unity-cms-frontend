<template>
  <div class="column full-height full-width">
    <div class="text-h5">
      Hier kannst du auf deine uns anvertrauten Daten Einsehen und bearbeiten.
    </div>
    <div class="row q-mt-sm q-mb-sm">
      <edit-something-button text="Informationen aktualisieren" @click="saveInformation"/>
    </div>
    <q-skeleton v-if="loadingInformation"/>
    <q-scroll-area style="height: calc(80vh - 170px);" v-else>
      <div class="column q-gutter-sm q-pa-md">
        <div class="col-12" v-for="userField in userInformation" :key="userField.id">
          <q-input v-model="userField.value" outlined type="text" color="secondary"
                   :label="userField.user_information_field?.name"
                   v-if="userField.user_information_field?.dynamic_field?.type === 'TEXTAREA'"/>
          <q-toggle v-model="userField.value" false-value="0" true-value="1" color="secondary"
                    :label="`${userField.user_information_field?.name} - ${ +userField.value === 1 ? 'Ja' : 'Nein'}`"
                    v-else-if="userField.user_information_field?.dynamic_field?.type === 'TOGGLE'"/>
          <q-input v-model.number="userField.value" outlined type="number" color="secondary"
                   :label="userField.user_information_field?.name"
                   v-else-if="userField.user_information_field?.dynamic_field?.type === 'NUMBER'"/>
          <q-input v-model="userField.value" outlined color="secondary"
                   :label="userField.user_information_field?.name" :type="userField.showHidden ? 'text' : 'password'"
                   v-else-if="userField.user_information_field?.dynamic_field?.type === 'HIDDEN'">
            <template v-slot:append>
              <q-icon :name="userField.showHidden ? 'mdi-eye' : 'mdi-eye-off'"
                      class="cursor-pointer"
                      @click="userField.showHidden = !userField.showHidden"/>
            </template>
          </q-input>
          <q-input v-model="userField.value" outlined type="text"
                   :label="userField.user_information_field?.name" color="secondary"
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
</template>

<script setup lang="ts">
import { api } from 'boot/axios'
import { computed, onMounted, ref, watch } from 'vue'
import IUserInformation from 'src/misc/interfaces/User/IUserInformation'
import IUserInformationField from 'src/misc/interfaces/User/IUserInformationField'
import { useUserStore } from 'stores/useUserStore'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'

const userInformation = ref<IUserInformation[]>([])
const loadingInformation = ref<boolean>(true)
const additionalInformationFields = ref<IUserInformationField[]>([])
const userStore = useUserStore()
const userId = computed(() => userStore.userId)
const loadedUserInformation = ref<boolean>(false)
const loadedAdditionalInformationFields = ref<boolean>(false)

onMounted(() => {
  getCurrentInformation()
  loadAvailableInformationFields()
})

watch([loadedUserInformation, loadedAdditionalInformationFields], () => {
  if (loadedUserInformation.value && loadedAdditionalInformationFields.value) {
    insertExistingInformationInFields()
  }
})

function getCurrentInformation () {
  loadingInformation.value = true
  api.get('/api/user/userInformation')
    .then((response) => {
      if (response.data.length > 0) {
        userInformation.value = response.data
      }
      loadedUserInformation.value = true
    })
    .catch((error) => {
      console.error(error)
    })
}
function loadAvailableInformationFields () {
  loadingInformation.value = true
  api.get('/api/user/additionalFields')
    .then((response) => {
      additionalInformationFields.value = response.data
      loadedAdditionalInformationFields.value = true
    })
    .catch((error) => {
      console.error(error)
    })
}
function insertExistingInformationInFields () {
  // check if the userInformation has any fields if not, fill it with the additionalInformationFields
  if (userInformation.value.length === 0) {
    additionalInformationFields.value?.forEach((field: IUserInformationField) => {
      userInformation.value.push({
        id: Math.random(),
        value: '',
        user_id: userId.value,
        user_information_field_id: field.id,
        user_information_field: field
      })
    })
    loadingInformation.value = false
    return
  }
  additionalInformationFields.value?.forEach((field: IUserInformationField) => {
    // check if field is already in userInformation
    const found: IUserInformation | undefined = userInformation.value?.find((element: IUserInformation) => element.user_information_field_id === field.id)
    // if not, add it with empty value
    if (found === undefined) {
      userInformation.value.push({
        id: Math.random(),
        value: '',
        user_id: userId.value,
        user_information_field_id: field.id,
        user_information_field: field
      })
    }
  })
  loadingInformation.value = false
}
function saveInformation () {
  api.patch('/api/user/updateUserInformation', {
    fields: userInformation.value,
    user_id: userId.value
  })
    .catch((error) => {
      console.error(error)
    })
}
</script>

<style scoped>

</style>
