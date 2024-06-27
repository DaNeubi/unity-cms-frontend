<template>
  <div class="row q-gutter-lg">
    <q-btn label="Speichern" color="positive" icon="mdi-check" @click="$emit('dialog-save-button')"/>
    <q-btn label="Abbrechen" color="negative" icon="mdi-close" v-close-popup @click="$emit('dialog-cancel-button')"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DialogActionComponent',
  emits: [
    'dialog-save-button',
    'dialog-cancel-button'
  ],
  components: {}
})
</script>

<style scoped>

</style>
