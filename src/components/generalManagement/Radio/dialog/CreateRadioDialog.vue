<template>
  <q-dialog ref="dialogRef" transition-show="scale" transition-hide="scale" persistent>
    <q-card>
      <q-card-section>
        <div class="text-h5">Neue Funkfrequenz erstellen</div>
      </q-card-section>
      <q-card-section>
        <div class="row items-center">
          <q-input v-model="freqName" class="col-12" outlined label="Name" counter maxlength="64"/>
          <q-input v-model.number="freqFrequency" class="col-12" outlined label="Frequenz" :min="0" :max="65535"/>
        </div>
      </q-card-section>
      <q-card-actions>
        <dialog-action-component @dialog-save-button="returnNewRadioInfo()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { ref } from 'vue'
import ICompanyRadio from 'src/misc/interfaces/Radio/ICompanyRadio'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'

defineEmits([...useDialogPluginComponent.emits])
const { dialogRef, onDialogOK } = useDialogPluginComponent()
const freqName = ref<string>('')
const freqFrequency = ref<number>(0)

function returnNewRadioInfo () {
  if (freqName.value === '') return
  onDialogOK({
    name: freqName.value,
    frequency: freqFrequency.value
  } as ICompanyRadio)
}
</script>

<style scoped>

</style>
