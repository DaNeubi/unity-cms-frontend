<template>
  <q-btn :label="label"
         :icon="icon"
         color="primary">
    <q-tooltip v-if="toolTip">
      {{ toolTipText }}
    </q-tooltip>
  </q-btn>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MedGeneralButton',
  props: {
    label: {
      type: String,
      required: true
    },
    toolTip: {
      type: Boolean,
      required: false,
      default: false
    },
    toolTipText: {
      type: String,
      required: false,
      default: ''
    },
    icon: {
      type: String,
      required: false,
      default: undefined
    }
  }
})
</script>

<style scoped>

</style>
