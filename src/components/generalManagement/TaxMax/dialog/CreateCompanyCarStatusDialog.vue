<template>
  <q-dialog ref="dialogRef" transition-show="scale" transition-hide="scale" persistent>
    <q-card>
      <q-card-section>
        <div class="text-h5">Neuen Fahrzeugstatus erstellen</div>
      </q-card-section>
      <q-card-section>
        <div class="row items-center">
          <q-input v-model="statusName" class="col-12" outlined label="Name" counter maxlength="64"/>
          <q-checkbox v-model="defaultDrive" :true-value="1" :false-value="0" class="col-12"
                      label="Standardfahrstatus" color="primary"/>
          <q-checkbox v-model="defaultIdle" :true-value="1" :false-value="0" class="col-12"
                      label="Standardwartestatus" color="primary"/>
        </div>
      </q-card-section>
      <q-card-actions>
        <dialog-action-component @dialog-save-button="returnNewStatusInfo()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { ref } from 'vue'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'
import ICompanyCarStatus from 'src/misc/interfaces/CompanyCar/ICompanyCarStatus'

defineEmits([...useDialogPluginComponent.emits])
const { dialogRef, onDialogOK } = useDialogPluginComponent()
const statusName = ref<string>('')
const defaultDrive = ref<number>(0)
const defaultIdle = ref<number>(0)

function returnNewStatusInfo () {
  if (statusName.value === '') return
  onDialogOK({
    name: statusName.value,
    driving_default: defaultDrive.value,
    idle_default: defaultIdle.value
  } as ICompanyCarStatus)
}
</script>

<style scoped>

</style>
