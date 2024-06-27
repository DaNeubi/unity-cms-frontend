<template>
  <q-tab-panel :name="`${ name }`">
    <div class="row">
      <q-table class="default-table-height full-width col-12 cms-sticky-header-table"
               no-data-label="Keine Daten vorhanden"
               loading-label="Daten werden abgerufen..."
               :rows="values.weeks"
               v-if="canViewMonthTable"
               :columns="columns">
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td v-for="headerVal in columns"
                  :key="headerVal.name"
                  :props="props">
              <div v-if="headerVal.name === 'date'">
                {{ FormatDateTime(props.row.startDate, true) }} - {{ FormatDateTime(props.row.endDate, true) }}
              </div>
              <div v-if="headerVal.name === 'total'">
                ${{ props.row.total}}
              </div>
              <div v-if="headerVal.name === 'tax'">
                ${{ props.row.tax}}
              </div>
              <div v-if="headerVal.name === 'discount_amount'">
                ${{ props.row.discount_amount }}
              </div>
              <div v-if="headerVal.name === 'expenses'">
                ${{ props.row.expenses }}
              </div>
              <div v-if="headerVal.name === 'payout_full'">
                ${{ props.row.userPaymentShare + props.row.userPaymentTip }}
              </div>
              <div v-if="headerVal.name === 'payout_share'">
                ${{ props.row.userPaymentShare }}
              </div>
              <div v-if="headerVal.name === 'payout_tip'">
                ${{ props.row.userPaymentTip }}
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <div class="col-12 q-mt-md">
      <div class="text-h4"
           v-if="canViewMonthRevenue">
        Umsatz für den Monat {{ name }}: ${{ values.weeks.reduce((partialSum, singleWeek) => partialSum + singleWeek.total, 0) }}
      </div>
    </div>
    <div class="col-12">
      <div class="text-h5"
           v-if="canViewMonthTax">
        Steuern für den Monat {{ name }}: ${{ values.weeks.reduce((partialSum, singleWeek) => partialSum + singleWeek.tax, 0) }}
      </div>
    </div>
  </q-tab-panel>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import FormatDateTime from '../../../../misc/functions/FormatDateTime'
import ICompanyStatisticsYearTableMonth from 'src/misc/interfaces/CompanyStatistics/ICompanyStatisticsYearTableMonth'

export default defineComponent({
  name: 'CompanyStatisticsTabContentComponent',
  methods: { FormatDateTime },
  components: {},
  props: {
    name: {
      type: String,
      required: true
    },
    values: {
      type: Object as () => ICompanyStatisticsYearTableMonth,
      required: true
    },
    canViewMonthTable: {
      type: Boolean,
      required: true,
      default: false
    },
    canViewMonthRevenue: {
      type: Boolean,
      required: true,
      default: false
    },
    canViewMonthTax: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  setup () {
    const loading = ref(true)
    const columns = [
      { name: 'date', label: 'Datum', field: 'date' },
      { name: 'total', label: 'Umsatz', field: 'total' },
      { name: 'tax', label: 'Steuern', field: 'tax' },
      { name: 'expenses', label: 'Ausgaben', field: 'expenses' },
      { name: 'discount_amount', label: 'Rabatte', field: 'discount_amount' },
      { name: 'payout_full', label: 'Gesamte Mitarbeiterauszahlung', field: 'payout_full' },
      { name: 'payout_share', label: 'Mitarbeiteranteilauszahlung', field: 'payout_share' },
      { name: 'payout_tip', label: 'Trinkgeldauszahlung', field: 'payout_tip' }
    ]
    return {
      columns,
      loading
    }
  }
})
</script>

<style scoped>

</style>
