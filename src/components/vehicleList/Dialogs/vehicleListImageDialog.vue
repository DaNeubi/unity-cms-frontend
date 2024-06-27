<template>
  <q-dialog ref="dialogRef" transition-show="scale" transition-hide="scale" backdrop-filter="blur(4px)">
    <q-card style="min-width: 60vw; height: 65vh;">
      <q-toolbar>
        <q-toolbar-title>{{ vehicleName }} - {{ manufacturerName }}</q-toolbar-title>
        <q-btn flat icon="mdi-engine-off-outline" v-close-popup aria-label="Schließen"/>
      </q-toolbar>
      <q-img :src="imageUrl" :fit="'scale-down'" ratio="5/4" loading="lazy" alt="Car Image"
             style="min-height: 90%;" class="q-mt-md"/>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'

defineEmits([...useDialogPluginComponent.emits])

const { dialogRef } = useDialogPluginComponent()

defineProps({
  imageUrl: {
    type: String,
    required: true
  },
  vehicleName: {
    type: String,
    required: true
  },
  manufacturerName: {
    type: String,
    required: true
  }
})
</script>

<style scoped>

</style>
