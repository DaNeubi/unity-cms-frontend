<template>
  <q-tab :name="`${ name }`" :label="`${ label }`" icon="mdi-shuffle"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ShoppingListMoveItemsTabComponent',
  components: {},
  props: {
    name: String,
    label: String
  }
})
</script>

<style scoped>

</style>
