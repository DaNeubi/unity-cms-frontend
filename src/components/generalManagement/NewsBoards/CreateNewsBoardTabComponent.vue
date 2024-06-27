<template>
  <q-tab :name="`${ name + id }`" :label="`${ label }`" :icon="`${ icon }`"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CreateNewsBoardTabComponent',
  components: {},
  props: [
    'name',
    'icon',
    'label',
    'id'
  ]
})
</script>

<style scoped>

</style>
