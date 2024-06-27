<template>
  <q-dialog transition-show="scale" transition-hide="scale" persistent ref="dialogRef">
    <q-card>
      <q-card-section>
        <div class="text-h5">Neue Dokument Klassifizierung erstellen</div>
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
          <div class="col-12">
            <q-checkbox v-model="noColor"
                        :label="`Dokumenten Klassifizierung ohne Farbe: ${ noColor ? 'Ja' : 'Nein' }`"
                        :color="`${ noColor ? 'green' : 'red' }`"
                        keep-color/>
          </div>
          <div class="col-12">
            <q-color v-if="!noColor"
                     v-model="color"
                     class="q-mt-md color-picker"
                     :model-value="color"
                     no-header-tabs
                     default-view="spectrum"
                     format-model="hex"
                     label="Farbe"/>
          </div>
        </div>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="createNewClassification()"/>
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
  name: 'CreateNewDocumentClassificationTypeDialog',
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
    const color = ref<string>()
    const noColor = ref<boolean>(false)
    function createNewClassification () {
      api.post('/api/documentClassifications/create/' + props.companyId, {
        name: name.value,
        color: noColor.value ? '' : color.value
      }).catch((error) => {
        console.error(error)
      })
      onDialogOK()
    }
    return {
      createNewClassification,
      name,
      color,
      noColor,
      dialogRef
    }
  }
})
</script>

<style scoped>
.color-picker {
  width: 100%;
  height: 100%;
}
</style>
