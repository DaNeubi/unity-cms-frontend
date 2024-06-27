<template>
  <q-dialog transition-show="scale" transition-hide="scale" persistent ref="dialogRef">
    <q-card class="q-pa-lg dialog-size">
      <q-card-section>
        <div class="column">
          <div class="text-h5 q-mb-md">Neues Geschlecht hinzufügen</div>
          <q-input v-model="genderName"
                   outlined
                   label="Name des neuen Geschlechts"
                   :error="checkNameLength"
                   error-message="Maximal 128 Zeichen"/>
        </div>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="createNewGender"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { computed, ref } from 'vue'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent'
import { useDialogPluginComponent } from 'quasar'

export default {
  name: 'CreateNewGenderDialogComponent',
  components: { DialogActionComponent },
  emits: [
    ...useDialogPluginComponent.emits
  ],
  setup () {
    const genderName = ref('')
    const { dialogRef, onDialogOK } = useDialogPluginComponent()
    return {
      genderName,
      checkNameLength: computed(() => (genderName.value.length > 128)),
      createNewGender () {
        onDialogOK({
          name: genderName.value
        })
      },
      dialogRef
    }
  }
}
</script>
