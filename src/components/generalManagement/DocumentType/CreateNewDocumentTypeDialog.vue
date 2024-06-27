<template>
  <q-dialog transition-show="scale" transition-hide="scale" persistent ref="dialogRef">
    <q-card>
      <q-card-section>
        <div class="text-h5">Neuen Dokumenten Typ erstellen</div>
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12">
            <q-input label="Name*"
                     v-model="name"
                     hint="Name des Dokumenten Typs"
                     maxlength="64"
                     counter/>
          </div>
        </div>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="createNewDocumentType"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'
import { api } from 'src/boot/axios'

export default defineComponent({
  name: 'CreateNewDocumentTypeDialog',
  components: { DialogActionComponent },
  emits: [
    ...useDialogPluginComponent.emits
  ],
  props: {
    companyId: {
      type: Number,
      required: true
    }
  },
  setup (props) {
    const { dialogRef, onDialogOK } = useDialogPluginComponent()
    const name = ref<string>()
    function createNewDocumentType () {
      api.post('/api/documentTypes/create/' + props.companyId, {
        name: name.value
      }).catch((error) => {
        console.error(error)
      })
      onDialogOK()
    }
    return {
      name,
      createNewDocumentType,
      dialogRef
    }
  }
})
</script>

<style scoped>

</style>
