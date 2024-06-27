<template>
  <q-table class="default-table-height cms-sticky-header-table"
           virtual-scroll
           title="Hier werden deine letzten Einnahmen und Ausgaben angezeigt"
           no-data-label="Keine Daten vorhanden"
           loading-label="Daten werden abgerufen..."
           :columns="columns"
           row-key="id"
           :rows="transactions"
           v-model:pagination="pagination"
           :rows-per-page-options="[0]"
           :virtual-scroll-item-size="30"
           :virtual-scroll-sticky-size-start="30"
           @virtual-scroll="loadMoreTransactions"
           :loading="loading">
    <template v-slot:loading>
      <q-inner-loading showing color="primary"/>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props" v-if="columns?.length > 0">
        <q-td v-for="headerVal in columns"
              :key="headerVal.name"
              :props="props">
          <div v-if="headerVal.name === 'total'">
            ${{ props.row[headerVal.name] }}
          </div>
          <div v-else-if="headerVal.name === 'number'">
            {{ props.row[headerVal.name] }}
          </div>
          <div v-else-if="headerVal.name === 'tip'">
            ${{ props.row[headerVal.name] }}
          </div>
          <div v-else-if="headerVal.name === 'discount_amount'">
            ${{ props.row[headerVal.name] }}
          </div>
          <div v-else-if="headerVal.name === 'items'">
            <div v-for="transactionItem in props.row.transaction_items" :key="transactionItem.id">
              {{ transactionItem.amount }}x {{ transactionItem.item.name }} á ${{ parseFloat(transactionItem.price) }}
            </div>
          </div>
          <div v-else-if="headerVal.name === 'tax_percentage'">
            {{ props.row[headerVal.name] }}%
          </div>
          <div v-else-if="headerVal.name === 'created_at'">
            <div v-if="props.row['created_at'] !== props.row['updated_at']">
              <div class="col">
                <div>
                  <i>erstellt am: {{ FormatDateTime(props.row['created_at']) }}</i>
                </div>
                <div>
                  <i>zuletzt bearbeitet: {{ FormatDateTime(props.row['updated_at']) }}</i>
                </div>
              </div>
            </div>
            <div v-else>
              {{ FormatDateTime(props.row['created_at']) }}
            </div>
          </div>
          <div v-else-if="headerVal.name === 'note'">
            {{ props.row[headerVal.name] }}
          </div>
          <div v-else-if="headerVal.name === 'type'">
            {{ FormatTransactionTypeToGerman(props.row[headerVal.name]) }}
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script lang="ts">
import { api } from 'src/boot/axios'
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import { companyStore } from 'stores/companyStore'
import { ITransaction } from 'src/misc/interfaces/Transaction/ITransaction'
import FormatDateTime from '../../misc/functions/FormatDateTime'
import FormatTransactionTypeToGerman from '../../misc/functions/general/FormatTransactionTypeToGerman'
import laravelEcho from 'boot/laravelecho'
import IEncapsulatedIntermediateTransactionHistoryUpdate
  from 'src/misc/interfaces/Transaction/IEncapsulatedIntermediateTransactionHistoryUpdate'

export default defineComponent({
  name: 'TransactionHistorySelfComponent',
  methods: { FormatTransactionTypeToGerman, FormatDateTime },
  components: {},
  setup () {
    const loading = ref(true)
    const cStore = companyStore()
    const companyId = computed(() => cStore.companyId)
    const transactions = ref<ITransaction[]>([])
    const columns = [
      { name: 'total', label: 'Gesamt', field: 'total' },
      { name: 'number', label: 'Re. Nummer', field: 'number' },
      { name: 'tip', label: 'Trinkgeld', field: 'tip' },
      { name: 'discount_amount', label: 'Rabatt', field: 'discount_amount' },
      { name: 'tax_percentage', label: 'Steuersatz', field: 'tax_percentage' },
      { name: 'items', label: 'Artikel', field: 'items' },
      { name: 'created_at', label: 'Datum', field: 'created_at' },
      { name: 'note', label: 'Notiz', field: 'note' },
      { name: 'type', label: 'Typ', field: 'type' }
    ]
    watch(() => companyId.value, () => {
      loadMoreTransactions()
      joinChangedChannel()
    })
    onMounted(() => {
      joinChangedChannel()
    })
    onUnmounted(() => {
      laravelEcho.leave('transactionHistory.changed.' + companyId.value)
    })
    function joinChangedChannel () {
      if (companyId.value <= 0) { return }
      // listen to the transaction history updated event
      laravelEcho.join('transactionHistory.changed.' + companyId.value)
        .listen('.company.transactionHistory.changed', (cb : IEncapsulatedIntermediateTransactionHistoryUpdate) => {
          // check for the company again
          if (cb.intermediateTransactionHistoryUpdated?.company_id !== companyId.value) {
            return
          }
          // remove the given transactions from the list
          if (transactions.value === undefined) {
            return
          }
          for (let i = 0; i < cb.intermediateTransactionHistoryUpdated.transactionHistoryItemIds.length; i++) {
            const index = transactions.value.findIndex((t: ITransaction) => t.id === cb.intermediateTransactionHistoryUpdated?.transactionHistoryItemIds[i])
            if (index !== -1) {
              transactions.value.splice(index, 1)
            }
          }
        })
    }
    function loadMoreTransactions () {
      if (companyId.value <= 0) { return }
      api.get('/api/transactionHistory/self/reduced/' + companyId.value, {
        params: {
          offset: transactions.value?.length ?? 0
        }
      })
        .then((response) => {
          if (transactions.value !== undefined && transactions.value?.length > 0) {
            transactions.value = transactions.value?.concat(response.data)
            loading.value = false
          } else {
            transactions.value = response.data
            loading.value = false
          }
        })
        .catch((error) => {
          console.error(error)
        })
    }
    return {
      columns,
      loading,
      transactions,
      pagination: ref({
        rowsPerPage: 30
      }),
      loadMoreTransactions
    }
  }
})
</script>

<style scoped>

</style>
