<template>
  <calendar-component/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CalendarComponent from 'components/calendar/calendarComponent.vue'

export default defineComponent({
  name: 'calendarPage',
  components: { CalendarComponent },
  setup () {
    return {
    }
  }
})
</script>

<style scoped>

</style>
