<template>
  <TransactionHistoryAllComponent/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TransactionHistoryAllComponent from 'components/transactionHistory/TransactionHistoryAllComponent.vue'

export default defineComponent({
  name: 'TransactionHistoryAllEmployees',
  components: { TransactionHistoryAllComponent },
  emits: [
    'pass-transactions-to-update'
  ]
})
</script>

<style scoped>

</style>
