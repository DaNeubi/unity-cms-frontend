<template>
  <q-dialog ref="dialogRef" transition-show="scale" transition-hide="scale" persistent>
    <q-card class="q-pa-lg">
      <q-card-section>
        <div class="text-h5">Neues Firmenpanel erstellen</div>
      </q-card-section>
      <q-card-section>
        <div class="column">
          <q-input v-model="name" outlined label="Name" counter maxlength="128"/>
          <q-input v-model="url" outlined label="URL/Website" class="q-mt-sm" counter
                   maxlength="1024" lazy-rules
                   :rules="[ val => ((val.startsWith('http://') || val.startsWith('https://'))) || 'Bitte eine gültige URL angeben']"/>
        </div>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="createNewCompanyPanel()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'
import { useDialogPluginComponent } from 'quasar'

export default defineComponent({
  name: 'CreateNewCompanyPanelDialog',
  components: { DialogActionComponent },
  emits: [
    ...useDialogPluginComponent.emits
  ],
  setup () {
    const name = ref<string>()
    const url = ref<string>()
    const { dialogRef, onDialogOK } = useDialogPluginComponent()
    function createNewCompanyPanel () {
      if (name.value === undefined || url.value === undefined || name.value?.length < 1 || url.value?.length < 8) return
      onDialogOK({
        name: name.value,
        url: url.value
      })
    }
    return {
      name,
      url,
      createNewCompanyPanel,
      dialogRef
    }
  }
})
</script>

<style scoped>

</style>
