<template>
  <q-tab :name="`${ name }`" :label="`${ name }`" icon="mdi-view-dashboard-variant-outline"/>
</template>

<script lang="ts">

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ShoppingListOverviewTabComponent',
  props: {
    name: {
      type: String,
      required: true
    }
  },
  setup () {
    return {}
  }
})
</script>

<style scoped>

</style>
