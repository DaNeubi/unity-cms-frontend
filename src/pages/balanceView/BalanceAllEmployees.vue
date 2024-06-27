<template>
  <div class="column">
    <AllEmployeesStatisticsComponent/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AllEmployeesStatisticsComponent from 'components/balanceView/AllEmployeesStatisticsComponent.vue'

export default defineComponent({
  name: 'BalanceAllEmployees',
  components: { AllEmployeesStatisticsComponent }
})
</script>

<style scoped>

</style>
