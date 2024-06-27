<template>
  <q-btn :label="label"
         :icon="icon"
         :color=" typeof fillableField === 'number' ? fillableField === 0 ? 'amber-9' : 'blue-grey-9' : fillableField ? 'amber-9' : 'blue-grey-9'"
         @click="$emit('execute')">
    <q-tooltip v-if="toolTip">
      {{ toolTipText }}
    </q-tooltip>
  </q-btn>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DocumentFieldButton',
  emits: [
    'execute'
  ],
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
    },
    fillableField: {
      type: [Boolean, Number],
      required: false,
      default: false
    }
  }
})
</script>

<style scoped>

</style>
