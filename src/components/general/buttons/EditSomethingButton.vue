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
  name: 'EditSomethingButton',
  props: {
    icon: {
      type: String,
      default: 'mdi-pencil'
    },
    text: {
      type: String,
      default: ''
    },
    disable: {
      type: Boolean,
      default: false
    },
    buttonColor: {
      type: String,
      default: 'primary'
    }
  },
  emits: [
    'create-something-new'
  ]
})
</script>

<style scoped>

</style>
