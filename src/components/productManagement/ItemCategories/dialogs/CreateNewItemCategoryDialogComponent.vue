<template>
  <q-dialog transition-show="scale" transition-hide="scale" persistent ref="dialogRef">
    <q-card class="q-pa-lg dialog-size">
      <q-card-section>
        <div class="column">
          <div class="text-h5 q-mb-md">Neue Artikelkategorie hinzufügen</div>
          <q-input v-model="articleCategoryName"
                   outlined
                   label="Name"
                   :error="checkNameLength"
                   error-message="Maximal 128 Zeichen"/>
          <q-input v-model="articleCategoryDescription"
                   outlined label="Beschreibung"
                   :error="checkDescriptionLength"
                   error-message="Maximal 255 Zeichen"/>
          <q-checkbox v-model="noColor"
                      :label="`Artikelkategorie ohne Farbe: ${ noColor ? 'Ja' : 'Nein' }`"
                      :color="`${ noColor ? 'green' : 'red' }`"
                      keep-color/>
          <q-color v-if="!noColor"
                   v-model="articleCategoryColor"
                   class="q-mt-md color-picker"
                   no-header-tabs
                   default-view="spectrum"
                   format-model="hex"
                   label="Farbe"/>
        </div>
      </q-card-section>
      <q-card-actions>
        <DialogActionComponent @dialog-save-button="createNewArticleCategory"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { computed, ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import DialogActionComponent from 'components/general/dialogs/DialogActionComponent.vue'
import IItemCategory from 'src/misc/interfaces/Item/IItemCategory'
export default {
  name: 'CreateNewItemCategoryDialogComponent',
  components: { DialogActionComponent },
  emits: [
    ...useDialogPluginComponent.emits
  ],
  setup () {
    const articleCategoryName = ref<string>('')
    const articleCategoryDescription = ref<string>('')
    const articleCategoryColor = ref<string>('')
    const noColor = ref<boolean>(false)
    const { dialogRef, onDialogOK } = useDialogPluginComponent()
    return {
      createNewArticleCategory () {
        if (articleCategoryName.value.length === 0) {
          return
        }
        onDialogOK({
          name: articleCategoryName.value,
          description: articleCategoryDescription.value,
          color: noColor.value ? null : articleCategoryColor.value
        } as IItemCategory)
      },
      articleCategoryName,
      articleCategoryDescription,
      articleCategoryColor,
      noColor,
      checkNameLength: computed(() => (articleCategoryName.value.length > 128)),
      checkDescriptionLength: computed(() => (articleCategoryDescription.value.length > 255)),
      dialogRef
    }
  }
}
</script>

<style scoped>
.color-picker {
  width: 100%;
  height: 100%;
}
</style>
