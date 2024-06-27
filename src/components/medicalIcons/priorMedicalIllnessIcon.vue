<template>
  <q-icon name="mdi-alert-outline"
          size="lg"
          color="red-7">
    <q-tooltip>
      Folgende Vorerkrankungen sind bekannt:
    </q-tooltip>
  </q-icon>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'priorMedicalIllnessIcon'
})
</script>

<style scoped>

</style>
