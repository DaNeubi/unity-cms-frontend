<template>
  <q-dialog ref="dialogRef"
            transition-show="scale"
            transition-hide="scale"
            :persistent="false">
    <q-card>
      <q-card-section v-if="accept">
        <div class="column q-gutter-sm">
          <div class="text-h4">
            Wie lange soll der Zugriff gültig sein?
          </div>
          <edit-something-button text="1 Stunde" icon="mdi-clock-outline"
                                 @create-something-new="returnDuration(1)"/>
          <edit-something-button text="3 Stunden" icon="mdi-clock-outline"
                                 @create-something-new="returnDuration(3)"/>
          <edit-something-button text="5 Stunden" icon="mdi-clock-outline"
                                 @create-something-new="returnDuration(5)"/>
          <edit-something-button text="12 Stunden" icon="mdi-clock-outline"
                                 @create-something-new="returnDuration(12)"/>
          <edit-something-button text="24 Stunden" icon="mdi-clock-outline"
                                 @create-something-new="returnDuration(24)"/>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'

defineProps({
  accept: {
    type: Boolean,
    required: true,
    default: false
  }
})
defineEmits([
  ...useDialogPluginComponent.emits
])
const { dialogRef, onDialogOK } = useDialogPluginComponent()

function returnDuration (durationInHours: number) {
  onDialogOK(durationInHours)
}
</script>

<style scoped>

</style>
