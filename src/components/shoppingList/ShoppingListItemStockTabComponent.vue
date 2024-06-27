<template>
  <q-tab :name="`${ name }`"
         :label="`${ name }`"
         :icon="`${ defaultStock === 1 ? 'mdi-alpha-d-circle-outline' : 'mdi-warehouse' }`"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ShoppingListItemStockTabComponent',
  components: {},
  props: {
    name: {
      type: String,
      required: true
    },
    defaultStock: {
      type: Number,
      required: false,
      default: 0
    }
  },
  setup () {
    return {}
  }
})
</script>
