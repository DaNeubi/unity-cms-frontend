<template>
  <q-dialog ref="dialogRef" transition-show="scale" transition-hide="scale">
    <q-card style="min-width: 400px;">
      <q-card-section>
        <div class="text-h5">
          Neue Farbe hinzufügen
        </div>
        <q-input v-model="newVehicleColorName" outlined label="Farbname" dense counter maxlength="64"/>
        <q-color v-model="newVehicleColor" no-header-tabs no-footer format-model="hex" default-view="tune" flat bordered/>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="returnColor()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'
import { ref } from 'vue'
import IUserVehicleColor from 'src/misc/interfaces/UserVehicle/IUserVehicleColor'

defineEmits([...useDialogPluginComponent.emits])

const props = defineProps({
  vehicleColor: {
    type: Object as () => IUserVehicleColor,
    required: false,
    default: null
  }
})

const { dialogRef, onDialogOK } = useDialogPluginComponent()
const newVehicleColor = ref<string>(props.vehicleColor?.hexa_color ?? randomColor())
const newVehicleColorName = ref<string>(props.vehicleColor?.name ?? '')

function randomColor () {
  return '#' + Math.floor(Math.random() * 16777215).toString(16)
}
function returnColor () {
  if (newVehicleColorName.value.length === 0 || newVehicleColor.value.length === 0) {
    return
  }
  onDialogOK({
    id: Math.random(),
    name: newVehicleColorName.value,
    hexa_color: newVehicleColor.value
  } as IUserVehicleColor)
}
</script>

<style scoped>

</style>
