<template>
  <q-icon name="mdi-coffin"
          size="lg"
          color="grey-7">
    <q-tooltip v-if="showTooltip">
      Diese Person ist leider verstorben
    </q-tooltip>
  </q-icon>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'deadIcon',
  props: {
    showTooltip: {
      type: Boolean,
      default: true
    }
  }
})
</script>

<style scoped>

</style>
