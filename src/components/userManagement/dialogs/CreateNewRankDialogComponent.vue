<template>
  <q-dialog transition-show="scale" transition-hide="scale" persistent ref="dialogRef">
    <q-card class="q-pa-lg dialog-size">
      <q-card-section>
        <div class="column">
          <div class="text-h5 q-mb-md">Neuen Rang erstellen</div>
          <q-input v-model="rankName"
                   outlined
                   label="Name"
                   :rules="[val => val.length <= 128 || 'Name darf maximal 128 Zeichen lang sein']"
                   error-message="Wenn der Name mehr als 128 Zeichen braucht, solltest du ihn nochmal überdenken."
                   hint="Name des neuen Ranges"/>
          <q-input v-model.number="rankWeight"
                   type="number"
                   outlined
                   label="Gewichtung"
                   class="q-mt-md"
                   :rules="[val => val >= 0 && val < 100 || 'Gewichtung muss zwischen 0 und 99 liegen']"
                   error-message="Gewichtung muss zwischen 0 und 99 liegen"
                   hint="Maximal bis 99"/>
        </div>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="createNewRank"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import DialogActionComponent from '../../general/dialogs/DialogActionComponent'
import { ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'

defineEmits([...useDialogPluginComponent.emits])
const rankName = ref('')
const rankWeight = ref(0)
const { dialogRef, onDialogOK } = useDialogPluginComponent()
function createNewRank () {
  if (rankName.value.length > 128 || rankName.value.length === 0) {
    return
  }
  onDialogOK({
    name: rankName.value,
    weight: rankWeight.value
  })
}
</script>

<style scoped>

</style>
