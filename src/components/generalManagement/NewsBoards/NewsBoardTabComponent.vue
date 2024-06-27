<template>
  <q-tab :name="`${ name }`" :label="`${ label }`" :icon="`${ icon }`"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NewsBoardTabComponent',
  components: {},
  props: [
    'name',
    'icon',
    'label'
  ]
})
</script>

<style scoped>

</style>
