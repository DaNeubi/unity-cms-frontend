<template>
  <q-btn :color="`${ color }`"
         :icon="`${ icon }`"
         :label="`${ text }`" @click="$emit('create-something-new')"
         :disable="disable"/>
</template>

<script setup lang="ts">

defineProps({
  icon: {
    type: String,
    default: 'mdi-plus-circle'
  },
  text: {
    type: String,
    required: true
  },
  disable: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: 'accent'
  }
})

defineEmits(['create-something-new'])

</script>
