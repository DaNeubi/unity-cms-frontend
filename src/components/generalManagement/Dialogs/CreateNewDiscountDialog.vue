<template>
  <q-dialog transition-show="scale" transition-hide="scale" persistent ref="dialogRef">
    <q-card class="q-pa-lg">
      <q-card-section>
        <div class="text-h5">Neuen Rabatt erstellen</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <div class="column">
          <q-input label="Name*"
                   v-model="name"
                   hint="Name des Rabatts"
                   maxlength="200"
                   counter/>
          <q-input label="Notiz"
                   v-model="note"
                   hint="Notiz für den Rabatt"
                   maxlength="512"
                   counter
                   class="q-mt-sm"/>
          <q-input label="Rabatt Prozente"
                   v-model.number="amount"
                   hint="Angabe in Prozent, zwischen 0 und 100."
                   type="number"
                   :error="!validatePercentageAmount"
                   error-message="Bitte achte auf die Vorgegebene Spanne!"
                   class="q-mt-sm"/>
          <q-toggle label="Aktiv nach dem erstellen"
                    v-model="active"
                    color="positive"
                    checked-icon="mdi-check"
                    class="q-mt-sm"/>
        </div>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="createNewDiscount"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'
import { useDialogPluginComponent } from 'quasar'

export default defineComponent({
  name: 'CreateNewDiscountDialog',
  components: { DialogActionComponent },
  emits: [
    ...useDialogPluginComponent.emits
  ],
  setup () {
    const name = ref('')
    const note = ref('')
    const amount = ref(0)
    const active = ref(true)
    const { dialogRef, onDialogOK } = useDialogPluginComponent()
    function createNewDiscount () {
      onDialogOK({
        name: name.value,
        description: note.value,
        amount: amount.value,
        active: active.value
      })
    }
    return {
      name,
      note,
      amount,
      active,
      validatePercentageAmount: computed(() => amount.value >= 0 && amount.value <= 100),
      dialogRef,
      createNewDiscount
    }
  }
})
</script>
