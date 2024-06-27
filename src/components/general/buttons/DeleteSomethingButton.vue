<template>
  <q-btn :color="`${ buttonColor }`"
         :icon="icon"
         :label="`${ text }`"
         @click="$emit('create-something-new')"
         :disable="disable"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DeleteSomethingButton',
  props: {
    icon: {
      type: String,
      default: 'mdi-trash-can'
    },
    text: {
      type: String
    },
    disable: {
      type: Boolean,
      default: false
    },
    buttonColor: {
      type: String,
      default: 'negative'
    }
  },
  emits: [
    'create-something-new'
  ]
})
</script>

<style scoped>

</style>
