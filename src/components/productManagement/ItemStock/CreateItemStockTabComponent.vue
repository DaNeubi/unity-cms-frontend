<template>
  <q-tab :name="`${ name + id }`" :label="`${ label }`" :icon="`${ icon }`"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CreateItemStockTabComponent',
  props: [
    'name',
    'icon',
    'label',
    'id'
  ],
  components: {},
  setup () {
    return {
    }
  }
})
</script>
