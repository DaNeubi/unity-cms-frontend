<template>
  <div class="column">
    <SelfUserStatisticsComponent />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SelfUserStatisticsComponent from 'components/balanceView/SelfUserStatisticsComponent.vue'

export default defineComponent({
  name: 'BalanceSelf',
  components: { SelfUserStatisticsComponent }
})
</script>

<style scoped>

</style>
