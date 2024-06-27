<template>
  <q-dialog ref="dialogRef" transition-show="scale" transition-hide="scale">
    <q-card>
      <q-card-section>
        <div class="text-h5">Neue Fahrzeugkaregorie erstellen</div>
      </q-card-section>
      <q-card-section>
        <div class="column">
          <q-input label="Name" hint="Name der Kategorie" maxlength="100" counter v-model="categoryName" outlined
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
import IVehicleCategory from 'src/misc/interfaces/Vehicle/IVehicleCategory'

defineEmits([...useDialogPluginComponent.emits])

const { dialogRef, onDialogOK } = useDialogPluginComponent()
const categoryName = ref<string>()

function returnValues () {
  if (!categoryName.value || categoryName.value.length === 0) {
    return
  }
  onDialogOK({ name: categoryName.value } as IVehicleCategory)
}
</script>

<style scoped>

</style>
