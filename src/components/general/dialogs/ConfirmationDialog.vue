<template>
  <q-dialog ref="dialogRef"
            transition-show="jump-up"
            transition-hide="jump-down">
    <q-card>
      <q-card-section>
        <div class="text-body1">
          {{ message }}
        </div>
      </q-card-section>
      <q-card-section>
        <div class="text-body2">
          {{ message }}
        </div>
      </q-card-section>
      <q-card-actions>
        <q-btn :color="confirmColor" :label="confirmLabel" @click="onDialogOK()"/>
        <q-btn :color="cancelColor" :label="cancelLabel" @click="onDialogCancel()"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">

import { useDialogPluginComponent } from 'quasar'

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()
defineProps({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  confirmLabel: {
    type: String,
    default: 'Confirm'
  },
  cancelLabel: {
    type: String,
    default: 'Cancel'
  },
  confirmColor: {
    type: String,
    default: 'primary'
  },
  cancelColor: {
    type: String,
    default: 'secondary'
  }
})

defineEmits([
  ...useDialogPluginComponent.emits
])

</script>

<style scoped>

</style>
