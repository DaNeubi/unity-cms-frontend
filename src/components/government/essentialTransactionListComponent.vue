<template>
  <q-card>
    <q-card-section>
      <div class="row q-mb-md">
        <edit-something-button class="col-auto" text="Zurück zur Auswahl" icon="mdi-arrow-left-bold"
                               button-color="secondary" @create-something-new="$emit('goBack')"/>
      </div>
    </q-card-section>
    <q-card-section>
      <div class="text-h3">
        Transaktionen für {{ companyName }}
      </div>
    </q-card-section>
    <q-card-section>
      <q-table class="cms-sticky-header-table default-table-height" :rows="transactions" :columns="columns" row-key="id"
               :rows-per-page-options="[0]" virtual-scroll :pagination="{ rowsPerPage: 0 }"
               :virtual-scroll-item-size="30" :virtual-scroll-sticky-size-start="30"
               @virtual-scroll="getTransactions">
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td v-for="headerVal in columns" :key="headerVal.name" :props="props">
              <div v-if="headerVal.name === 'total' || headerVal.name === 'tip' ||
              headerVal.name === 'discount_amount'">
                ${{ props.row[headerVal.name] }}
              </div>
              <div v-else-if="headerVal.name === 'tax_percentage'">
                {{ props.row[headerVal.name] }}%
              </div>
              <div v-else-if="headerVal.name === 'user'">
                {{ props.row[headerVal.name]?.first_name }} {{ props.row[headerVal.name]?.last_name }}
              </div>
              <div v-else-if="headerVal.name === 'created_at'">
                {{ FormatDateTime(props.row[headerVal.name]) }}
              </div>
              <div v-else-if="headerVal.name === 'type'">
                {{ FormatTransactionTypeToGerman(props.row[headerVal.name]) }}
              </div>
              <div v-else-if="headerVal.name === 'items'">
                <div v-if="props.row.transaction_items !== null && props.row.transaction_items !== undefined &&
                  props.row.transaction_items.length > 0">
                  <div v-for="transactionItem in props.row.transaction_items" :key="transactionItem.id">
                    <span v-if="props.row.type === TransactionType.Sale">
                      {{ transactionItem.amount }}x {{ transactionItem.item.name }} á ${{ transactionItem.price }}
                    </span>
                    <span v-else>
                      {{ transactionItem.amount }}x {{ transactionItem.item.name }} á ${{ transactionItem.purchase_price }}
                    </span>
                  </div>
                </div>
                <div v-else-if="props.row.transaction_non_items !== null && props.row.transaction_non_items !== undefined">
                  {{ props.row.transaction_non_items.name }}
                </div>
              </div>
              <div v-else>
                {{ props.row[headerVal.name] }}
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import EditSomethingButton from 'components/general/buttons/EditSomethingButton.vue'
import { computed, ref } from 'vue'
import { ITransaction } from 'src/misc/interfaces/Transaction/ITransaction'
import TransactionType from 'src/misc/Enums/Transaction/TransactionType'
import { api } from 'boot/axios'
import FormatDateTime from '../../misc/functions/FormatDateTime'
import FormatTransactionTypeToGerman from '../../misc/functions/general/FormatTransactionTypeToGerman'

const transactions = ref<ITransaction[]>([] as ITransaction[])
const columns = [
  { name: 'total', label: 'Gesamt', field: 'total' },
  { name: 'tip', label: 'Trinkgeld', field: 'tip' },
  { name: 'discount_amount', label: 'Rabatt', field: 'discount_amount' },
  { name: 'tax_percentage', label: 'Steuersatz', field: 'tax_percentage' },
  { name: 'items', label: 'Artikel', field: 'items', style: 'min-width: 20vw' },
  { name: 'created_at', label: 'Datum', field: 'created_at' },
  { name: 'user', label: 'Mitarbeiter/in', field: 'user' },
  { name: 'note', label: 'Notiz', field: 'note' },
  { name: 'type', label: 'Typ', field: 'type' }
]

const props = defineProps({
  companyId: {
    type: Number,
    required: true
  },
  companyName: {
    type: String,
    required: true,
    default: 'Nicht angegeben'
  }
})
defineEmits(['goBack'])
const nextPage = ref(-1)
const loading = ref(false)
const lastPage = computed(() => Math.ceil(transactions.value?.length / 30))

function getTransactions (obj: { to: number, form: number, index: number }) {
  if (props.companyId <= 0) return
  const lastIndex = transactions.value?.length - 1
  if (!loading.value && nextPage.value < lastPage.value && obj.to === lastIndex) {
    loading.value = true
    api.get('/api/government/companyTransactions?company_id=' + props.companyId + '&offset=' + transactions.value.length ?? 0)
      .then((res) => {
        transactions.value?.push(...res.data)
        loading.value = false
        nextPage.value++
      })
      .catch((error) => {
        console.error(error)
      })
  }
}
</script>

<style scoped>

</style>
