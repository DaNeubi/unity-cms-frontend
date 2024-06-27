<template>
  <q-dialog transition-show="scale" transition-hide="scale" persistent ref="dialogRef">
    <q-card class="q-pa-lg dialog-size">
      <q-card-section>
        <div class="column">
          <div class="text-h5 q-mb-md">Neuen Artikeltyp hinzufügen</div>
          <q-input v-model="articleTypeName"
                   outlined
                   label="Name"
                   :error="checkNameLength"
                   error-message="Maximal 128 Zeichen"
                   maxlength="128"
                   counter/>
          <q-input v-model="articleTypeDescription"
                   outlined
                   label="Beschreibung"
                   :error="checkDescriptionLength"
                   error-message="Maximal 255 Zeichen"
                   maxlength="255"
                   counter/>
          <q-checkbox v-model="noColor"
                      :label="`Artikeltyp ohne Farbe: ${ noColor ? 'Ja' : 'Nein' }`"
                      :color="`${ noColor ? 'green' : 'red' }`"
                      keep-color/>
          <q-color v-if="!noColor"
                   v-model="articleTypeColor"
                   class="q-mt-md color-picker"
                   :model-value="articleTypeColor"
                   no-header-tabs
                   default-view="spectrum"
                   format-model="hex"
                   label="Farbe"/>
        </div>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="createNewArticleType"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'
import { computed, defineComponent, ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import IItemType from 'src/misc/interfaces/Item/IItemType'

export default defineComponent({
  name: 'CreateNewItemTypeDialogComponent',
  components: { DialogActionComponent },
  emits: [
    ...useDialogPluginComponent.emits
  ],
  setup () {
    const articleTypeName = ref('')
    const articleTypeDescription = ref('')
    const articleTypeColor = ref('#d04be2')
    const noColor = ref(false)
    const { dialogRef, onDialogOK } = useDialogPluginComponent()
    return {
      createNewArticleType () {
        if (articleTypeName.value.length === 0) {
          return
        }
        onDialogOK({
          name: articleTypeName.value,
          description: articleTypeDescription.value,
          color: noColor.value ? null : articleTypeColor.value
        } as IItemType)
      },
      articleTypeName,
      articleTypeDescription,
      articleTypeColor,
      noColor,
      checkNameLength: computed(() => (articleTypeName.value.length > 128)),
      checkDescriptionLength: computed(() => (articleTypeDescription.value.length > 255)),
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
