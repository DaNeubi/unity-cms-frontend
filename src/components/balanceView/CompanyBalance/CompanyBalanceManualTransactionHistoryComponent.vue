<template>
  <q-card>
    <q-card-section>
      <q-table class="default-table-height full-width cms-sticky-header-table"
               title="Ein- und Auszahlungen"
               no-data-label="Keine Daten vorhanden"
               loading-label="Daten werden abgerufen..."
               :loading="loading"
               :rows="companyBalanceHistory"
               virtual-scroll
               :virtual-scroll-item-size="30"
               :virtual-scroll-sticky-size-start="30"
               :pagination="{ rowsPerPage: 30 }"
               :rows-per-page-options="[0]"
               @virtual-scroll="onScroll"
               :columns="columns">
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td v-for="headerVal in columns"
                  :key="headerVal.name"
                  :props="props">
              <div v-if="headerVal.name === 'type'">
                {{ props.row.deposit === 0 ? 'Auszahlung' : 'Einzahlung' }}
              </div>
              <div v-else-if="headerVal.name === 'created_at'">
                {{ FormatDateTime(props.row[headerVal.name]) }}
              </div>
              <div v-else-if="headerVal.name === 'user_id'">
                {{ props.row.user?.first_name }} {{ props.row.user?.last_name }}
              </div>
              <div v-else-if="headerVal.name === 'amount'">
                ${{ props.row[headerVal.name] }}
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
import { onMounted, ref, watch } from 'vue'
import ICompanyBalanceTransaction from 'src/misc/interfaces/CompanyBalance/ICompanyBalanceTransaction'
import { api } from 'src/boot/axios'
import FormatDateTime from '../../../misc/functions/FormatDateTime'

const props = defineProps({
  companyId: {
    type: Number,
    required: true,
    default: 0
  },
  reloadInt: {
    type: Number,
    required: false,
    default: 0
  },
  fromExternal: {
    type: Boolean,
    required: false,
    default: false
  }
})
const loading = ref<boolean>(true)
const companyBalanceHistory = ref<ICompanyBalanceTransaction[]>([])
const nextPage = ref<number>(0)
const lastPage = ref<number>(Math.ceil(companyBalanceHistory.value?.length ?? 0 / 30))
const columns = [
  { name: 'user_id', label: 'Getätigt von', field: 'user_id' },
  { name: 'amount', label: 'Summe', field: 'amount' },
  { name: 'note', label: 'Notiz', field: 'note' },
  { name: 'type', label: 'Art', field: 'type' },
  { name: 'created_at', label: 'Datum', field: 'created_at' }
]
onMounted(() => {
  getHistory()
})
watch(() => props.companyId, () => {
  getHistory()
})
watch(() => props.reloadInt, () => {
  getHistory()
})
function getHistory () {
  if (props.companyId <= 0) return
  loading.value = true
  if (props.fromExternal) {
    api.get('/api/government/companyCompanyPayments?company_id=' + props.companyId + '&skip=0&take=30')
      .then((response) => {
        companyBalanceHistory.value = response.data.balanceHistory
        loading.value = false
      })
      .catch((error) => {
        console.error(error)
      })
  } else {
    api.get('/api/companyBalance/history/' + props.companyId + '?skip=0&take=30')
      .then((response) => {
        companyBalanceHistory.value = response.data.balanceHistory
        loading.value = false
      })
      .catch((error) => {
        console.error(error)
      })
  }
}
function onScroll (prop: { index: number, from: number, to: number, direction: string}) {
  const lastIndex = companyBalanceHistory.value?.length ?? 1 - 1
  if (!loading.value && nextPage.value < lastPage.value && prop.to === lastIndex) {
    loading.value = true
    if (props.fromExternal) {
      api.get('/api/government/companyCompanyPayments?company_id=' + props.companyId + '&skip=' + nextPage.value + '&take=30')
        .then((response) => {
          if (companyBalanceHistory.value === undefined) {
            companyBalanceHistory.value = []
          }
          companyBalanceHistory.value?.push(response.data.balanceHistory)
          loading.value = false
        })
        .catch((error) => {
          console.error(error)
        })
    } else {
      api.get('/api/companyBalance/history/' + props.companyId + '?skip=' + nextPage.value + '&take=30')
        .then((response) => {
          if (companyBalanceHistory.value === undefined) {
            companyBalanceHistory.value = []
          }
          companyBalanceHistory.value?.push(response.data.balanceHistory)
          loading.value = false
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }
}
</script>

<style scoped>

</style>
