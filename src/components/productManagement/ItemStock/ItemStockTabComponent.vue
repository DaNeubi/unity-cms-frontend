<template>
  <q-tab :name="`${ name }`"
         :label="`${ label }`"
         icon="mdi-format-list-group"
         v-if="isDefault === 0" />
  <q-tab :name="`${ name }`"
         :label="`${ label }`"
         icon="mdi-format-list-group"
         v-else
         alert-icon="mdi-alpha-d-circle"
         alert="purple" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ItemStockTabComponent',
  props: {
    name: String,
    label: String,
    isDefault: Number
  },
  components: {},
  setup () {
    return {
    }
  }
})
</script>
