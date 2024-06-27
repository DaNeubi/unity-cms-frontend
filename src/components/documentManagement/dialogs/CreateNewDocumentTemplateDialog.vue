<template>
  <q-dialog ref="dialogRef"
            transition-show="scale"
            transition-hide="scale"
            :persistent="false">
    <q-card class="full-width">
      <q-card-section>
        <div class="text-h4">
          Name der neuen Vorlage
        </div>
      </q-card-section>
      <q-card-section>
        <div class="column">
          <q-input label="Name"
                   v-model="name"
                   outlined
                   counter
                   maxlength="128"/>
        </div>
      </q-card-section>
      <q-card-actions>
        <dialog-action-component
          @dialog-save-button="goToDocumentCreation()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'

export default defineComponent({
  name: 'CreateNewDocumentTemplateDialog',
  components: { DialogActionComponent },
  emits: [
    ...useDialogPluginComponent.emits
  ],
  props: {
    companyId: {
      type: Number,
      required: true,
      default: 0
    }
  },
  setup (props) {
    const { dialogRef, onDialogOK } = useDialogPluginComponent()
    const name = ref<string>()
    function goToDocumentCreation () {
      if (props.companyId === 0) return
      onDialogOK(name.value)
    }
    return {
      dialogRef,
      name,
      goToDocumentCreation
    }
  }
})
</script>

<style scoped>

</style>
