<template>
  <q-dialog ref="dialogRef"
            :persistent="true"
            transition-show="jump-up"
            transition-hide="jump-down">
    <q-card>
      <q-card-section>
        <div class="row items-center q-gutter-sm">
          <span class="text-h5 col-12">
            Ups.. Das mit den Santos Card Punkten hat leider nicht geklappt.
            <q-tooltip>
              🤫 Ich glaub ja der war zu Dumm das weiter zu geben 🤫
            </q-tooltip>
          </span>
          <div class="text-subtitle2">
            Jetzt hast du die Möglichkeit die Santos Card Nummer nochmal einzugeben.
          </div>
          <q-input outlined label="Santos Card Nummer" class="col-12"
                   v-model="santosCardNumber" mask="######" maxlength="6" counter>
            <template v-slot:prepend>
              <q-icon name="mdi-credit-card-chip-outline"/>
            </template>
          </q-input>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row q-gutter-sm">
          <create-something-new-button text="Erneut versuchen" icon="mdi-refresh-circle"
                                       @create-something-new="retrySantosCardPoints"/>
          <delete-something-button text="Abbrechen" icon="mdi-close-circle-outline"
                                   v-close-popup/>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">

import { ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import CreateSomethingNewButton from 'components/general/buttons/CreateSomethingNewButton.vue'
import DeleteSomethingButton from 'components/general/buttons/DeleteSomethingButton.vue'
import { api } from 'boot/axios'

const santosCardNumber = ref<string>()
const { dialogRef } = useDialogPluginComponent()

defineEmits([
  ...useDialogPluginComponent.emits
])

const props = defineProps({
  token: {
    type: String,
    default: null,
    required: true
  },
  companyId: {
    type: Number,
    default: null,
    required: true
  }
})

function retrySantosCardPoints () {
  api.post('/api/santosCard/retry/' + props.companyId, {
    token: props.token,
    santos_card_number: santosCardNumber.value
  }).then(() => {
    dialogRef.value?.hide()
  })
}

</script>

<style scoped>

</style>
