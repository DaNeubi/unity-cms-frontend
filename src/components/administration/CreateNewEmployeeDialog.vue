<template>
  <q-dialog ref="dialogRef" transition-show="scale" transition-hide="scale" persistent>
    <q-card class="q-pa-lg">
      <q-card-section>
        <div class="text-h5">Neue/n Mitarbeiter/in erstellen</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <div class="column">
          <q-input label="Vorname*"
                   v-model="firstName"
                   hint="Vorname des Individuums"
          />
          <q-input label="Nachname*"
                   v-model="lastName"
                   hint="Nachname des Individuums"
                   class="q-mt-sm"
          />
          <q-input label="Handynummer*"
                   v-model="phone"
                   hint="Handynummer des Individuums"
                   mask="###-#######"
                   class="q-mt-sm"
          />
          <q-input label="Kontonummer*"
                   v-model="bankAccountNumber"
                   hint="Kontonummer des Individuums"
                   :error="!validateBankAccountNumber"
                   error-message="Bitte auf das Format der Kontonummer achten!"
                   class="q-mt-sm"
                   maxlength="10"
          />
          <q-input label="UMail*"
                   v-model="uMail"
                   hint="Die UMail des Individuums"
                   suffix="@umail.com"
                   :error="validateUMail"
                   error-message="Lass das @umail.com einfach weg 😉"
                   class="q-mt-sm"
          />
          <q-input label="Passwort*"
                   v-model="password"
                   hint="Passwort des Individuums"
                   class="q-mt-sm"
          />
        </div>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="createNewEmployee"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'
import { api } from 'boot/axios'
import { useDialogPluginComponent } from 'quasar'

export default defineComponent({
  name: 'CreateNewEmployeeDialog',
  components: { DialogActionComponent },
  emits: [
    ...useDialogPluginComponent.emits
  ],
  setup: function () {
    const firstName = ref('')
    const lastName = ref('')
    const phone = ref('')
    const bankAccountNumber = ref('LS')
    const uMail = ref('')
    const password = ref('')
    const { dialogRef, onDialogOK } = useDialogPluginComponent()
    return {
      createNewEmployee () {
        api.post('/api/users', {
          first_name: firstName.value,
          last_name: lastName.value,
          phone: phone.value,
          bank_account_number: bankAccountNumber.value,
          email: uMail.value,
          password: password.value
        })
          .catch((e) => {
            console.error(e)
          })
        onDialogOK()
      },
      firstName,
      lastName,
      phone,
      bankAccountNumber,
      uMail,
      password,
      validateUMail: computed(() => uMail.value.endsWith('@umail.com')),
      validateBankAccountNumber: computed(() => bankAccountNumber.value.startsWith('LS')),
      dialogRef
    }
  }
})
</script>

<style scoped>

</style>
