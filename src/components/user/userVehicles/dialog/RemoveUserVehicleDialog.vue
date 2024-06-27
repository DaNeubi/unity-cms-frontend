<template>
  <q-dialog ref="dialogRef" transition-show="scale" transition-hide="scale">
    <q-card>
      <q-card-section>
        <div class="text-h5">
          Fahrzeug weggeben
        </div>
      </q-card-section>
      <q-card-section>
        <q-input type="textarea" counter maxlength="255" v-model="reason" label="Grund (optional)"/>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="removeUserVehicle()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">

import { ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'

const reason = ref<string|null>()

defineEmits([...useDialogPluginComponent.emits])

const { dialogRef, onDialogOK } = useDialogPluginComponent()

function removeUserVehicle () {
  if (reason.value?.length === 0) reason.value = null
  onDialogOK(reason.value)
}
</script>

<style scoped>

</style>
