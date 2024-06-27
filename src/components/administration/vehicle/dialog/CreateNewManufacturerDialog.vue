<template>
  <q-dialog ref="dialogRef" transition-show="scale" transition-hide="scale">
    <q-card>
      <q-card-section>
        <div class="text-h5">Neuen Hersteller erstellen</div>
      </q-card-section>
      <q-card-section>
        <div class="column">
          <q-input label="Name" hint="Name des Herstellers" maxlength="100" counter v-model="manufacturerName" outlined
                   :rules="[val => !!val || 'Ohne Name wird das nix!', val => val.length < 100 || 'Mehr als 100 Zeichen is nich']"/>
        </div>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="returnValues"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">

import { useDialogPluginComponent } from 'quasar'
import { ref } from 'vue'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'
import IVehicleManufacturer from 'src/misc/interfaces/Vehicle/IVehicleManufacturer'

defineEmits([...useDialogPluginComponent.emits])

const { dialogRef, onDialogOK } = useDialogPluginComponent()
const manufacturerName = ref<string>()

function returnValues () {
  if (!manufacturerName.value || manufacturerName.value.length === 0) {
    return
  }
  onDialogOK({ name: manufacturerName.value } as IVehicleManufacturer)
}
</script>

<style scoped>

</style>
