<template>
  <TransactionHistorySelfComponent/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TransactionHistorySelfComponent from 'components/transactionHistory/TransactionHistorySelfComponent.vue'

export default defineComponent({
  name: 'TransactionHistorySelf',
  components: { TransactionHistorySelfComponent }
})
</script>

<style scoped>

</style>
