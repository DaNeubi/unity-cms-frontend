<template>
  <q-select :options="options"
            filled
            clearable
            :label="name + ` Vorlagen`">
    <template v-slot:prepend>
      <q-icon :name="icon"/>
    </template>
  </q-select>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'medicalTextTemplateSelect',
  props: {
    options: {
      type: Array,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: false,
      default: 'mdi-file-document-outline'
    }
  }
})
</script>

<style scoped>

</style>
