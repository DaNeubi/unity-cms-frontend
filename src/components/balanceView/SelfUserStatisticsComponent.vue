<template>
  <q-card>
    <q-card-section>
      <BalanceViewDateSpanSelectionComponent :default-start-date="companySetting?.balance_view_start_date"
                                             :duration="companySetting?.balance_view_time_span"
                                             @update-time-range="(val) => getSelfUserStatistics(val.startingDate, val.endingDate)"
                                             :company-update-indicator="updateIndicator"
                                             v-if="companySetting !== undefined"/>
      <q-skeleton v-else
                  height="4em"
                  class="q-mb-sm"/>
      <q-separator class="q-mt-sm"/>
    </q-card-section>
    <q-card-section>
      <div>
        <div class="q-mb-sm text-h6">
          Hier siehst du deine Statistiken für den ausgewählten Zeitraum.
        </div>
        <q-table
          class="full-width cms-sticky-header-table"
          title="Deine eigene Bilanz Übersicht"
          no-data-label="Keine Daten vorhanden"
          loading-label="Daten werden abgerufen..."
          :columns="columns"
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
                     class="text-teal-8">
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
    <q-card-section>
      <div class="col">
        <div class="text-h6">
          Dein Gehalt zur nächsten Auszahlung:
            <span class="text-purple"><u>${{ userSalary }}<q-tooltip>
                <div class="col text-body2">
                    <div class="col-12">
                        Trinkgeld: ${{ userBalanceCurrent?.current_tip ?? 0 }}
                    </div>
                    <div class="col-12">
                        Anteil: ${{ userBalanceCurrent?.current_share ?? 0 }}
                    </div>
                    <div class="col-12">
                        Manuelles Trinkgeld: ${{ userBalanceCurrent?.manually_added_tip ?? 0 }}
                    </div>
                    <div class="col-12">
                        Manueller Anteil: ${{ userBalanceCurrent?.manually_added_share ?? 0 }}
                    </div>
                </div>
            </q-tooltip></u></span>
        </div>
      </div>
    </q-card-section>
    <q-card-section>
      <q-table
        class="full-width cms-sticky-header-table"
        title="Deine Auszahlungen"
        no-data-label="Keine Auszahlungen vorhanden"
        loading-label="Daten werden abgerufen..."
        :columns="payoutColumns"
        :loading="loadingPayout"
        virtual-scroll
        :virtual-scroll-item-size="30"
        :virtual-scroll-sticky-size-start="30"
        :pagination="{ rowsPerPage: 30 }"
        :rows-per-page-options="[0]"
        @virtual-scroll="onScroll"
        :rows="userPayouts">
        <template v-slot:body="props">
          <q-tr :props="props" v-if="payoutColumns?.length > 0">
            <q-td v-for="headerVal in payoutColumns"
                  :key="headerVal.name"
                  :props="props">
              <div v-if="headerVal.name === 'actual_payout'">
                ${{ props.row.payment_tip + props.row.payment_share + props.row.manually_added_payment_share + props.row.manually_added_payment_tip }}
              </div>
              <div v-else-if="headerVal.name === 'payment_tip'">
                ${{ props.row[headerVal.name] }}
              </div>
              <div v-else-if="headerVal.name === 'payment_share'">
                ${{ props.row[headerVal.name] }}
              </div>
              <div v-else-if="headerVal.name === 'user_making'">
                ${{ props.row.user_making.first_name }} {{ props.row.user_making.last_name }}
              </div>
              <div v-else-if="headerVal.name === 'created_at'">
                {{ FormatDateTime(props.row[headerVal.name]) }}
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import BalanceViewDateSpanSelectionComponent
  from 'components/balanceView/DateSelection/BalanceViewDateSpanSelectionComponent.vue'
import { ICompanySetting } from 'src/misc/interfaces/CompanySetting/ICompanySetting'
import { companyStore } from 'stores/companyStore'
import IUserTransaction from 'src/misc/interfaces/Transaction/IUserTransaction'
import { api } from 'boot/axios'
import IUserBalanceCurrent from 'src/misc/interfaces/User/IUserBalanceCurrent'
import FormatDateTime from '../../misc/functions/FormatDateTime'
import IUserPayment from 'src/misc/interfaces/User/IUserPayment'

export default defineComponent({
  name: 'SelfUserStatisticsComponent',
  methods: { FormatDateTime },
  components: { BalanceViewDateSpanSelectionComponent },
  setup () {
    const companySetting = ref<ICompanySetting | undefined>()
    const loading = ref<boolean>(true)
    const loadingPayout = ref<boolean>(false)
    const company = companyStore()
    const companyId = computed(() => company.companyId)
    const userTransactions = ref<IUserTransaction[] | undefined>([])
    const updateIndicator = ref<number>(0)
    const userBalanceCurrent = ref<IUserBalanceCurrent | undefined>(undefined)
    const userPayouts = ref<IUserPayment[] | undefined>([])
    const nextPage = ref<number>(0)
    const lastPage = ref<number>(Math.ceil(userPayouts.value?.length ?? 0 / 30))
    const userSalary = computed(() => {
      if (userBalanceCurrent.value === undefined) return 0
      return userBalanceCurrent.value?.current_tip + userBalanceCurrent.value?.current_share + userBalanceCurrent.value?.manually_added_share + userBalanceCurrent.value?.manually_added_tip
    })
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
    const payoutColumns = [
      { name: 'actual_payout', label: 'Komplettes Gehalt', field: 'actual_payout' },
      { name: 'payment_tip', label: 'Davon Trinkgeld', field: 'payment_tip' },
      { name: 'payment_share', label: 'Davon Anteile', field: 'payment_share' },
      { name: 'user_making', label: 'Ausgezahlt von', field: 'user_making' },
      { name: 'created_at', label: 'Ausgezahlt am', field: 'created_at' }
    ]
    onMounted(async () => {
      getDefaultTime()
      getCurrentSalary()
      getInitialPayouts()
    })
    watch(companyId, () => {
      getDefaultTime()
      updateIndicator.value++
      getCurrentSalary()
      getInitialPayouts()
    })
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
    function getCurrentSalary () {
      if (companyId.value <= 0) return
      api.get('/api/balanceView/self/salary/' + companyId.value)
        .then((response) => {
          userBalanceCurrent.value = response.data.user_balance_current[0]
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function getSelfUserStatistics (startDate: string | Date | undefined, endingDate: string | Date | undefined) {
      if (companyId.value <= 0 || companySetting.value === undefined) return
      if (startDate === undefined || endingDate === undefined) return
      api.get('/api/balanceView/self/' + companyId.value + '?start_date=' + startDate + '&end_date=' + endingDate)
        .then((response) => {
          // clear the old data
          userTransactions.value = []
          userTransactions.value?.push(response.data.company_user)
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function getInitialPayouts () {
      if (companyId.value <= 0) return
      api.get('/api/payout/self/amount/' + companyId.value + '?skip=0&take=30')
        .then((response) => {
          userPayouts.value = response.data.payouts
        })
        .catch((error) => {
          console.error(error)
        })
    }
    function onScroll (props: { index: number, from: number, to: number, direction: string}) {
      const lastIndex = userPayouts.value?.length ?? 1 - 1
      if (!loadingPayout.value && nextPage.value < lastPage.value && props.to === lastIndex) {
        loadingPayout.value = true
        if (companyId.value <= 0) return
        api.get('/api/payout/self/amount/' + companyId.value + '?skip=' + nextPage.value + '&take=30')
          .then((response) => {
            if (userPayouts.value === undefined) {
              userPayouts.value = []
            }
            userPayouts.value?.push(response.data.payouts)
            loadingPayout.value = false
          })
          .catch((error) => {
            console.error(error)
          })
      }
    }
    return {
      loading,
      columns,
      companySetting,
      userTransactions,
      updateIndicator,
      getSelfUserStatistics,
      userSalary,
      userBalanceCurrent,
      payoutColumns,
      loadingPayout,
      userPayouts,
      onScroll
    }
  }
})
</script>
