<template>
  <q-dialog ref="dialogRef" transition-show="scale" transition-hide="scale">
    <q-card>
      <q-card-section>
        <div class="text-h5">
          Trinkgeld Buchen
        </div>
      </q-card-section>
      <q-card-section>
        <q-input v-model.number="tip" outlined label="Trinkgeld in $" type="number" :min="1"/>
      </q-card-section>
      <q-card-actions>
        <dialog-action-component @dialog-save-button="setTip()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { ref } from 'vue'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'

defineEmits([...useDialogPluginComponent.emits])

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()
const tip = ref<number>(0)

function setTip () {
  // check if tip is valid
  if (tip.value >= 1) {
    // return the tip
    onDialogOK(tip.value)
  }
  // cancel the dialog
  onDialogCancel()
}
</script>

<style scoped>

</style>
