<template>
  <q-tab :name="`${ name }`"
         :label="`${ label }`"
         icon="mdi-calendar-today"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CompanyStatisticsTabComponent',
  props: {
    name: String,
    label: String
  },
  components: {}
})
</script>
