<template>
  <div class="row">
    <div class="col-12" v-if="loading">
      <div class="row items-center justify-center q-mt-xl">
        <q-spinner-hourglass color="accent" size="5em"/>
      </div>
    </div>
    <TransactionHistoryAllEmployees class="col-12" v-else-if="allHistory && !selfHistory"/>
    <TransactionHistorySelf class="col-12" v-else-if="selfHistory && !allHistory"/>
    <div class="row items-center justify-center"
         v-else>
      <div class="text-h5 text-grey-5">
        Das is jetz blöd gelaufen, aber du hast keine Rechte für die Transaktionshistorie
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeMount, ref, watch } from 'vue'
import TransactionHistoryAllEmployees from 'pages/transactionHistory/TransactionHistoryAllEmployees.vue'
import { api } from 'src/boot/axios'
import { companyStore } from 'stores/companyStore'
import TransactionHistorySelf from 'pages/transactionHistory/TransactionHistorySelf.vue'

export default defineComponent({
  name: 'TransactionHistoryMain',
  components: { TransactionHistorySelf, TransactionHistoryAllEmployees },
  setup () {
    const allHistory = ref<boolean>(false)
    const selfHistory = ref<boolean>(false)
    const loading = ref(false)
    const cStore = companyStore()
    const companyId = computed(() => cStore.companyId)
    watch(companyId, () => {
      getPermissions()
    })
    onBeforeMount(() => {
      getPermissions()
    })
    function getPermissions () {
      loading.value = true
      api.get('/api/transactionHistory/get/' + companyId.value)
        .then((res) => {
          // check what's available
          if (res.data.policies.length === 2) {
            // has both, gets all
            allHistory.value = true
            loading.value = false
          } else {
            // has only one get the right one
            if (res.data.policies[0].policy === 'TransactionHistory_All') {
              // all is available
              allHistory.value = true
              loading.value = false
            } else if (res.data.policies[0].policy === 'TransactionHistory_Self') {
              // self is available
              selfHistory.value = true
              loading.value = false
            }
          }
        })
        .catch((err) => {
          console.error(err)
        })
    }
    return {
      allHistory,
      selfHistory,
      loading
    }
  }
})
</script>

<style scoped>

</style>
