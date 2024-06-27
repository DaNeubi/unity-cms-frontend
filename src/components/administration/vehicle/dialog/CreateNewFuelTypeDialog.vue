<template>
  <q-dialog ref="dialogRef" transition-show="scale" transition-hide="scale">
    <q-card>
      <q-card-section>
        <div class="text-h5">Neuen Kraftstoff erstellen</div>
      </q-card-section>
      <q-card-section>
        <div class="column">
          <q-input label="Name" hint="Name des Kraftstoffes" maxlength="100" counter v-model="fuelTypeName" outlined
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

import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'
import { useDialogPluginComponent } from 'quasar'
import { ref } from 'vue'
import IVehicleFuelType from 'src/misc/interfaces/Vehicle/IVehicleFuelType'

defineEmits([...useDialogPluginComponent.emits])

const { dialogRef, onDialogOK } = useDialogPluginComponent()
const fuelTypeName = ref<string>()

function returnValues () {
  if (!fuelTypeName.value || fuelTypeName.value.length === 0) {
    return
  }
  onDialogOK({ name: fuelTypeName.value } as IVehicleFuelType)
}
</script>

<style scoped>

</style>
