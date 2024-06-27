<template>
  <q-btn label="Speichern"
         icon="mdi-file-document-plus"
         color="primary"
         :disable="disable"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MedSaveButton',
  props: {
    disable: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'save-medical-file'
  ]
})
</script>

<style scoped>

</style>
