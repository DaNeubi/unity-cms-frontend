<template>
  <div class="row justify-start q-gutter-md">
    <div class="col-3 q-mb-sm">
      <div class="text-weight-bold text-h5">
        <q-icon name="mdi-account-heart"
                size="md"
                color="accent"/>
        Name:
      </div>
      <div class="q-mt-sm">
        {{ userName }}
      </div>
    </div>
    <div class="col-4">
      <div class="text-weight-bold text-h5">
        <q-icon name="mdi-at"
                size="md"
                color="accent"/>
        U-Mail:
      </div>
      <div class="q-mt-sm">
        <q-spinner-orbit v-if="loading"
                         color="accent"/>
        <div v-else>
          {{ uMail }}
        </div>
      </div>
    </div>
    <div class="col-4">
    </div>
    <div class="col-3">
      <div class="text-weight-bold text-h5">
        <q-icon name="mdi-cellphone"
                size="md"
                color="accent"/>
        Handynummer:
      </div>
      <div>
        <q-input v-model="phone"
                 outlined
                 dense
                 type="text"
                 class="q-mt-sm"
                 mask="(###)-### ## ##"
                 fill-mask
                 :loading="loading"
                 color="accent">
          <template v-slot:prepend>
            <q-icon name="mdi-pencil"
                    color="accent"/>
          </template>
        </q-input>
      </div>
    </div>
    <div class="col-4">
      <div class="text-weight-bold text-h5">
        <q-icon name="mdi-bank"
                size="md"
                color="accent"/>
        Kontonummer:
      </div>
      <div>
        <q-input v-model="bankAccount"
                 outlined
                 dense
                 type="text"
                 class="q-mt-sm"
                 mask="L\S########"
                 fill-mask
                 :loading="loading"
                 color="accent">
          <template v-slot:prepend>
            <q-icon name="mdi-pencil"
                    color="accent"/>
          </template>
        </q-input>
      </div>
    </div>
  </div>
  <div class="row q-mt-md">
    <div class="col-2">
      <EditSomethingButton text="Speichern"
                           @create-something-new="updateUserInformation()"/>
    </div>
  </div>
</template>

<script setup lang="ts">

import { onMounted, ref } from 'vue'
import { useUserStore } from 'stores/useUserStore'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'
import { api } from 'boot/axios'

const userStore = useUserStore()
const userName = ref<string>(userStore.userName)
const uMail = ref<string>('platzhalter@umail.com')
const phone = ref<string>('(555)-000 00 00')
const bankAccount = ref<string>('LS100000')
const loading = ref<boolean>(false)

onMounted(() => {
  getAllUserInfo()
})

function getAllUserInfo () {
  loading.value = true
  api.get('/api/user/getForUserMenu')
    .then((res) => {
      userName.value = res.data.first_name + ' ' + res.data.last_name
      uMail.value = res.data.email
      phone.value = res.data.phone
      bankAccount.value = res.data.bank_account_number
      loading.value = false
    })
    .catch((err) => {
      console.error(err)
    })
}

function updateUserInformation () {
  api.patch('/api/user/updateUserBaseInformation', {
    phone: phone.value,
    bank_account_number: bankAccount.value
  })
    .catch((err) => {
      console.error(err)
    })
}

</script>

<style scoped>

</style>
