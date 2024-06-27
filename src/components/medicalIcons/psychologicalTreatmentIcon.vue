<template>
  <q-icon name="mdi-sofa-single-outline"
          size="lg"
          color="orange-7">
    <q-tooltip v-if="showToolTip">
      Diese Person ist in Psychologischer Behandlung
    </q-tooltip>
  </q-icon>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'psychologicalTreatmentIcon',
  props: {
    showToolTip: {
      type: Boolean,
      default: true
    }
  }
})
</script>

<style scoped>

</style>
