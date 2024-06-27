<template>
  <q-card class="full-height">
    <q-card-section>
      <BalanceViewDateSpanSelectionComponent :default-start-date="companySetting?.balance_view_start_date"
                                             :duration="companySetting?.balance_view_time_span"
                                             @update-time-range="(val) => getAllUserStatistics(val.startingDate, val.endingDate)"
                                             :company-update-indicator="updateIndicator"
                                             v-if="companySetting !== undefined"/>
      <q-skeleton v-else
                  height="4em"
                  class="q-mb-sm"/>
      <q-separator class="q-mt-sm"/>
    </q-card-section>
    <q-card-section>
      <div class="hint-text">
        Umsatz = (Reingewinn - Artikel EK) - Steuern
      </div>
      <div class="hint-text">
        Gehalt = Mitarbeiteranteil + Trinkgeld
      </div>
    </q-card-section>
    <q-card-section>
      <div>
        <q-table
          class="default-table-height full-width cms-sticky-header-table"
          title="Bilanz Übersicht über alle Mitarbeiter/innen"
          no-data-label="Keine Daten vorhanden"
          loading-label="Daten werden abgerufen..."
          :columns="columns"
          :pagination="{ rowsPerPage: 20 }"
          :rows="userTransactions">
          <template v-slot:body="props">
            <q-tr :props="props" v-if="columns?.length > 0">
              <q-td v-for="headerVal in columns"
                    :key="headerVal.name"
                    :props="props">
                <div v-if="headerVal.name === 'user'">
                  {{ props.row.user.first_name }} {{ props.row.user.last_name }}
                </div>
                <div v-else-if="headerVal.name === 'tip'"
                     class="text-light-blue">
                  ${{ props.row.user.transactions?.reduce((acc, val) => acc + val.tip, 0)}}
                </div>
                <div v-else-if="headerVal.name === 'revenue'"
                     class="text-orange">
                  ${{ props.row.user.transactions?.reduce((acc, val) => acc + (val.total - val.tax), 0)}}
                </div>
                <div v-else-if="headerVal.name === 'user_share'"
                     class="text-deep-orange">
                  ${{ props.row.user.transactions?.reduce((acc, val) => acc + val.user_share_amount, 0)}}
                </div>
                <div v-else-if="headerVal.name === 'tax'"
                     class="text-red-7">
                  ${{ props.row.user.transactions?.reduce((acc, val) => acc + val.tax, 0)}}
                </div>
                <div v-else-if="headerVal.name === 'metro_cash_expenses'"
                     class="text-teal-4">
                  ${{ props.row.user.transactions?.reduce((acc, val) => val.type === 4 ? acc + val.total : acc + 0, 0)}}
                </div>
                <div v-else-if="headerVal.name === 'metro_card_expenses'"
                     class="text-teal-8">
                  ${{ props.row.user.transactions?.reduce((acc, val) => val.type === 5 ? acc + val.total : acc + 0, 0)}}
                </div>
                <div v-else-if="headerVal.name === 'refuel_expenses'"
                     class="text-brown">
                  ${{ props.row.user.transactions?.reduce((acc, val) => val.type === 6 ? acc + val.total : acc + 0, 0)}}
                </div>
                <div v-else-if="headerVal.name === 'user_always_share'"
                     class="text-green-7">
                  ${{ props.row.user.user_always_share ?? 0 }}
                </div>
                <div v-else-if="headerVal.name === 'salary'"
                     class="text-purple">
                  ${{ props.row.user.transactions?.reduce((acc, val) => acc + (val.user_share_amount + val.tip), 0)}}
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import BalanceViewDateSpanSelectionComponent
  from 'components/balanceView/DateSelection/BalanceViewDateSpanSelectionComponent.vue'
import { companyStore } from 'stores/companyStore'
import { api } from 'src/boot/axios'
import { ICompanySetting } from 'src/misc/interfaces/CompanySetting/ICompanySetting'
import IUserTransaction from 'src/misc/interfaces/Transaction/IUserTransaction'

export default defineComponent({
  name: 'AllEmployeesStatisticsComponent',
  components: { BalanceViewDateSpanSelectionComponent },
  setup () {
    const companySetting = ref<ICompanySetting | undefined>()
    const loading = ref(true)
    const company = companyStore()
    const companyId = computed(() => company.companyId)
    const userTransactions = ref<IUserTransaction[] | undefined>([])
    const updateIndicator = ref<number>(0)
    const columns = [
      { name: 'user', label: 'Mitarbeiter/in', field: 'user', sortable: true },
      { name: 'tip', label: 'Trinkgeld', field: 'tip' },
      { name: 'revenue', label: 'Umsatz', field: 'revenue' },
      { name: 'user_share', label: 'Mitarbeiter-Anteil', field: 'user_share' },
      { name: 'tax', label: 'Steuern', field: 'tax' },
      { name: 'metro_cash_expenses', label: 'Metro Bargeld', field: 'metro_cash_expenses' },
      { name: 'metro_card_expenses', label: 'Metro Karte', field: 'metro_card_expenses' },
      { name: 'refuel_expenses', label: 'Tanken', field: 'refuel_expenses' },
      { name: 'user_always_share', label: 'Immer Anteil', field: 'user_always_share' },
      { name: 'salary', label: 'Gehalt', field: 'salary' }
    ]
    onMounted(async () => {
      getDefaultTime()
    })
    watch(companyId, () => {
      getDefaultTime()
      updateIndicator.value++
    })
    function getAllUserStatistics (startDate: string | Date, endingDate: string | Date) {
      if (companyId.value <= 0 && companySetting.value !== undefined) return
      api.get('/api/balanceView/all/' + companyId.value + '?start_date=' + startDate + '&end_date=' + endingDate)
        .then((response) => {
          userTransactions.value = []
          userTransactions.value?.push(...response.data.company_owners)
          userTransactions.value?.push(...response.data.company_users)
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function getDefaultTime () {
      if (companyId.value <= 0) return
      api.get('/api/companySettings/balance/reduced/' + companyId.value)
        .then((response) => {
          companySetting.value = response.data.companySettings[0]
          if (companySetting.value !== undefined) {
            companySetting.value.balance_view_start_date = new Date(companySetting.value.balance_view_start_date).toString()
          }
        })
        .catch((error) => {
          console.error(error)
        })
    }
    return {
      loading,
      columns,
      userTransactions,
      companySetting,
      getAllUserStatistics,
      updateIndicator
    }
  }
})
</script>

<style scoped>

</style>
